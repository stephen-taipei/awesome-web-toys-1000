const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const resolution = 128;
let width = 360, height = 360;
let time = 0;
let paletteIndex = 0;
let speed = 1;

const palettes = [
    () => ({ r: Math.sin, g: Math.cos, b: t => Math.sin(t * 2) }),
    () => ({ r: t => Math.sin(t), g: t => Math.sin(t + 2), b: t => Math.sin(t + 4) }),
    () => ({ r: t => Math.cos(t * 0.5), g: t => Math.sin(t * 0.7), b: t => Math.cos(t) }),
    () => ({ r: t => Math.abs(Math.sin(t)), g: t => Math.abs(Math.cos(t * 1.5)), b: t => Math.abs(Math.sin(t * 0.7)) })
];

function init() {
    setupCanvas();

    document.getElementById('paletteBtn').addEventListener('click', changePalette);
    document.getElementById('speedBtn').addEventListener('click', changeSpeed);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width;
    canvas.width = resolution;
    canvas.height = resolution;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function changePalette() {
    paletteIndex = (paletteIndex + 1) % palettes.length;
}

function changeSpeed() {
    speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1;
}

function gameLoop() {
    time += 0.02 * speed;
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    const imageData = ctx.createImageData(resolution, resolution);
    const data = imageData.data;
    const palette = palettes[paletteIndex]();

    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            const value = plasma(x, y, time);

            const r = (palette.r(value) + 1) / 2;
            const g = (palette.g(value) + 1) / 2;
            const b = (palette.b(value) + 1) / 2;

            const idx = (y * resolution + x) * 4;
            data[idx] = Math.floor(r * 255);
            data[idx + 1] = Math.floor(g * 255);
            data[idx + 2] = Math.floor(b * 255);
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function plasma(x, y, t) {
    const scale = 0.05;

    let value = 0;

    value += Math.sin(x * scale + t);
    value += Math.sin(y * scale + t * 0.5);
    value += Math.sin((x + y) * scale * 0.5 + t);

    const cx = x - resolution / 2;
    const cy = y - resolution / 2;
    value += Math.sin(Math.sqrt(cx * cx + cy * cy) * scale + t);

    value += Math.sin(x * scale * Math.cos(t * 0.5) + y * scale * Math.sin(t * 0.3));

    return value;
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
