"""Serve the isolated VFX study locally, with explicit JavaScript MIME types."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class VfxHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".mjs": "text/javascript",
        ".js": "text/javascript",
        ".json": "application/json",
    }


if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    handler = partial(VfxHandler, directory=str(root))
    with ThreadingHTTPServer(("127.0.0.1", 4185), handler) as server:
        print("VFX preview: http://127.0.0.1:4185/kiem-khi-preview.html", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
