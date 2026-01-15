const editor = document.getElementById('editor');
const ctx = editor.getContext('2d');
const preview = document.getElementById('preview');
const previewCtx = preview.getContext('2d');
const framesStrip = document.getElementById('framesStrip');

const gridSize = 16;
editor.width = gridSize;
editor.height = gridSize;
preview.width = gridSize;
preview.height = gridSize;

let frames = [ctx.createImageData(gridSize, gridSize)];
let currentFrame = 0;
let color = '#f39c12';
let drawing = false;
let playing = false;
let animInterval;

function saveCurrentFrame() {
    frames[currentFrame] = ctx.getImageData(0, 0, gridSize, gridSize);
}

function loadFrame(index) {
    ctx.putImageData(frames[index], 0, 0);
}

function updateStrip() {
    framesStrip.innerHTML = '';
    frames.forEach((frame, i) => {
        const thumb = document.createElement('canvas');
        thumb.className = 'frame-thumb' + (i === currentFrame ? ' active' : '');
        thumb.width = gridSize;
        thumb.height = gridSize;
        thumb.getContext('2d').putImageData(frame, 0, 0);
        thumb.addEventListener('click', () => {
            saveCurrentFrame();
            currentFrame = i;
            loadFrame(i);
            updateStrip();
        });
        framesStrip.appendChild(thumb);
    });
}

function getPixel(e) {
    const rect = editor.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
    return { x, y };
}

function paint(e) {
    const { x, y } = getPixel(e);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

editor.addEventListener('mousedown', (e) => { drawing = true; paint(e); });
editor.addEventListener('mousemove', (e) => { if (drawing) paint(e); });
editor.addEventListener('mouseup', () => { drawing = false; saveCurrentFrame(); updateStrip(); });

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);

document.getElementById('addFrame').addEventListener('click', () => {
    saveCurrentFrame();
    frames.push(ctx.createImageData(gridSize, gridSize));
    currentFrame = frames.length - 1;
    ctx.clearRect(0, 0, gridSize, gridSize);
    updateStrip();
});

document.getElementById('playBtn').addEventListener('click', (e) => {
    playing = !playing;
    e.target.textContent = playing ? '⏹ 停止' : '▶ 播放';

    if (playing) {
        saveCurrentFrame();
        let frameIndex = 0;
        animInterval = setInterval(() => {
            previewCtx.putImageData(frames[frameIndex], 0, 0);
            frameIndex = (frameIndex + 1) % frames.length;
        }, 150);
    } else {
        clearInterval(animInterval);
    }
});

updateStrip();
