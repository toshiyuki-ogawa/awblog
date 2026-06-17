import log
import os
import sys
import tomllib
import traceback

from pathlib import Path
from .google import Auth as GoogleAuth

class AccessCtrl:
    """ access control """
    @classmethod
    def load_set(cls, editor_list_path):
        """ load editor list """
        result = None
        try:
            result = set() 

            with open(editor_list_path) as fp:
                for ln in fp:
                    ln = ln.strip()
                    if len(ln):
                        result.add(ln) 
        except:
            log.Log.print_log_warn(
                os.environ,
                repr(sys.exception()))
            log.Log.print_log_warn(
                os.environ,
                traceback.format_exc())
             
        return result

    def __init__(self):
        """ constructor """
        self.setup_dispatcher()

    def setup_dispatcher(self):
        """ init handler """
        self.handler = {
            'edit-content': self.edit_content,
            'update-content': self.update_content,
            'update-header': self.update_header,
            'commit': self.commit
        }
    def load_setting(self):
        """ load access control setting """
        config_path = os.getenv('ACC_CTRL_CONFIG') 
        if config_path is not None:
            self.load_config(config_path)
        else:
            log.Log.print_log_warn(
                os.environ,
                "Not set editor-list-path")
    def load_config(self, config_path):
        """ load configuration """
        config = None
        try:
            with open(config_path, "rb") as fp:
                config = tomllib.load(fp)
                editor_list_path = config['editor-list-path']
                if editor_list_path:
                    self._editors = self.load_set(editor_list_path)
                else:
                    log.Log.print_log_warn(
                        os.environ,
                        "Not set editor-list-path")
                google_client_id_path = config['google-client-id-path']
                if editor_list_path:
                    self._google_client_id = \
                        self.load_google_client_id(google_client_id_path)
                else:
                    log.Log.print_log_warn(
                        os.environ,
                        "Not set google-client-id-path")
        except:
            log.Log.print_log_warn(
                os.environ,
                repr(sys.exception()))
            log.Log.print_log_warn(
                os.environ,
                traceback.format_exc())
 
    @property
    def editors(self):
        """ editors set """
        return self._editors

    @property
    def google_client_id(self):
        """ google client id """
        return self._google_client_id

    def load_google_client_id(self, client_id_path):
        """ google client id """
        result = None
        with open(client_id_path) as fp:
            result = fp.readline().strip()
        return result

    def allow_access(self, environ: dict, params: dict):
        """ get flag whether params is allowed to run cmd_id """
        result = True
        if 'action' in params \
            and len(params['action']) \
            and params['action'][0] in self.handler:
            result = self.handler[params['action'][0]](environ, params) 
  
        return result
     
    def read_email_from_bearer(self, environ: dist):
        """ read email from bearer """
        result = None
        authorization = environ['AUTHORIZATION'] \
            if 'AUTHORIZATION' in environ else None

        token = None
        if authorization:
            type_value = authorization.split()
            if len(type_value) > 1 and 'Bearer' == type_value[0]:
                token = type_value[1] 
        if token:
            token = token.strip()
            result = GoogleAuth.read_email_from_token(
                    self.google_client_id,
                    token)
        return result

    def edit_content(self, environ: dict, param: dict):
        """ access control for edit action """
        return True

    def update_content(self, environ: dict, param: dict):
        """ access control for update content action """
        return self.allow_request_contains_editor(environ)
    def update_header(self, environ: dict, param: dict):
        """ access control for update header action """
        return True

    def commit(self, environ: dict, param: dict):
        """ access control for commit action """
        return self.allow_request_contains_editor(environ)


    def allow_request_contains_editor(self, environ: dict):
        """ allow if request has the editor which is in editors list. """
        result = False
        try:
            email = self.read_email_from_bearer(environ) 
            if email:
                result = email in self.editors     
        except:
            log.Log.print_log_warn_into_stream(
                environ['wsgi.errors'],
                repr(sys.exception()))
            log.Log.print_log_warn_into_stream(
                environ['wsgi.errors'],
                traceback.format_exc())
        return result


# vi: se ts=4 sw=4 et:
