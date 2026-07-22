#!/usr/bin/env python3
import os
import sys
import awblog
import log


def service():
    environ = dict(os.environ.items())
    environ['wsgi.input'] = sys.stdin.buffer
    environ['wsgi.errors'] = sys.stderr
    environ['wsgi.version'] = (1, 0)
    environ['wsgi.multithread'] = False
    environ['wsgi.multiprocess'] = True
    environ['wsgi.run_once'] = True

    if environ.get('HTTPS', 'off') in ('on', '1'):
        environ['wsgi.url_scheme'] = 'https'
    else:
        environ['wsgi.url_scheme'] = 'http'

    err_stream = log.Log.open_log_stream(environ)
    environ['wsgi.errors'] = err_stream
    headers_set = []
    headers_sent = []
    def write(data):
        out = sys.stdout.buffer
        if not headers_set:
             raise AssertionError("write() before start_response()")

        elif not headers_sent:
             # Before the first output, send the stored headers
             status, response_headers = headers_sent[:] = headers_set
             out.write(f'Status: {status}\r\n'.encode('iso-8859-1'))
             for header in response_headers:
                 out.write(f'{header[0]}: {header[1]}\r\n'.encode('iso-8859-1'))
             out.write('\r\n'.encode('iso-8859-1'))
        out.write(data)
        out.flush()
    def start_response(status, response_headers, exc_info=None):
        if exc_info:
            try:
                if headers_sent:
                    # Re-raise original exception if headers sent
                    raise exc_info[1].with_traceback(exc_info[2])
            finally:
                exc_info = None     # avoid dangling circular ref
        elif headers_set:
            raise AssertionError("Headers already set!")

        headers_set[:] = [status, response_headers]
        return write

    result = awblog.App().run(environ, start_response)

    try:
        for data in result:
            if data:    # don't send headers until body appears
                write(data)
        if not headers_sent:
            write(b'')   # send headers now if body was empty
    finally:
        if hasattr(result, 'close'):
            result.close()
    pass
    if err_stream:
        err_stream.close()
        err_stream = None

service()

# vi: se ts=4 sw=4 et:
