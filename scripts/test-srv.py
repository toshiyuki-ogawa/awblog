import http.server
import os
import sys
import socket
import traceback
import awblog
import urllib.parse


class CustomHandler(http.server.CGIHTTPRequestHandler):

    def is_cgi(self):
        result = super().is_cgi()

        if not result:
            path_res = urllib.parse.urlsplit(self.path)
            _, ext = os.path.splitext(path_res.path)
            result = '.cgi' == ext
            if result:
                idx = path_res.path.rfind('/')
                head = ''
                if idx != -1:
                    head = path_res.path[:idx + 1]
                tail = path_res.path
                if path_res.query:
                    tail += f"?{path_res.query}"
                if path_res.fragment:
                    tail += f"#{path_res.fragment}"
                self.cgi_info = head, tail
        return result
        

    def do_GET(self):
        path = self.translate_path(self.path)

        if not os.path.isdir(path):
            resctl = awblog.ResCtrl()
            base_name = os.path.basename(path)
            new_base_name = resctl.get_resource(base_name)
            if new_base_name:
                if base_name != new_base_name:
                    self.path = os.path.join(
                        os.path.dirname(self.path), new_base_name)  
                self.resource_ctl_path = True

        super().do_GET()

    def end_headers(self):
        if 'resource_ctl_path' in self.__dict__ and self.resource_ctl_path:
            self.send_header(
                'Cross-Origin-Opener-Policy',
                ','.join(['same-origin', 'same-origin-allow-popups']))
        super().end_headers()
        
    def run_cgi(self):

        authorization = self.headers.get("authorization")
        if authorization:
            os.environ['AUTHORIZATION'] = authorization
        super().run_cgi()
   
def _get_best_family(*address):
    infos = socket.getaddrinfo(
        *address,
        type=socket.SOCK_STREAM,
        flags=socket.AI_PASSIVE,
    )
    family, type, proto, canonname, sockaddr = next(iter(infos))
    return family, sockaddr


def test(HandlerClass=http.server.BaseHTTPRequestHandler,
         ServerClass=http.server.ThreadingHTTPServer,
         protocol="HTTP/1.0", port=8000, bind=None,
         tls_cert=None, tls_key=None, tls_password=None):
    """Test the HTTP request handler class.

    This runs an HTTP server on port 8000 (or the port argument).

    """
    ServerClass.address_family, addr = _get_best_family(bind, port)
    HandlerClass.protocol_version = protocol

    if tls_cert:
        server = ServerClass(addr, HandlerClass, certfile=tls_cert,
                             keyfile=tls_key, password=tls_password)
    else:
        server = ServerClass(addr, HandlerClass)

    with server as httpd:
        host, port = httpd.socket.getsockname()[:2]
        url_host = f'[{host}]' if ':' in host else host
        protocol = 'HTTPS' if tls_cert else 'HTTP'
        print(
            f"Serving {protocol} on {host} port {port} "
            f"({protocol.lower()}://{url_host}:{port}/) ..."
        )
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nKeyboard interrupt received, exiting.")
            sys.exit(0)

if __name__ == '__main__':
    import argparse
    import contextlib

    parser = argparse.ArgumentParser(color=True)
    parser.add_argument('-b', '--bind', metavar='ADDRESS',
                        help='bind to this address '
                             '(default: all interfaces)')
    parser.add_argument('-d', '--directory', default=os.getcwd(),
                        help='serve this directory '
                             '(default: current directory)')
    parser.add_argument('-p', '--protocol', metavar='VERSION',
                        default='HTTP/1.0',
                        help='conform to this HTTP version '
                             '(default: %(default)s)')
    parser.add_argument('--tls-cert', metavar='PATH',
                        help='path to the TLS certificate chain file')
    parser.add_argument('--tls-key', metavar='PATH',
                        help='path to the TLS key file')
    parser.add_argument('--tls-password-file', metavar='PATH',
                        help='path to the password file for the TLS key')
    parser.add_argument('port', default=8000, type=int, nargs='?',
                        help='bind to this port '
                             '(default: %(default)s)')
    args = parser.parse_args()

    if not args.tls_cert and args.tls_key:
        parser.error("--tls-key requires --tls-cert to be set")

    tls_key_password = None
    if args.tls_password_file:
        if not args.tls_cert:
            parser.error("--tls-password-file requires --tls-cert to be set")

        try:
            with open(args.tls_password_file, "r", encoding="utf-8") as f:
                tls_key_password = f.read().strip()
        except OSError as e:
            parser.error(f"Failed to read TLS password file: {e}")


    # ensure dual-stack is not disabled; ref #38907
    class DualStackServerMixin:

        def server_bind(self):
            # suppress exception when protocol is IPv4
            with contextlib.suppress(Exception):
                self.socket.setsockopt(
                    socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
            return super().server_bind()

        def finish_request(self, request, client_address):
            self.RequestHandlerClass(request, client_address, self,
                                     directory=args.directory)

    class HTTPDualStackServer(DualStackServerMixin, 
                              http.server.ThreadingHTTPServer):
        pass
    class HTTPSDualStackServer(DualStackServerMixin,
                               http.server.ThreadingHTTPSServer):
        pass

    ServerClass = HTTPSDualStackServer if args.tls_cert else HTTPDualStackServer

    test(
        HandlerClass=CustomHandler,
        ServerClass=ServerClass,
        port=args.port,
        bind=args.bind,
        protocol=args.protocol,
        tls_cert=args.tls_cert,
        tls_key=args.tls_key,
        tls_password=tls_key_password,
    )


# vi: se ts=4 sw=4 et:
