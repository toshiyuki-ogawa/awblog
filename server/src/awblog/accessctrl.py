
class AccessCtrl:
    """ access control """

    def __init__(self):
        """ constructor """
        pass

    def load_setting(self):
        """ load access control setting """
        pass

    def allow_access(self, environ: dict, param: dict):
        """ get flag whether params is allowed to run cmd_id """
        return True 

# vi: se ts=4 sw=4 et:
