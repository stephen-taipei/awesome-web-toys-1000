const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 180, height = 200;
let firePixels = [];
let palette = [];
let colorMode = 0;
let intensity = 1;

function init() {
    setupCanvas();
    createPalette();
    initFire();

    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('intensityBtn').addEventListener('click', changeIntensity);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    const displayWidth = Math.min(360, wrapper.clientWidth);
    width = 180;
    height = 200;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = (displayWidth * height / width) + 'px';
    canvas.style.imageRendering = 'pixelated';
}

function createPalette() {
    palette = [];
    for (let i = 0; i < 256; i++) {
        let r, g, b;
        if (colorMode === 0) {
            r = Math.min(255, i * 3);
            g = Math.min(255, Math.max(0, (i - 50) * 2.5));
            b = Math.max(0, (i - 180) * 5);
        } else if (colorMode === 1) {
            r = Math.min(255, Math.max(0, (i - 50) * 2));
            g = Math.min(255, i * 2);
            b = Math.min(255, Math.max(0, (i - 100) * 3));
        } else {
            r = Math.min(255, Math.max(0, (i - 80) * 3));
            g = Math.min(255, Math.max(0, (i - 100) * 3));
            b = Math.min(255, i * 3);
        }
        palette.push({ r, g, b });
    }
}

function initFire() {
    firePixels = [];
    for (let i = 0; i < width * height; i++) {
        firePixels[i] = 0;
    }
}

function changeColor() {
    colorMode = (colorMode + 1) % 3;
    createPalette();
}

function changeIntensity() {
    intensity = intensity === 1 ? 1.5 : intensity === 1.5 ? 0.5 : 1;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    for (let x = 0; x < width; x++) {
        const idx = (height - 1) * width + x;
        firePixels[idx] = Math.random() < 0.6 * intensity ? 255 : Math.floor(Math.random() * 128);
    }

    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            const below = ((y + 1) * width + x);
            const belowLeft = ((y + 1) * width + Math.max(0, x - 1));
            const belowRight = ((y + 1) * width + Math.min(width - 1, x + 1));
            const belowBelow = (Math.min(height - 1, y + 2) * width + x);

            const avg = (firePixels[below] + firePixels[belowLeft] +
                        firePixels[belowRight] + firePixels[belowBelow]) / 4;

            const decay = 1 + Math.random() * 2;
            firePixels[idx] = Math.max(0, Math.floor(avg - decay));
        }
    }
}

function draw() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < firePixels.length; i++) {
        const color = palette[firePixels[i]];
        const idx = i * 4;
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
