"""Encode and review the core character UI portraits in the local browser."""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import os
import socket
import struct
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request

PACKAGE = Path(__file__).resolve().parent
CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

class CDP:
    def __init__(self, url):
        parsed = urllib.parse.urlparse(url)
        self.sock = socket.create_connection((parsed.hostname, parsed.port), timeout=25)
        key = base64.b64encode(os.urandom(16)).decode()
        request = (
            f'GET {parsed.path} HTTP/1.1\r\nHost: {parsed.hostname}:{parsed.port}\r\n'
            f'Upgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n'
            'Sec-WebSocket-Version: 13\r\n\r\n'
        )
        self.sock.sendall(request.encode())
        header = b''
        while b'\r\n\r\n' not in header:
            header += self.sock.recv(4096)
        raw, self.buffer = header.split(b'\r\n\r\n', 1)
        assert raw.split(b'\r\n', 1)[0].split()[1] == b'101'
        expected = base64.b64encode(hashlib.sha1((key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode()).digest())
        assert expected.lower() in raw.lower()
        self.serial = 0
        self.exceptions = []

    def read(self, count):
        while len(self.buffer) < count:
            chunk = self.sock.recv(65536)
            if not chunk:
                raise RuntimeError('Review browser socket closed')
            self.buffer += chunk
        answer, self.buffer = self.buffer[:count], self.buffer[count:]
        return answer

    def send(self, payload, opcode=1):
        mask = os.urandom(4)
        count = len(payload)
        header = bytes([0x80 | opcode])
        if count < 126:
            header += bytes([0x80 | count])
        elif count < 65536:
            header += bytes([0x80 | 126]) + struct.pack('!H', count)
        else:
            header += bytes([0x80 | 127]) + struct.pack('!Q', count)
        self.sock.sendall(header + mask + bytes(v ^ mask[i % 4] for i, v in enumerate(payload)))

    def receive(self):
        fragments = bytearray()
        while True:
            first, second = self.read(2)
            count = second & 127
            if count == 126:
                count = struct.unpack('!H', self.read(2))[0]
            elif count == 127:
                count = struct.unpack('!Q', self.read(8))[0]
            mask = self.read(4) if second & 128 else None
            payload = self.read(count)
            if mask:
                payload = bytes(v ^ mask[i % 4] for i, v in enumerate(payload))
            opcode = first & 15
            if opcode == 9:
                self.send(payload, 10)
                continue
            if opcode == 8:
                raise RuntimeError('Browser closed review socket')
            if opcode in (1, 0):
                fragments.extend(payload)
                if first & 128:
                    return json.loads(fragments)

    def call(self, method, params=None):
        self.serial += 1
        serial = self.serial
        self.send(json.dumps({'id': serial, 'method': method, 'params': params or {}}).encode())
        while True:
            message = self.receive()
            if message.get('method') == 'Runtime.exceptionThrown':
                self.exceptions.append(message['params'])
            if message.get('id') == serial:
                if 'error' in message:
                    raise RuntimeError(message['error'])
                return message.get('result', {})

    def evaluate(self, expression):
        result = self.call('Runtime.evaluate', {'expression': expression, 'returnByValue': True, 'awaitPromise': True})
        if 'exceptionDetails' in result:
            raise RuntimeError(result['exceptionDetails'])
        return result['result'].get('value')

    def viewport(self, width, height, mobile=False):
        self.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': mobile})

    def ready(self):
        deadline = time.monotonic() + 20
        while True:
            ready = self.evaluate("document.documentElement.dataset.ready")
            if ready == 'true':
                return
            if ready == 'error':
                raise RuntimeError(self.evaluate("document.getElementById('asset-status').textContent"))
            if time.monotonic() > deadline:
                raise TimeoutError('Portrait page did not finish loading')
            time.sleep(0.1)

    def screenshot(self, filename):
        result = self.call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': False})
        (PACKAGE / filename).write_bytes(base64.b64decode(result['data']))

parser = argparse.ArgumentParser()
parser.add_argument('--encode-webp', action='store_true')
parser.add_argument('--quality', type=float, default=0.92)
parser.add_argument('--snapshot-version', default='v1')
args = parser.parse_args()
assert 0.85 <= args.quality <= 1
assert args.snapshot_version.startswith('v') and args.snapshot_version[1:].isdigit()
manifest = json.loads((PACKAGE / 'manifest.json').read_text(encoding='utf-8-sig'))
profile = Path(tempfile.mkdtemp(prefix='tiennghich-core-ui-')).resolve()
assert profile.name.startswith('tiennghich-core-ui-')
process = subprocess.Popen([
    CHROME, '--headless', '--disable-gpu', '--no-sandbox', '--in-process-gpu',
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--allow-file-access-from-files', '--remote-debugging-port=0',
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + str(profile), 'about:blank'
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
cdp = None
try:
    port_file = profile / 'DevToolsActivePort'
    deadline = time.monotonic() + 25
    while not port_file.exists():
        if process.poll() is not None:
            raise RuntimeError('Review browser exited')
        if time.monotonic() > deadline:
            raise TimeoutError('Review browser did not start')
        time.sleep(0.1)
    port = int(port_file.read_text().splitlines()[0])
    with urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list') as response:
        targets = json.load(response)
    page = next(t for t in targets if t['type'] == 'page')
    cdp = CDP(page['webSocketDebuggerUrl'])
    cdp.call('Runtime.enable')
    cdp.call('Page.enable')
    cdp.viewport(1440, 1180)
    cdp.call('Page.navigate', {'url': (PACKAGE / 'index.html').as_uri() + '?format=png'})
    cdp.ready()
    files = []
    for portrait in manifest['portraits']:
        for size in (512, 160, 64):
            png = PACKAGE / 'portraits' / portrait['slug'] / 'native-v1' / f'portrait-{size}.png'
            webp = png.with_suffix('.webp')
            if args.encode_webp:
                if webp.exists():
                    raise FileExistsError('WebP asset exists; use review mode without --encode-webp.')
                expression = r"""(async()=>{const image=new Image();await new Promise((ok,no)=>{image.onload=ok;image.onerror=no;image.src=PATH;});const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);return canvas.toDataURL('image/webp',QUALITY);})()"""
                expression = expression.replace('PATH', json.dumps(png.as_uri())).replace('QUALITY', str(args.quality))
                data = cdp.evaluate(expression)
                assert data.startswith('data:image/webp;base64,')
                webp.write_bytes(base64.b64decode(data.split(',', 1)[1]))
            assert webp.is_file()
            raw = webp.read_bytes()
            assert raw[:4] == b'RIFF' and raw[8:12] == b'WEBP'
            budget = {512: 120 * 1024, 160: 24 * 1024, 64: 8 * 1024}[size]
            assert len(raw) <= budget, str(webp) + ' exceeds delivery budget'
            fidelity = r"""(async()=>{async function read(path){const image=new Image();await new Promise((ok,no)=>{image.onload=ok;image.onerror=no;image.src=path;});const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);return{width:c.width,height:c.height,pixels:ctx.getImageData(0,0,c.width,c.height).data};}const a=await read(PNG),b=await read(WEBP);let maxAlpha=0,diff=0,count=0;for(let i=0;i<a.pixels.length;i+=4){maxAlpha=Math.max(maxAlpha,Math.abs(a.pixels[i+3]-b.pixels[i+3]));if(a.pixels[i+3]>=128){for(let k=0;k<3;k++){diff+=Math.abs(a.pixels[i+k]-b.pixels[i+k]);count++;}}}const corners=[0,(a.width-1)*4,((a.height-1)*a.width)*4,(a.width*a.height-1)*4];return{sizePx:[b.width,b.height],maxAlphaDifference:maxAlpha,meanOpaqueColorDifference:diff/count,transparentCorners:corners.every(i=>b.pixels[i+3]===0)};})()"""
            fidelity = cdp.evaluate(fidelity.replace('PNG', json.dumps(png.as_uri())).replace('WEBP', json.dumps(webp.as_uri())))
            assert fidelity['sizePx'] == [size, size] and fidelity['transparentCorners']
            assert fidelity['maxAlphaDifference'] <= 1 and fidelity['meanOpaqueColorDifference'] < 6, fidelity
            files.append({'characterId': portrait['characterId'], 'sizePx': [size, size],
                          'webpPath': str(webp.relative_to(PACKAGE)).replace('\\', '/'),
                          'bytes': len(raw), 'budgetBytes': budget, 'sha256': hashlib.sha256(raw).hexdigest(),
                          **fidelity})
    cdp.call('Page.navigate', {'url': (PACKAGE / 'index.html').as_uri()})
    cdp.ready()
    cdp.evaluate("document.fonts.ready.then(()=>true)")
    checks = {}
    checks['all_three_portraits_loaded'] = cdp.evaluate("document.querySelectorAll('img[data-size]').length===9 && [...document.querySelectorAll('img')].every(i=>i.complete && i.naturalWidth>0)")
    checks['native_64_160_and_512_sizes'] = cdp.evaluate("[...document.querySelectorAll('img[data-size]')].every(i=>i.naturalWidth===Number(i.dataset.size) && i.naturalHeight===Number(i.dataset.size))")
    checks['thumbnail_and_dialogue_render_at_actual_size'] = cdp.evaluate("[...document.querySelectorAll('img[data-size=\"64\"],img[data-size=\"160\"]')].every(i=>i.getBoundingClientRect().width===Number(i.dataset.size))")
    checks['webp_and_png_switch'] = True
    for file_format in ('png', 'webp'):
        cdp.evaluate("(()=>{const s=document.getElementById('format');s.value='" + file_format + "';s.dispatchEvent(new Event('change'));})()")
        cdp.ready()
        checks['webp_and_png_switch'] &= cdp.evaluate("[...document.querySelectorAll('img')].every(i=>i.currentSrc.endsWith('." + file_format + "') && i.complete && i.naturalWidth>0)")
    checks['speaker_switch'] = True
    for portrait in manifest['portraits']:
        slug = portrait['slug']
        expression = "(async()=>{const s=document.getElementById('speaker');s.value=SLUG;s.dispatchEvent(new Event('change'));await new Promise(r=>setTimeout(r,80));return document.getElementById('dialogue-portrait').currentSrc.includes('/'+SLUG+'/') && document.getElementById('dialogue-portrait').complete;})()"
        checks['speaker_switch'] &= cdp.evaluate(expression.replace('SLUG', json.dumps(slug)))
    checks['dark_background'] = cdp.evaluate("(()=>{const t=document.getElementById('theme');t.value='dark';t.dispatchEvent(new Event('change'));return document.body.classList.contains('dark');})()")
    checks['desktop_no_horizontal_overflow'] = cdp.evaluate("document.documentElement.scrollWidth<=innerWidth")
    screenshots = []
    desktop_dark = 'preview-desktop-dark-' + args.snapshot_version + '.png'
    cdp.screenshot(desktop_dark)
    screenshots.append(desktop_dark)
    cdp.evaluate("const t=document.getElementById('theme');t.value='paper';t.dispatchEvent(new Event('change'));")
    desktop = 'preview-desktop-' + args.snapshot_version + '.png'
    cdp.screenshot(desktop)
    screenshots.append(desktop)
    cdp.viewport(360, 900, True)
    cdp.evaluate("window.scrollTo(0,0)")
    time.sleep(0.2)
    checks['mobile_360_no_horizontal_overflow'] = cdp.evaluate("document.documentElement.scrollWidth<=innerWidth")
    checks['mobile_thumbnail_and_dialogue_not_shrunk'] = cdp.evaluate("[...document.querySelectorAll('img[data-size=\"64\"],img[data-size=\"160\"]')].every(i=>i.getBoundingClientRect().width===Number(i.dataset.size))")
    mobile = 'preview-360-' + args.snapshot_version + '.png'
    cdp.screenshot(mobile)
    screenshots.append(mobile)
    assert all(checks.values()), checks
    assert not cdp.exceptions, cdp.exceptions
    print(json.dumps({'schemaVersion': 'core-ui-browser-review-1', 'browser': 'local_chrome_headless',
                      'webpQualityParameter': args.quality, 'webpFiles': files,
                      'checks': checks, 'runtimeExceptions': len(cdp.exceptions), 'screenshots': screenshots},
                     ensure_ascii=True, indent=2))
finally:
    if cdp:
        cdp.sock.close()
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=10)
