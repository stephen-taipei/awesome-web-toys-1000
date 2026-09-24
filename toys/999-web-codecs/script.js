const srcCanvas = document.getElementById('srcCanvas');
const dstCanvas = document.getElementById('dstCanvas');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const supportEl = document.getElementById('support');
const ctxSrc = srcCanvas.getContext('2d');
const ctxDst = dstCanvas.getContext('2d');

const supported = ['VideoEncoder', 'VideoDecoder', 'VideoFrame'].every(name => name in window);
let isRunning = false;
let isStarting = false;
let generation = 0;
let frameId = null;
let encoder = null;
let decoder = null;
let frameCounter = 0;
let encodedFrames = 0;
let lastTimestamp = -Infinity;

supportEl.textContent = supported ? 'YES (codec checked on start)' : 'NO (requires a supporting browser and HTTPS)';
supportEl.classList.add(supported ? 'success' : 'error');
startBtn.disabled = !supported;
stopBtn.disabled = true;
statusEl.setAttribute('role', 'status');

function drawSource() {
    ctxSrc.fillStyle = '#000';
    ctxSrc.fillRect(0, 0, srcCanvas.width, srcCanvas.height);
    const t = Date.now() / 500;
    const x = (Math.sin(t) + 1) / 2 * (srcCanvas.width - 40) + 20;
    const y = (Math.cos(t * 1.3) + 1) / 2 * (srcCanvas.height - 40) + 20;
    ctxSrc.fillStyle = '#ff0055';
    ctxSrc.beginPath();
    ctxSrc.arc(x, y, 20, 0, Math.PI * 2);
    ctxSrc.fill();
    ctxSrc.fillStyle = '#fff';
    ctxSrc.font = '20px monospace';
    ctxSrc.fillText(`Frame: ${frameCounter++}`, 10, 30);
}

function stopPipeline(message = 'Stopped.') {
    generation++;
    isRunning = false;
    isStarting = false;
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    for (const codec of [encoder, decoder]) {
        if (codec && codec.state !== 'closed') codec.close();
    }
    encoder = decoder = null;
    startBtn.disabled = !supported;
    stopBtn.disabled = true;
    statusEl.textContent = message;
}

async function startPipeline() {
    if (!supported || isStarting || isRunning) return;
    const session = ++generation;
    isStarting = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusEl.textContent = 'Checking VP8 support...';
    const config = {
        codec: 'vp8', width: srcCanvas.width, height: srcCanvas.height,
        bitrate: 1000000, framerate: 30, latencyMode: 'realtime'
    };
    const decoderConfig = {
        codec: 'vp8', codedWidth: srcCanvas.width, codedHeight: srcCanvas.height
    };
    const fail = error => {
        if (session === generation) stopPipeline(`Error: ${error.message}`);
    };
    try {
        const [encodeSupport, decodeSupport] = await Promise.all([
            VideoEncoder.isConfigSupported(config),
            VideoDecoder.isConfigSupported(decoderConfig)
        ]);
        if (session !== generation) return;
        if (!encodeSupport.supported || !decodeSupport.supported) {
            throw new Error('VP8 encoding or decoding is unavailable on this device.');
        }
        decoder = new VideoDecoder({
            output(frame) {
                try {
                    if (session === generation && isRunning) ctxDst.drawImage(frame, 0, 0);
                } catch (error) {
                    fail(error);
                } finally {
                    frame.close();
                }
            },
            error: fail
        });
        decoder.configure(decodeSupport.config);
        encoder = new VideoEncoder({
            output(chunk) {
                if (session !== generation || !isRunning || decoder?.state !== 'configured') return;
                try { decoder.decode(chunk); } catch (error) { fail(error); }
            },
            error: fail
        });
        encoder.configure(encodeSupport.config);
        encodedFrames = 0;
        lastTimestamp = -Infinity;
        isStarting = false;
        isRunning = true;
        statusEl.textContent = 'Pipeline running (VP8, up to 30 fps).';
        frameId = requestAnimationFrame(processLoop);
    } catch (error) {
        fail(error);
    }
}

function processLoop(now) {
    if (!isRunning) return;
    try {
        drawSource();
        // Drop raw input under pressure, never encoded delta chunks.
        if (now - lastTimestamp >= 1000 / 30 && encoder.encodeQueueSize < 2 && decoder.decodeQueueSize < 2) {
            const frame = new VideoFrame(srcCanvas, { timestamp: Math.round(now * 1000) });
            try {
                encoder.encode(frame, { keyFrame: encodedFrames % 30 === 0 });
                encodedFrames++;
                lastTimestamp = now;
            } finally {
                frame.close();
            }
        }
        if (isRunning) frameId = requestAnimationFrame(processLoop);
    } catch (error) {
        stopPipeline(`Error: ${error.message}`);
    }
}

startBtn.addEventListener('click', startPipeline);
stopBtn.addEventListener('click', () => stopPipeline());
window.addEventListener('pagehide', () => stopPipeline());
drawSource();
