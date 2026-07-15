import dtrack
import email.utils
import email_validator
import flock
import http 
import io
import json
import log
import multipart
import os
import sys
import tomllib
import traceback
import urllib.parse
import gettext

from .accessctrl import AccessCtrl

class App:
    """ aw light weight blog system """


    def __init__(self):
        """ consturctor """
        self.mem_limit = 1024 ** 2
        self.setup_dispatcher()
        self.init_gettext()

    def setup_dispatcher(self):
        """ setup command dispatcher """
        self.handler = {
            'create-content': self.create_content,
            'edit-content': self.edit_content,
            'update-content': self.update_content,
            'update-header': self.update_header,
            'get-content': self.get_content,
            'get-header': self.get_header,
            'commit': self.commit,
            'get-history': self.get_history_oids,
            'list-commit': self.list_commit,
            'is-editing': self.is_editing,
            'list-release-id': self.list_release_id,
            'list-editing-id': self.list_editing_id,
            'list-content': self.list_content
        }

    def init_gettext(self):
        """ init gettext """
        gettext.bindtextdomain("awblog", self.gettext_domain_dir)

    def load_config_from_env(self):
        """ load config from environment """ 
        config = os.getenv('AWBLOG_CONFIG') 
        if config is not None:
            self.load_config(config)     

    def load_config(self, config_path: str | Path):
        """ load configuration """
        with open(config_path, "rb") as fp:
            config = tomllib.load(fp)
            self._access_lock_file = config["lock-file"] 
            self._gettext_domain_dir = config["gettext-domain-dir"]

    @property
    def dtrack_app(self):
        """ data tracking application """
        if not "_dtrack_app" in self.__dict__:
            dtrack_app = dtrack.App()
            dtrack_app.load_from_env()
            self._dtrack_app = dtrack_app
        return self._dtrack_app

    @property
    def access_ctrl(self):
        """ access control object """
        if not "_access_ctrl" in self.__dict__:
            access_ctrl = AccessCtrl()
            access_ctrl.load_setting()
            self._access_ctrl = access_ctrl
        return self._access_ctrl

    @property
    def access_lock_file(self):
        """ file path to prevent from multiple access"""
        if not "_access_lock_file" in self.__dict__:
            self.load_config_from_env()
        return self._access_lock_file

    @property
    def gettext_domain_dir(self):
        """ gettext domain directory """
        if not "_gettext_domain_dir" in self.__dict__:
            self.load_config_from_env()
        return self._gettext_domain_dir

    def set_response(
            self, start_response,
            code: int,
            phrase: str | None,
            headers: list):
        """ set status response into start response """
        msg = None
        if phrase:
            msg = f"{code} {phrase}"
        else:
            msg = f"{code}"
        return start_response(msg, headers) 

    def get_content_id(self, params: dict):
        """ get content id from params """
        content_id_str = None
        if 'content-id' in params and len(params['content-id']):
            content_id_str = params['content-id'][0]
        result = None
        if content_id_str:
            try:
                result = int(content_id_str)
            except ValueError:
                pass
        return result
    def get_request_content_type(self, params: dict):
        """ get content type """ 
        return 'release' if not 'edit' in params else 'edit'

    def get_author_and_email(self, environ, params: dict):
        """ get author and email """
        author = None
        email_addr = None
        error_msg = None
        if "email" in params and params["email"]:
            author, email_addr = email.utils.parseaddr(params["email"])
        if "author" in params and params["author"]:
            author = params["author"]
        if email_addr:
            try:
                email_info = email_validator.validate_email(
                        email_addr, check_deliverability = False)
                email_addr = email_info.normalized
            except:
                error_msg = f"'{email_addr}' is not acceped as email address" 
                email_addr = None
                log.Log.print_log_warn_into_stream(
                    environ['wsgi.errors'],
                    repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                    environ['wsgi.errors'],
                    traceback.format_exc())
        return author, email_addr, error_msg 

    def run(self, environ, start_response):
        """ handle request as wsgi """

        query = environ['QUERY_STRING']

        params = {}
        if query:
            params = urllib.parse.parse_qs(query)

        result = []
        if 'action' in params \
                and len(params['action']) \
                and params['action'][0] in self.handler:
            result = self.handler[params['action'][0]](
                    environ, start_response, params)
        else:
            result = self.handle_no_action(environ, start_response, params)
        return result

    def handle_no_action(self, environ, start_response, params: dict):
        code = http.HTTPStatus.BAD_REQUEST
        phrase = http.HTTPStatus.BAD_REQUEST.phrase
        start_response(f"{code} {phrase}",
                [])
        msg = "The request has no action."
        log.Log.print_log_warn_into_stream(environ['wsgi.errors'], msg)
        return []

    def response_access_denied(self, start_response, msg):
        """ response not allowed access """
        write = self.set_response(
                start_response,
                http.HTTPStatus.ACCEPTED,
                http.HTTPStatus.ACCEPTED.phrase,
                [("content-type", "application/json")])
        res = {
            'status': 'NG',
            'message': msg
        }
        write(json.dumps(res).encode())
        return []

    def create_content(self, environ, start_response, params: dict):
        """ create content """
        result = []
        if self.access_ctrl.allow_access(environ, params):
            res = {}
            content_id = self.dtrack_app.create_content_for_editing()
            if content_id:
                write = self.set_response(
                        start_response,
                        http.HTTPStatus.OK,
                        http.HTTPStatus.OK.phrase,
                        [("content-type", "application/json")])

                res = {
                    'content-id': content_id,
                    'status': 'OK'
                }
            else:
                write = self.set_response(
                        start_responnse,
                        http.HTTPStatus.ACCEPTED,
                        http.HTTPStatus.ACCEPTED.phrase,
                        [("content-type", "application/json")])
                res = {
                    'status': 'NG',
                    'message': gettext.dgettext(
                        'awblog','Cannot create content')
                }
            write(json.dumps(res).encode())
        else:
            self.response_access_denied(start_response, \
                    'Not allow to create content')
        return result
    def edit_content(self, environ, start_response, params: dict):
        """ create content for editing """
        if self.access_ctrl.allow_access(environ, params):
            result = []
            content_id = self.get_content_id(params)
            try:
                if content_id is not None:
                    with open(self.access_lock_file, "r+") as fp:
                        flock.acquire_lock(fp)
                        content_exists = self.dtrack_app.content_editing_exists(
                            content_id)
                        if not content_exists: 
                            self.dtrack_app.create_edit_content_from_id(
                                content_id)
                            res = {
                                "status": "OK"
                            }
                        else:
                            res = {
                                "status": "OK",
                                "message": 
                                    gettext.dgettext(
                                        "awblog", "Content is being editing")
                            }
                        flock.release_lock(fp)
                    writer = self.set_response(
                            start_response,
                            http.HTTPStatus.OK,
                            http.HTTPStatus.OK.phrase,
                            [("Content-Type", "application/json")])
                    writer(json.dumps(res).encode()) 
                else:
                    self.response_access_denied(start_response, 'No content id')
            except:
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                        [])
        else:
            self.response_access_denied(start_response, 
                    'Not allow to edit content')
             
        return []
        
    def update_content(self, environ, start_response, params: dict):
        """ update content """
        result = []
        if self.access_ctrl.allow_access(environ, params):
              
            result = []
            content_id = self.get_content_id(params)
            if content_id is not None:
                content_type, options = multipart.parse_options_header(
                        environ["CONTENT_TYPE"])
 
                if content_type == "multipart/form-data" \
                        and 'boundary' in options:
                    result = self.update_content_with_multipart(
                        environ, start_response, params, content_id, options) 
                elif content_type == 'application/x-www-form-urlencoded':
                    result = self.update_content_with_form_urlencoded(
                        environ, start_response, params, content_id)
                else:
                    self.set_response(start_response,
                        http.HTTPStatus.BAD_REQUEST,
                        http.HTTPStatus.BAD_REQUEST.phrase,
                        [])
            else:
               self.set_response(start_response,
                    http.HTTPStatus.BAD_REQUEST,
                    http.HTTPStatus.BAD_REQUEST.phrase,
                    [])
        else:
            result = self.response_access_denied(start_response, \
                    'Not allow to update content')
        return result

    def update_content_with_multipart(
            self, environ, start_response, params: dict,
            content_id: int, multipart_options):
        """ update content with multipart """
        stream = environ["wsgi.input"]
        boundary = multipart_options["boundary"]
        content_length = -1
        if 'CONTENT_LENGTH' in environ:
            content_length = int(environ['CONTENT_LENGTH'])
 
        parser = multipart.MultipartParser(stream, boundary, content_length)

        wrote_content = False
        for part in parser:
            if part.filename and not wrote_content:
                wrote_content = True
                log.Log.print_log_info(
                        environ,
                        f"update content({content_id}) with {part.filename}")
                self.dtrack_app.update_content(
                        content_id,
                        part.file)
     
            part.close()
        writer = self.set_response(
                start_response, 
                http.HTTPStatus.OK,
                http.HTTPStatus.OK.phrase,
                [("Content-Type", "application/json")])    
        res = {
            'content-id': content_id,
            'status': 'OK' if wrote_content else 'NG'
        }
        writer(json.dumps(res).encode())
        return []

    def update_content_with_form_urlencoded(
            self, environ, start_response, params: dict,
            content_id: int):
        """ update content with multipart """
        content_length = self.mem_limit
        if 'CONTENT_LENGTH' in environ:
            content_length = int(environ['CONTENT_LENGTH'])

        max_read = min(self.mem_limit, content_length)
        stream = environ["wsgi.input"]
        data = stream.read(max_read).decode()

        form_data = urllib.parse.parse_qs(data)
        wrote_content = False
        if 'content' in form_data:
            content = "\n".join(form_data['content'])
            log.Log.print_log_info(
                    environ, f"update content({content_id})")
            self.dtrack_app.update_content(
                    content_id,
                    io.BytesIO(content.encode()))
            wrote_content = True

        writer = self.set_response(
                start_response, 
                http.HTTPStatus.OK,
                http.HTTPStatus.OK.phrase,
                [("Content-Type", "application/json")])    
        res = {
            'content-id': content_id,
            'status': 'OK' if wrote_content else 'NG'
        }
        writer(json.dumps(res).encode())
        return []

 
    def update_header(self, environ, start_response, params: dict):
        """ update header """
        if self.access_ctrl.allow_access(environ, params):
            result = []
            content_id = self.get_content_id(params)
            if content_id is not None:
                content_type = None

                header = None
                if "CONTENT_TYPE" in environ:
                    content_type = environ["CONTENT_TYPE"]
                if content_type == 'application/json':
                    max_read = None
                    if 'CONTENT_LENGTH' in environ:
                        content_length = int(environ['CONTENT_LENGTH'])
                        max_read = min(self.mem_limit, content_length)
                    if max_read:
                        stream = environ["wsgi.input"]
                        header = json.loads(stream.read(max_read).decode())
                if header is not None:
                    try:
                        self.dtrack_app.update_header(
                            content_id, header)
                        writer = self.set_response(
                                start_response, 
                                http.HTTPStatus.OK,
                                http.HTTPStatus.OK.phrase,
                                [("Content-Type", "application/json")])    
                        res = {
                            'content-id': content_id,
                            'status': 'OK'
                        }
                        writer(json.dumps(res).encode()) 
                    except:
                        writer = self.set_response(
                                start_response,
                                http.HTTPStatus.NO_CONTENT,
                                http.HTTPStatus.NO_CONTENT.phrase,
                                [])
                        log.Log.print_log_warn_into_stream(
                            environ['wsgi.errors'],
                            repr(sys.exception()))
                        log.Log.print_log_warn_into_stream(
                                environ['wsgi.errors'],
                                traceback.format_exc())
                        res = {
                            'content-id': content_id,
                            'status': 'NG'
                        }
                        writer(json.dumps(res).encode()) 
                else:
                    self.set_response(start_response,
                        http.HTTPStatus.BAD_REQUEST,
                        http.HTTPStatus.BAD_REQUEST.phrase,
                        [])
            else:
                self.response_access_denied(start_response, 'No content id') 
        else:
            self.response_access_denied(start_response, \
                'Not allow to update header')
        return [] 
    def get_content(self, environ, start_response, params: dict):
        """ get content """
        if self.access_ctrl.allow_access(environ, params):
            content_id = self.get_content_id(params)
            try:
                if content_id:
                    content_type = self.get_request_content_type(params)    
                    with io.BytesIO() as bfstrm:
                        writer = None
                        def handle_header(content_header):
                            headers = []
                            if 'content-type' in content_header.header:
                                content_type = content_header['content-type']
                                headers.append(("Content-Type", content_type)) 
                            nonlocal writer 
                            writer = self.set_response(
                                    start_response,
                                    http.HTTPStatus.OK,
                                    http.HTTPStatus.OK.phrase,
                                    headers)
                            return bfstrm

                        if 'release' == content_type:
                            self.dtrack_app.get_content(
                                    content_id, handle_header)
                        else:
                            self.dtrack_app.get_content_editing(
                                    content_id, handle_header)
                        buf = bfstrm.getvalue()
                        writer(buf) 
                        
                else:
                    self.response_access_denied(start_response, 'No content id') 
            except:
                self.set_response(
                        start_response,
                        http.HTTPStatus.NO_CONTENT,
                        http.HTTPStatus.NO_CONTENT.phrase,
                        [])
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())

        return [] 
   
    def get_header(self, environ, start_response, params: dict):
        """ get header """
        if self.access_ctrl.allow_access(environ, params):
            content_id = self.get_content_id(params)
            try:
                if content_id:
                    content_type = self.get_request_content_type(params)    
                    content_header = None
                    if 'release' == content_type:
                        content_header = self.dtrack_app.get_header(
                                content_id)
                    else:
                        content_header = self.dtrack_app.get_header_editing(
                                content_id)
                    writer = self.set_response(
                            start_response,
                            http.HTTPStatus.OK,
                            http.HTTPStatus.OK.phrase,
                            [("Content-Type", "application/json")])
                    writer(json.dumps(content_header.header).encode()) 
                else:
                    self.response_access_denied(start_response, 'No content id') 
            except:
                self.set_response(
                        start_response,
                        http.HTTPStatus.NO_CONTENT,
                        http.HTTPStatus.NO_CONTENT.phrase,
                        [])
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())

        return [] 
    def commit(self, environ, start_response, params: dict):
        """ commit """
        if self.access_ctrl.allow_access(environ, params):
            content_id = self.get_content_id(params)
            try:
                if content_id:
                    author, email_addr, email_err = self.get_author_and_email(
                            environ, params)
                    if author and email_addr:
                        delete_editing = 'delete' in params
                        content_header = None
                        with open(self.access_lock_file, "r+") as fp:
                            flock.acquire_lock(fp)
                            self.dtrack_app.commit(
                                content_id, delete_editing, author, email_addr)
                            flock.release_lock(fp)


                        writer = self.set_response(
                                start_response,
                                http.HTTPStatus.OK,
                                http.HTTPStatus.OK.phrase,
                                [("Content-Type", "application/json")])
                        res = {
                            "status": "OK"
                        }
                        writer(json.dumps(res).encode())
                    else:
                        writer = self.set_response(
                                start_response,
                                http.HTTPStatus.ACCEPTED,
                                http.HTTPStatus.ACCEPTED.phrase,
                                [("Content-Type", "application/json")])
                        msg = None
                        if not author and email_addr:
                            msg = gettext.dgettext(
                                    "awblog",
                                    "Commit requires an author")
                        elif author and not email_addr:
                            if not email_err:
                                msg = gettext.dgettext(
                                        "awblog", 
                                        "Commit orequires an email")
                            else:
                                msg = email_err
                        else:
                            if not email_err:
                                msg = gettext.dgettext(
                                    "awblog",
                                    "Commit requires both an author and an email")
                            else:
                                msg = email_err
                        res = {
                            "status": "NG",
                            "message": msg
                        }
                        writer(json.dumps(res).encode())
                else:
                    self.response_access_denied(
                        start_response,
                        gettext.dgettext(
                            "awblog", "No content ID"))
            except:
                self.set_response(
                        start_response,
                        http.HTTPStatus.BAD_REQUEST,
                        http.HTTPStatus.BAD_REQUEST.phrase,
                        [])
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
        else:
            self.response_access_denied(start_response, \
                gettext.dgettext("awblog", "Commit is not allowed"))
        return []
 
    def get_history_oids(self, environ, start_response, params: dict):
        """ get history object ids """
        if self.access_ctrl.allow_access(environ, params):
            cnt_id = self.get_content_id(params)
            try:
                if cnt_id:
                    oids = [
                        x for x in self.dtrack_app.iterate_history_of_id(cnt_id)
                    ]

                    writer = self.set_response(
                            start_response,
                            http.HTTPStatus.OK,
                            http.HTTPStatus.OK.phrase,
                            [("Content-Type", "application/json")])
                    res = {
                        "status": "OK",
                        "oids": oids
                    }
                    writer(json.dumps(res).encode())
                else:
                    self.response_access_denied(
                        start_response,
                        gettext.dgettext("awblog", "No content id"))
            except:

                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.BAD_REQUEST,
                        http.HTTPStatus.BAD_REQUEST.phrase,
                        [])
        return []

    def list_commit(self, environ, start_response, params: dict):
        """ list commit """
        if self.access_ctrl.allow_access(environ, params):
            try:
                tree_oid = None
                for oid in self.dtrack_app.iterate_commit_tree():
                    tree_oid = oid
                    break
                items = []
                if tree_oid:
                    items = [
                        x for x in self.dtrack_app.iterate_tree_items(tree_oid)
                    ]
                writer = self.set_response(
                        start_response,
                        http.HTTPStatus.OK,
                        http.HTTPStatus.OK.phrase,
                        [("Content-Type", "application/json")])
                res = {
                    "status": "OK",
                    "items": items
                }
                writer(json.dumps(res).encode())
            except:
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                        [])

        return []
    def is_editing(self, environ, start_response, params: dict):
        """ query editing the specified content id"""
        if self.access_ctrl.allow_access(environ, params):
            cnt_id = self.get_content_id(params)
            try:
                if cnt_id:
                    content_exists = self.dtrack_app.content_editing_exists(
                        cnt_id)

                    writer = self.set_response(
                            start_response,
                            http.HTTPStatus.OK,
                            http.HTTPStatus.OK.phrase,
                            [("Content-Type", "application/json")])
                    res = {
                        "status": "OK",
                        "editing": True if content_exists else False
                    }
                    writer(json.dumps(res).encode())
     
                else:
                    self.response_access_denied(
                        start_response,
                        gettext.dgettext("awblog", "No content id"))
            except:
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                        [])
        return []

    def list_release_id(self, environ, start_response, params: dict):
        """ list release id"""
        if self.access_ctrl.allow_access(environ, params):
            try:
                write = self.set_response(
                        start_response,
                        http.HTTPStatus.ACCEPTED,
                        http.HTTPStatus.ACCEPTED.phrase,
                        [("content-type", "application/json")])
     
                
                res = {
                    'ids': [x for x in self.dtrack_app.list_content_id()],
                    'status': 'OK'
                }
                write(json.dumps(res).encode())
            except:
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                        [])

 
        return []
 
    def list_editing_id(self, environ, start_response, params: dict):
        """ list editing id"""
        if self.access_ctrl.allow_access(environ, params):
            try:
                write = self.set_response(
                        start_response,
                        http.HTTPStatus.ACCEPTED,
                        http.HTTPStatus.ACCEPTED.phrase,
                        [("content-type", "application/json")])
                
                res = {
                    'ids': [
                        x for x in self.dtrack_app.list_editing_content_id()
                    ],
                    'status': 'OK'
                }
                write(json.dumps(res).encode())
            except:
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                        [])

        return []

    def list_content(self, environ, start_response, params: dict):
        """ list content information  """
        if self.access_ctrl.allow_access(environ, params):
            try:
                tree_oid = None
                for oid in self.dtrack_app.iterate_commit_tree():
                    tree_oid = oid
                    break
                commit_items = []
                if tree_oid:
                    commit_items = [
                        x for x in self.dtrack_app.iterate_tree_items(tree_oid)
                    ]
                editing_ids = [
                    x for x in self.dtrack_app.list_editing_content_id()
                ]
                release_ids = [
                    x for x in self.dtrack_app.list_content_id()
                ]
                res = {
                    'commits': commit_items,
                    'release': release_ids,
                    'editing': editing_ids,
                    'status': 'OK'
                }
                write = self.set_response(
                        start_response,
                        http.HTTPStatus.ACCEPTED,
                        http.HTTPStatus.ACCEPTED.phrase,
                        [("content-type", "application/json")])
                write(json.dumps(res).encode())
            except:
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        repr(sys.exception()))
                log.Log.print_log_warn_into_stream(
                        environ['wsgi.errors'],
                        traceback.format_exc())
                self.set_response(
                        start_response,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                        [])

        return []
 
# vi: se ts=4 sw=4 et:
