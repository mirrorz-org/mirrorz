#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import sys
import os

class GithubPagesCORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        path = self.translate_path(self.path)
        # If the path doesn't exist, fake it to be the 404 page.
        if not os.path.exists(path):
            self.path = '404.html'
        # Call the superclass methods to actually serve the page.
        SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    test(GithubPagesCORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
