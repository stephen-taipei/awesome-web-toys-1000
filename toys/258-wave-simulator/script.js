const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const resolution = 100;
let width = 360, height = 360;
let cellSize;
let current, previous;
let damping = 0.99;
let colorHue = 200;

const dampingLevels = [0.99, 0.97, 0.95, 0.9];
let dampingIndex = 0;

function init() {
    setupCanvas();
    initArrays();

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('dampBtn').addEventListener('click', changeDamping);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width;
    canvas.width = width;
    canvas.height = height;
    cellSize = width / resolution;
}

function initArrays() {
    current = [];
    previous = [];
    for (let i = 0; i < resolution; i++) {
        current[i] = [];
        previous[i] = [];
        for (let j = 0; j < resolution; j++) {
            current[i][j] = 0;
            previous[i][j] = 0;
        }
    }
}

function handleClick(e) {
    const pos = getPos(e);
    createWave(pos.x, pos.y, 500);
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.touches[0].clientX - rect.left) / rect.width * resolution);
    const y = Math.floor((e.touches[0].clientY - rect.top) / rect.height * resolution);
    createWave(x, y, 500);
}

function handleMouseMove(e) {
    if (e.buttons !== 1) return;
    const pos = getPos(e);
    createWave(pos.x, pos.y, 100);
}

function handleTouchMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.touches[0].clientX - rect.left) / rect.width * resolution);
    const y = Math.floor((e.touches[0].clientY - rect.top) / rect.height * resolution);
    createWave(x, y, 100);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * resolution);
    const y = Math.floor((e.clientY - rect.top) / rect.height * resolution);
    return { x, y };
}

function createWave(cx, cy, amplitude) {
    const radius = 3;
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const x = cx + i;
            const y = cy + j;
            if (x >= 0 && x < resolution && y >= 0 && y < resolution) {
                const dist = Math.sqrt(i * i + j * j);
                if (dist <= radius) {
                    current[x][y] = amplitude * (1 - dist / radius);
                }
            }
        }
    }
}

function changeColor() {
    colorHue = (colorHue + 60) % 360;
}

function changeDamping() {
    dampingIndex = (dampingIndex + 1) % dampingLevels.length;
    damping = dampingLevels[dampingIndex];
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    for (let i = 1; i < resolution - 1; i++) {
        for (let j = 1; j < resolution - 1; j++) {
            const neighbors = previous[i - 1][j] + previous[i + 1][j] +
                            previous[i][j - 1] + previous[i][j + 1];
            current[i][j] = (neighbors / 2 - current[i][j]) * damping;
        }
    }

    const temp = previous;
    previous = current;
    current = temp;
}

function draw() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const value = current[i][j];
            const brightness = Math.min(255, Math.abs(value) * 0.5);
            const hue = colorHue + value * 0.1;

            const rgb = hslToRgb(hue / 360, 0.8, 0.3 + brightness / 255 * 0.5);

            const startX = Math.floor(i * cellSize);
            const startY = Math.floor(j * cellSize);
            const endX = Math.floor((i + 1) * cellSize);
            const endY = Math.floor((j + 1) * cellSize);

            for (let px = startX; px < endX; px++) {
                for (let py = startY; py < endY; py++) {
                    const idx = (py * width + px) * 4;
                    data[idx] = rgb[0];
                    data[idx + 1] = rgb[1];
                    data[idx + 2] = rgb[2];
                    data[idx + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    initArrays();
});
