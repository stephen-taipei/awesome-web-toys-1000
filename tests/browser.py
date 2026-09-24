#!/usr/bin/env python3
"""Chromium startup and targeted interaction gates, without real device permissions.

HTTP is the default and exercises project-site URLs. --inline is an explicitly
reported fallback for network-restricted environments, not an HTTP deployment test.
"""
import argparse
import asyncio
import functools
import json
import os
from pathlib import Path
import re
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'audit-evidence'
MICROPHONES = {
    '030-': ('initAudio()', 'stopAudio()'),
    **{prefix: ('startAudio()', 'stopAudio()') for prefix in ['062-', '064-', '065-', '066-', '494-']},
    '141-': ('startAudio()', 'stopMicrophone()'),
    **{prefix: ('startMicrophone()', 'stopMicrophone()') for prefix in ['143-', '144-', '145-', '146-', '147-', '148-', '149-']},
    '187-': ('startRecording()', 'stopRecording()'),
    **{prefix: ('toggleMicrophone()', 'toggleMicrophone()') for prefix in ['201-', '207-']},
    **{prefix: ('startMicrophone()', "setMode('demo')") for prefix in ['203-', '204-', '205-', '209-']},
    '208-': ('startMicrophone()', "setMode('tone')"),
}
MIC_MOCK = r"""(() => {
    const NativeContext = window.AudioContext;
    window.__mic = {calls:0, pending:[], tracks:[], contexts:[]};
    window.AudioContext = class extends NativeContext {
        constructor(...args) { super(...args); __mic.contexts.push(this); }
    };
    Object.defineProperty(navigator, 'mediaDevices', {configurable:true, value:{
        getUserMedia() {
            __mic.calls++;
            return new Promise((resolve,reject) => __mic.pending.push({resolve,reject}));
        }
    }});
    __mic.resolve = index => {
        const context = new NativeContext();
        const stream = context.createMediaStreamDestination().stream;
        __mic.tracks.push(...stream.getTracks());
        __mic.pending[index].resolve(stream);
        // The browser context owns this synthetic generator. No real input device is opened.
        (__mic.generators ??= []).push(context);
    };
    __mic.reject = index => __mic.pending[index].reject(new DOMException('Denied by test', 'NotAllowedError'));
})();"""
CODEC_MOCK = r"""(() => {
    window.__codec = {encoders:[], decoders:[], frames:[], configs:[], encoded:[], deferred:null};
    class Codec {
        constructor(init) { this.init=init; this.state='unconfigured'; this.encodeQueueSize=0; this.decodeQueueSize=0; }
        static async isConfigSupported(config) {
            if (__codec.deferSupport) await new Promise(resolve => (__codec.deferred ??= []).push(resolve));
            return {supported: !__codec.unsupported, config};
        }
        configure(config) { this.state='configured'; __codec.configs.push(config); }
        close() { if(this.state==='closed') throw Error('double close'); this.state='closed'; }
    }
    window.VideoEncoder = class extends Codec {
        constructor(init) { super(init); __codec.encoders.push(this); }
        encode(frame, options) {
            if (__codec.throwEncode) throw Error('encode failed');
            __codec.encoded.push(options);
        }
    };
    window.VideoDecoder = class extends Codec {
        constructor(init) { super(init); __codec.decoders.push(this); }
        decode(chunk) { if(this.state!=='configured') throw Error('stale decode'); }
    };
    window.VideoFrame = class {
        constructor() { this.closed=false; __codec.frames.push(this); }
        close() { this.closed=true; }
    };
})();"""


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def toy(prefix):
    return next(ROOT.glob(f'toys/{prefix}*/index.html'))


async def main(args):
    EVIDENCE.mkdir(exist_ok=True)
    server = None
    if not args.inline:
        # Serve at /<repository-name>/ as GitHub Pages does, not just the domain root.
        server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT.parent)))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        origin = f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'
    results = []
    async with async_playwright() as pw:
        launch = {'headless': True, 'args': ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = await pw.chromium.launch(**launch)
        version = browser.version

        async def load(page, file, prelude=''):
            if args.inline:
                html = file.read_text()
                html = re.sub(r'<link[^>]*href=[\"\'](style\.css)[\"\'][^>]*>', lambda m: '<style>' + file.with_name(m[1]).read_text() + '</style>', html)
                html = re.sub(r'<script[^>]*src=[\"\'](script\.js)[\"\'][^>]*>\s*</script>', lambda m: '<script>' + file.with_name(m[1]).read_text() + '</script>', html)
                html = html.replace('<head>', '<head><script>' + prelude + '</script>', 1)
                await page.set_content(html, wait_until='load', timeout=15000)
            else:
                if prelude:
                    await page.add_init_script(prelude)
                response = await page.goto(origin + file.relative_to(ROOT).as_posix(), wait_until='load', timeout=15000)
                assert response.status == 200, response.status

        async def case(name, file, action, prelude='', viewport=None):
            result = {'name': name, 'path': file.relative_to(ROOT).as_posix(), 'page_errors': [], 'console_errors': [], 'http_errors': []}
            context = await browser.new_context(viewport=viewport or {'width':1280, 'height':800}, accept_downloads=False)
            page = await context.new_page()
            page.set_default_timeout(5000)
            page.on('pageerror', lambda error: result['page_errors'].append(str(error)))
            page.on('console', lambda message: result['console_errors'].append(message.text) if message.type == 'error' else None)
            page.on('response', lambda response: result['http_errors'].append({'status':response.status,'url':response.url}) if response.status >= 400 else None)
            # Unsupported APIs may intentionally show a dialog, never let that hang the runner.
            page.on('dialog', lambda dialog: dialog.dismiss())
            try:
                await load(page, file, prelude)
                await action(page)
                assert not result['page_errors'], result['page_errors']
                assert not result['http_errors'], result['http_errors']
                result['passed'] = True
            except Exception as error:
                result['passed'] = False
                result['failure'] = str(error)
            finally:
                await context.close()
            results.append(result)
            if not result['passed']:
                print(json.dumps(result, ensure_ascii=False), flush=True)
            if len(results) % 50 == 0:
                print(f'PROGRESS {len(results)} cases', flush=True)

        async def startup(page):
            await page.wait_for_timeout(args.dwell)
            assert await page.title(), 'Missing document title'

        if args.suite in ('all', 'smoke'):
            paths = sorted(ROOT.glob('toys/*/index.html'))
            queue = asyncio.Queue()
            for file in paths:
                queue.put_nowait(file)
            async def worker():
                while not queue.empty():
                    try:
                        file = queue.get_nowait()
                    except asyncio.QueueEmpty:
                        return
                    await case('startup', file, startup)
            await asyncio.gather(*(worker() for _ in range(args.workers)))

        if args.suite in ('all', 'regressions'):
            for prefix, (start, stop) in MICROPHONES.items():
                async def lifecycle(page, start=start, stop=stop):
                    await page.evaluate(f'() => {{ window.__pendingStart = {start}; {start}; }}')
                    assert await page.evaluate('__mic.calls') == 1, 'duplicate permission requests'
                    await page.evaluate('__mic.resolve(0)')
                    await page.evaluate('() => window.__pendingStart')
                    assert await page.evaluate('__mic.tracks.every(track => track.readyState === "live")')
                    await page.evaluate(stop)
                    assert await page.evaluate('__mic.tracks.every(track => track.readyState === "ended")'), 'capture still active after stop'
                    await page.evaluate("dispatchEvent(new Event('pagehide'))")
                    assert await page.evaluate('__mic.contexts.every(context => context.state === "closed")'), 'AudioContext survived pagehide'
                await case('microphone start/duplicate/stop/pagehide', toy(prefix), lifecycle, MIC_MOCK)

                async def late_resolution(page, start=start):
                    await page.evaluate(f'() => {{ window.__pendingStart = {start}; }}')
                    await page.evaluate("dispatchEvent(new Event('pagehide'))")
                    await page.evaluate('__mic.resolve(0)')
                    await page.evaluate('() => window.__pendingStart')
                    assert await page.evaluate('__mic.tracks.every(track => track.readyState === "ended")'), 'late permission result revived capture'
                    assert await page.evaluate('__mic.contexts.every(context => context.state === "closed")')
                await case('microphone late permission after pagehide', toy(prefix), late_resolution, MIC_MOCK)

                async def denial(page, start=start, stop=stop, prefix=prefix):
                    await page.evaluate(f'() => {{ window.__pendingStart = {start}; }}')
                    await page.evaluate('__mic.reject(0)')
                    await page.evaluate('() => window.__pendingStart')
                    # 494 intentionally enters demo mode after permission denial.
                    if prefix == '494-':
                        await page.evaluate(stop)
                    await page.evaluate(f'() => {{ window.__pendingStart = {start}; }}')
                    assert await page.evaluate('__mic.calls') == 2, 'retry did not request microphone'
                    await page.evaluate('__mic.resolve(1)')
                    await page.evaluate('() => window.__pendingStart')
                    await page.evaluate("dispatchEvent(new Event('pagehide'))")
                    assert await page.evaluate('__mic.tracks.every(track => track.readyState === "ended")')
                await case('microphone denial and retry', toy(prefix), denial, MIC_MOCK)

            async def game(page):
                for button in ['leftBtn', 'rightBtn', 'downBtn', 'rotateBtn']:
                    await page.locator('#' + button).click()
                assert await page.evaluate('board.length === 20 && board.every(row => row.length === 10)')
                await page.locator('#startBtn').click()
                await page.keyboard.press('ArrowLeft')
                await page.keyboard.press('ArrowUp')
                await page.locator('#downBtn').click()
                assert await page.evaluate('isPlaying && current !== null')
                await page.evaluate('board = board.map(row => row.map(() => 1)); spawnPiece()')
                assert await page.evaluate('!isPlaying && current === null && hasStarted')
                await page.locator('#rotateBtn').click()
                await page.locator('#startBtn').click()
                assert await page.evaluate('isPlaying && score === 0')
            await case('tetris before-start/game-over/restart', toy('292-'), game)

            async def chart(page):
                await page.locator('canvas').evaluate('(canvas) => {canvas.style.width="180px";canvas.style.height="150px"}')
                await page.evaluate("""() => {
                    const rect=canvas.getBoundingClientRect();
                    canvas.dispatchEvent(new MouseEvent('click', {clientX:rect.left+(canvas.width/2+50)/canvas.width*rect.width, clientY:rect.top+(canvas.height/2+10)/canvas.height*rect.height}));
                }""")
                assert await page.evaluate('path.length') == 2, 'scaled hit test did not drill down'
            await case('drill-down scaled canvas hit test', toy('483-'), chart)

            async def font(page):
                await page.evaluate('renderFontList([{fullName:"<img src=x onerror=alert(1)>", family:"<b>Family</b>"}])')
                assert await page.locator('#fontList img,#fontList b').count() == 0
                assert '<img' in await page.locator('#fontList').text_content()
                # Hidden panel is shown only after native permission. Exercise the listener directly.
                await page.locator('#fontList li').dispatch_event('keydown', {'key':'Enter'})
                assert await page.locator('#fontList li.active').count() == 1
            await case('font metadata stays text and keyboard activation works', toy('998-local-font'), font)

            async def screens(page):
                await page.locator('#scanBtn').click()
                await page.locator('#scanBtn').click()
                assert await page.evaluate('__screens.listeners.size') == 1
                await page.locator('.open-btn').first.click()
                assert await page.evaluate('__screens.child.document.querySelectorAll("img").length') == 0
                assert '<img' in await page.evaluate('__screens.child.document.body.textContent')
                await page.evaluate("dispatchEvent(new Event('pagehide'))")
                assert await page.evaluate('__screens.listeners.size') == 0
            screen_mock = """window.__screens={listeners:new Set(), child:null};
                const details=new EventTarget();
                details.screens=[{label:'<img src=x onerror=alert(1)>',width:1920,height:1080,left:0,top:0,availLeft:0,availTop:0,isInternal:true}];
                details.currentScreen=details.screens[0];
                const add=details.addEventListener.bind(details), remove=details.removeEventListener.bind(details);
                details.addEventListener=(event,listener)=>{__screens.listeners.add(listener);add(event,listener)};
                details.removeEventListener=(event,listener)=>{__screens.listeners.delete(listener);remove(event,listener)};
                window.getScreenDetails=async()=>details;
                window.open=()=>__screens.child={document:document.implementation.createHTMLDocument(),close(){},opener:window};"""
            await case('screen scan listener cleanup and safe popup metadata', toy('996-multi-screen'), screens, screen_mock)

            async def wavy(page):
                await page.evaluate('createWavyText("👨‍👩‍👧‍👦<&>")')
                assert await page.locator('#wavyText span').count() == 4
                assert await page.locator('#wavyText').text_content() == '👨‍👩‍👧‍👦<&>'
            await case('wavy text graphemes and literal markup', toy('647-'), wavy)

            async def no_webgl(page):
                assert await page.get_by_role('status').count() == 1
            no_gl = "const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args)};"
            await case('WebGL unavailable exits without cascading failure', toy('019-'), no_webgl, no_gl)

            async def codecs(page):
                await page.evaluate('startPipeline()')
                await page.wait_for_timeout(100)
                assert await page.evaluate('__codec.encoded[0].keyFrame'), 'first frame must be key frame'
                assert await page.evaluate('__codec.frames.every(frame => frame.closed)')
                await page.evaluate('stopPipeline(); __codec.encoders[0].init.output({})')
                await page.evaluate('window.__lateFrame = new VideoFrame(); __codec.decoders[0].init.output(__lateFrame)')
                assert await page.evaluate('__lateFrame.closed')
                await page.evaluate('startPipeline()')
                await page.evaluate('__codec.throwEncode = true')
                await page.wait_for_timeout(100)
                assert await page.evaluate('!isRunning && __codec.frames.every(frame=>frame.closed)')
                await page.evaluate('stopPipeline()')
            await case('codecs keyframes/frame disposal/stale callbacks/error cleanup', toy('999-web-codecs'), codecs, CODEC_MOCK)

            async def codec_cancel(page):
                await page.evaluate('__codec.deferSupport=true; void startPipeline(); void startPipeline()')
                await page.evaluate('stopPipeline(); __codec.deferred.forEach(resolve=>resolve())')
                await page.wait_for_timeout(30)
                assert await page.evaluate('__codec.encoders.length === 0 && !isRunning && !isStarting')
            await case('codecs cancel asynchronous setup', toy('999-web-codecs'), codec_cancel, CODEC_MOCK)

            async def codec_backpressure(page):
                await page.evaluate('startPipeline()')
                await page.evaluate('encoder.encodeQueueSize=2; window.__before=__codec.encoded.length')
                await page.wait_for_timeout(100)
                assert await page.evaluate('__codec.encoded.length === __before')
                await page.evaluate("dispatchEvent(new Event('pagehide'))")
                assert await page.evaluate('__codec.encoders.every(item => item.state === "closed") && __codec.decoders.every(item => item.state === "closed")')
            await case('codecs backpressure and pagehide', toy('999-web-codecs'), codec_backpressure, CODEC_MOCK)

            async def unsupported_codec(page):
                await page.evaluate('__codec.unsupported=true; startPipeline()')
                assert await page.evaluate('__codec.encoders.length === 0 && !isStarting && !startBtn.disabled')
            await case('codecs unsupported configuration permits retry', toy('999-web-codecs'), unsupported_codec, CODEC_MOCK)

            async def fireworks(page):
                await page.evaluate("celebrating=true; fireworks=[{exploded:true, update(){}, draw(){}}]; particles=[{x:0,y:0,vx:0,vy:0,life:1,hue:0,size:2}]; draw()")
                assert await page.evaluate('fireworks.every(item => !item.exploded)'), 'expired firework retained by unrelated particles'
            await case('fireworks retire independently of live particles', toy('1000-grand-finale'), fireworks)

            # The landing page has no visual changes: only the project-relative metadata URL changed.
            async def landing(page):
                assert await page.locator('link[rel="alternate"]').get_attribute('href') == 'llms.txt'
                await page.screenshot(path=str(EVIDENCE / 'landing.png'), full_page=True)
            await case('landing project-relative metadata', ROOT / 'index.html', landing)
            for prefix in ['101-', '113-', '292-', '483-', '647-']:
                await case('mobile startup', toy(prefix), startup, viewport={'width':390, 'height':844})
        await browser.close()
    if server:
        server.shutdown()
    report = {'browser': version, 'transport': 'inline' if args.inline else 'http-project-subpath',
              'dwell_ms': args.dwell, 'suite': args.suite, 'cases': len(results),
              'failed': sum(not item['passed'] for item in results), 'results': results}
    output = EVIDENCE / f'browser-{args.suite}.json'
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key:value for key,value in report.items() if key != 'results'}), flush=True)
    return bool(report['failed'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inline', action='store_true')
    parser.add_argument('--suite', choices=['all', 'smoke', 'regressions'], default='all')
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--dwell', type=int, default=200)
    args = parser.parse_args()
    if args.workers < 1 or args.dwell < 1:
        parser.error('workers and dwell must be positive')
    raise SystemExit(asyncio.run(main(args)))
