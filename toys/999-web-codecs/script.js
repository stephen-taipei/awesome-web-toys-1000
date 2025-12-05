const srcCanvas = document.getElementById('srcCanvas');
const dstCanvas = document.getElementById('dstCanvas');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const supportEl = document.getElementById('support');

const ctxSrc = srcCanvas.getContext('2d');
const ctxDst = dstCanvas.getContext('2d');

let isRunning = false;
let frameId;
let encoder, decoder;
let frameCounter = 0;

// Check support
if ('VideoEncoder' in window && 'VideoDecoder' in window) {
    supportEl.textContent = 'YES';
    supportEl.classList.add('success');
} else {
    supportEl.textContent = 'NO (Browser not supported)';
    supportEl.classList.add('error');
    startBtn.disabled = true;
}

// Animation Loop for Source
function drawSource() {
    ctxSrc.fillStyle = '#000';
    ctxSrc.fillRect(0, 0, srcCanvas.width, srcCanvas.height);

    // Draw bouncing ball or something dynamic
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

async function startPipeline() {
    try {
        const init = {
            output: handleChunk,
            error: (e) => console.error(e.message)
        };

        const config = {
            codec: 'vp8',
            width: srcCanvas.width,
            height: srcCanvas.height,
            bitrate: 1000000, // 1 Mbps
            framerate: 30
        };

        encoder = new VideoEncoder(init);
        encoder.configure(config);

        decoder = new VideoDecoder({
            output: handleFrame,
            error: (e) => console.error(e.message)
        });
        decoder.configure({
            codec: 'vp8',
            codedWidth: srcCanvas.width,
            codedHeight: srcCanvas.height
        });

        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusEl.innerHTML = 'Pipeline running...';

        processLoop();

    } catch (e) {
        statusEl.textContent = `Error: ${e.message}`;
    }
}

function handleChunk(chunk) {
    decoder.decode(chunk);
}

function handleFrame(frame) {
    ctxDst.drawImage(frame, 0, 0);
    frame.close();
}

async function processLoop() {
    if (!isRunning) return;

    drawSource();

    // Create VideoFrame from canvas
    const frame = new VideoFrame(srcCanvas, { timestamp: performance.now() * 1000 });
    
    // Key frame every 30 frames
    const keyFrame = frameCounter % 30 === 0;
    
    encoder.encode(frame, { keyFrame });
    frame.close();

    frameId = requestAnimationFrame(processLoop);
}

function stopPipeline() {
    isRunning = false;
    cancelAnimationFrame(frameId);
    
    if (encoder) {
        encoder.close();
        encoder = null;
    }
    if (decoder) {
        decoder.close();
        decoder = null;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusEl.textContent = 'Stopped.';
}

startBtn.addEventListener('click', startPipeline);
stopBtn.addEventListener('click', stopPipeline);

// Initial draw
drawSource();
