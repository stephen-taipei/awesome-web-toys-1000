#!/usr/bin/env python3
"""Run the unchanged browser gates with enough HTTP backlog for CI asset bursts."""
from http.server import ThreadingHTTPServer
from pathlib import Path
import runpy


if __name__ == '__main__':
    # A page requests HTML, CSS and JS concurrently. Keep the local fixture from
    # rejecting short connection bursts while software rendering shares the CPU.
    ThreadingHTTPServer.request_queue_size = 128
    runpy.run_path(str(Path(__file__).with_name('browser.py')), run_name='__main__')
