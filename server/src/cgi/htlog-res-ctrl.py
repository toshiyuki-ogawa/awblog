#!/usr/bin/env python3

import http
import io
import json
import os
import sys

class Service:
    """ resource management service """

    def write_status_line(self, code: int, status_phrase: str=None):
        """ write status code into stdout """ 
 
        status_line = f"Status:  {code}" 
        if status_phrase:
            status_line += f" {status_phrase}\n"
        else:
            status_line += "\n"
        sys.stdout.write(status_line)
    def copy_stream(self, src_strm, dst_strm, chunk_size=1024**2):
        chunk = bytearray(chunk_size)
        total_size = 0
        while True:
            read_size = src_strm.readinto(chunk)
            if read_size == 0:
                break
            if read_size < len(chunk):
                chunk = chunk[:read_size]
            dst_strm.write(chunk)
            total_size += read_size
        return total_size

    def write_html_header(self):
        """ write html header """
        policy = ','.join(['same-origin', 'same-origin-allow-popups'])
        sys.stdout.write(f"Cross-Origin-Opener-Policy: {policy}\n")
        sys.stdout.write("Content-Type: text/html\n")

    def run(self):
        """ do service """

        req = os.environ['REQUEST_URI']
        
        idx = req.find('?')
        if idx != -1:
            path = req[:idx]
        else:
            path = req
        if path[0] == '/':
            path = path[1:]
        key_files = {}
        exp = ''
        try:
            with open('index-entries.json') as fp:
                key_files = json.load(fp)
        except Exception as ex:
            exp = ex

        path_map = {}
        for key, values in key_files.items():
            for val in values:
                path_map[val] = key
        real_path = "index.html"
        if path in path_map:
            real_path = path_map[path]
        
        if not exp and real_path:
            try:
            
                with open(real_path, 'rb') as fp:
                    self.write_status_line(
                        http.HTTPStatus.OK,
                        http.HTTPStatus.OK.phrase)
                    self.write_html_header()
                    sys.stdout.write('\n')
                    sys.stdout.flush()
                    with io.BytesIO() as bfstrm:
                        self.copy_stream(fp, bfstrm)
                        sys.stdout.write(bfstrm.getvalue().decode())
                    sys.stdout.flush()
            except Exception as ex:
                self.write_status_line(
                    http.HTTPStatus.OK,
                    http.HTTPStatus.OK.phrase)
                sys.stdout.write("\n")
                sys.stdout.write(repr(ex))
                sys.stdout.flush()
     
        else:
            self.write_status_line(
                http.HTTPStatus.NOT_FOUND,
                http.HTTPStatus.NOT_FOUND.phrase)
            sys.stdout.write("\n")
            sys.stdout.flush()
 

Service().run()

# vi: se ts=4 sw=4 et:
