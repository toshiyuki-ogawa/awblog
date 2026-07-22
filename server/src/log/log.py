import datetime
import flock
import pathlib

class Log:
    """ Manage log output """

    @classmethod
    def get_log_path(cls, environ: dict, log_date: str | None=None):
        """
log output file path

Parameters:
    environ: enviroment dictionary

"""
        docroot = environ['DOCUMENT_ROOT']
        docroot = docroot if docroot else './'

        if log_date is None:
            dt = datetime.datetime.now()
            log_date = dt.strftime("%Y-%m-%d")
        else:
            try:
                dt = datetime.datetime.strptime(log_date, "%Y-%m-%d") 
            except Exception:
                pass
        result = None
        if log_date:
            result = pathlib.Path(f"{docroot}/local/logs/log-{log_date}.txt")
        return result

    @classmethod
    def open_log_stream(cls, environ: dict):
        """ open log stream """
        log_path = cls.get_log_path(environ)
        return open(log_path, "a+")
 

    @classmethod
    def print_log_record(cls, environ: dict, log_rec: dict):
        """
print log record

Parameters:
    environ: enviroment dictionary 

    log_rec: log record
"""
        log_path = cls.get_log_path(environ)

        with open(log_path, "a+") as f:
            cls.print_log_record_into_stream(f, log_rec)


    @classmethod
    def copy_log_to_stream(cls,
            log_path: pathlib.Path | str, strm,
            chunk_size=1024**2):
        """
copy log into stream
"""
        total_size = 0
        try:
            with open(log_path, "rb") as src_strm:
                chunk = bytearray(chunk_size)
                total_size = 0
                while True:
                    read_size = src_strm.readinto(chunk)
                    if read_size == 0:
                        break
                    if read_size < len(chunk):
                        chunk = chunk[:read_size]
                    strm.write(chunk)
                    total_size += read_size
        except Exception:
            pass
        return total_size

    @classmethod
    def print_log_record_into_stream(cls, stream, log_rec: dict):
        """
print log record into stream

Parameters:
    stream: output stream

    log_rec: log record
"""

        try:
            flock.acquire_lock(stream)
            dt = datetime.datetime.now()
            log_date = "{0:s},{1:03d}".format(
                dt.strftime("%Y-%m-%d %H:%M:%S"),
                dt.microsecond // 1000)
            level = log_rec['level']
            msg = log_rec['message']
            stream.write(f"{log_date} [{level}] {msg}\n")
        finally:
            flock.release_lock(stream)

    @classmethod
    def print_log_info(cls, environ: dict, message: str):
        """
print log as information

Parameters:
    environ: environment dictionary

    log_rec: log record
"""
        cls.print_log_record(environ, {
                'level': 'INFO',
                'message': message
        }) 

    @classmethod
    def print_log_info_into_stream(cls, stream, message):
        """
print log as information

Parameters:
    stream: output stream

    log_rec: log record
"""
        cls.print_log_record_into_stream(
            stream, {
                'level': 'INFO',
                'message': message
        }) 

    @classmethod
    def print_log_warn(cls, environ: dict, message: str):
        """
print log as warning

Parameters:
    environ: environment dictionary

    log_rec: log record
"""
        cls.print_log_record(
            environ, {
                'level': 'INFO',
                'message': message
        }) 

    @classmethod
    def print_log_warn_into_stream(cls, stream, message):
        """
print log as warning

Parameters:
    stream: output stream

    log_rec: log record
"""
        cls.print_log_record_into_stream(
            stream, {
                'level': 'INFO',
                'message': message
        }) 

