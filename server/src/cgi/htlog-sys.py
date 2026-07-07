#! /usr/bin/python3

import http
import os
import pathlib
import sys
import urllib.parse
import log


class Service:
    """ manage system service """

    def __init__(self):
        self.setup_dispatcher()

    def setup_dispatcher(self):
        """ setup command dispatcher """
        self.handler = {
            'init': self.sys_init,
            'write-log': self.sys_write_log,
            'read-log': self.sys_read_log
        }


    def run(self):
        query = os.getenv('QUERY_STRING')

        params = {}
        if query:
            params = urllib.parse.parse_qs(query)

        if 'action' in params and params['action'][0] in self.handler:
            self.handler[params['action'][0]](params)
        else:
            self.handle_no_action()
    def handle_no_action(self):
        """ response no action """
        self.send_bad_request()

    def send_bad_request(self):
        """ send bad request"""
        self.write_status_line(
            http.HTTPStatus.BAD_REQUEST,
            http.HTTPStatus.BAD_REQUEST.phrase)
        sys.stdout.write('\n')
        sys.stdout.flush()

    def send_not_acceptable(self):
        """ response not acceptable """
        self.write_status_line(
            http.HTTPStatus.NOT_ACCEPTABLE,
            http.HTTPStatus.NOT_ACCEPTABLE.phrase)
        sys.stdout.write('\n')
        sys.stdout.flush()

    def send_internal_error(self):
        """ response internal server error"""
 
        self.write_status_line(
            http.HTTPStatus.INTERNAL_SERVER_ERROR,
            http.HTTPStatus.INTERNAL_SERVER_ERROR.phrase)
        sys.stdout.write('\n')
        sys.stdout.flush()


    def run_with_secret(self, params: dict, action):
        """ run action if request has secret key """
        secret = self.get_secret_from_path()
        if secret is not None:
            if "secret" in params and secret == params["secret"][0]:
                action(params)
            else:
                self.send_not_acceptable() 
        else:
           self.send_not_acceptable() 

    def write_status_line(self, code: int, status_phrase: str=None):
        """ write status code into stdout """ 
 
        status_line = f"Status:  {code}" 
        if status_phrase:
            status_line += f" {status_phrase}\n"
        else:
            status_line += "\n"
        sys.stdout.write(status_line)
 

    def sys_init(self, params: dict):
        """ initialize system """
        self.run_with_secret(params, self.sys_init_impl)

    def sys_init_impl(self, params: dict):
        """ initialize system """

        state = self.create_logpath()
        if state:
            state = self.create_dtrack_conf()
        if state:
            state = self.create_weblog_config()
        if state:
            state = self.create_weglog_access_ctrl_config()
        if state:
            self.write_status_line(
                http.HTTPStatus.OK,
                http.HTTPStatus.OK.phrase)
            sys.stdout.write('\n')
            sys.stdout.flush()
        else:
            self.send_internal_error()


    def create_logpath(self):
        """ create log directory """
        logfile = log.Log.get_log_path(dict(os.environ.items()))
        
        result = False
        if logfile:
            logpath = logfile.parent
            logpath.mkdir(mode=0o755, parents=True, exist_ok=True)
            result = True 
        return result

    def create_dtrack_conf(self):
        """ create dtrack directory """
        config = os.getenv("DTRACK_CONFIG")
        docroot = os.getenv("DOCUMENT_ROOT")

        result = False
        if config and docroot:
            config = pathlib.Path(config)
            if not config.is_file():
                stream_chunk_size = 1024 ** 2
                contents_dir = pathlib.Path(docroot) / 'contents'
                config.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
                contents_dir.mkdir(mode=0o755, parents=True, exist_ok=True)
                config_str = \
f"""tracking-dir = "{docroot}/contents/repository"
release-template-path = "{docroot}/contents/{{id}}"
edit-template-path = "{docroot}/contents/{{id}}-editing"
id-management-path = "{docroot}/contents/idx.txt"
stream-chunk-size = {stream_chunk_size}
"""
                config.write_text(config_str)
            result = True
        return result

    def create_weglog_access_ctrl_config(self):
        """ create web log access control configuration  """
        config = os.getenv("ACC_CTRL_CONFIG")
        docroot = os.getenv("DOCUMENT_ROOT")
        result = False 
        if config and docroot:
            config = pathlib.Path(config)
            if not config.is_file():
                config.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
                config_str = \
f"""editor-list-path = "{docroot}/local/conf/editor-list.txt"
google-client-id-path = "{docroot}/google-client-id.txt"
"""
                with open(config, "wf") as fp:
                    fp.write(config_str)
            result = True                 
        return result

    def create_weblog_config(self):
        """ create web log configuration """
        config = os.getenv("AWBLOG_CONFIG")
        docroot = os.getenv("DOCUMENT_ROOT")
        result = False
        if config and docroot:
            config = pathlib.Path(config)
            if not config.is_file():
                access_lock_file = pathlib.Path(docroot) \
                    / "local" / "awblog-lock"
                config.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
                access_lock_file.parent.mkdir(
                        mode=0o755, parents=True, exist_ok=True)    
                with open(access_lock_file, "w") as fp:
                    fp.write("1\n")
                config_str = \
f"""lock-file = "{access_lock_file}"
gettext-domain-dir = "{docroot}/local"
"""
                with open(config, "w") as fp:
                    fp.write(config_str)
            result = True
        return result
    def sys_write_log(self, params: dict):
        """ log output """
        self.run_with_secret(params, self.sys_write_log_impl)

    def sys_write_log_impl(self, params: dict):
        """ log outupt """

        if 'application/x-www-form-urlencoded' == os.getenv('CONTENT_TYPE'):
            stdin = sys.stdin.buffer
            read_len = -1
            if os.getenv('CONTENT_LENGTH'):
                read_len = int(os.getenv('CONTENT_LENGTH')) 
            body_buff = stdin.read(read_len)
            if body_buff:
                body = body_buff.decode()
                request_params = urllib.parse.parse_qs(body)
                request_params.update(params)
            else:
                request_params = params
        else:
            request_params = params

        if 'message' in request_params:
            log.Log.print_log_info(dict(os.environ.items()),
                "\n".join(request_params['message']))
            self.write_status_line(
                http.HTTPStatus.OK,
                http.HTTPStatus.OK.phrase)
            sys.stdout.write('\n')
            sys.stdout.flush()
        else:
            self.send_bad_request()
            
    def sys_read_log(self, params):
        """ read log file"""
        self.run_with_secret(params, self.sys_read_log_impl)        

    def sys_read_log_impl(self, params):
        """ read log file """
        log_dates = [ None ]
        if 'log-date' in params:
            log_dates = params['log-date']  

        environ = dict(os.environ.items())

        self.write_status_line(
            http.HTTPStatus.OK,
            http.HTTPStatus.OK.phrase)
        sys.stdout.write("Content-Type: plain/text\n")
        sys.stdout.write('\n')
        sys.stdout.flush()
        buf = sys.stdout.buffer
        for log_date in log_dates:
            log_path = log.Log.get_log_path(environ, log_date)
            if log_path:
                log.Log.copy_log_to_stream(log_path, buf)
                
        sys.stdout.flush() 

    def get_secret_path(self):
        """ get the path which contains secret text """
        docroot = os.getenv('DOCUMENT_ROOT')
        result = None
        if docroot:
            result = pathlib.Path(docroot) / 'local/secret.txt'
        return result

    def get_secret_from_path(self):
        """ get secret from path """
        secret_path = self.get_secret_path()
        result = None
        if secret_path and pathlib.Path.is_file(secret_path):
            result = secret_path.read_text().strip()
        return result




Service().run()

# vi: se ts=4 sw=4
