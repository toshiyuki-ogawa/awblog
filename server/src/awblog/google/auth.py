from google.oauth2 import id_token
from google.auth.transport import requests

class Auth:
    """ google auth helper """

    @classmethod
    def read_email_from_token(self, client_id: str, token: str):

        idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), client_id)

        return idinfo['email']

        


# vi: se ts=4 sw=4 et:
