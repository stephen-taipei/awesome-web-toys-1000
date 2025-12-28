const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const resolution = 120;
let width, height;
let grid = [];
let materialType = 0;
let isDrawing = false;

const materials = [
    { name: 'sand', colors: ['#f4d03f', '#e9c83e', '#d4b82c'] },
    { name: 'water', colors: ['#3498db', '#2980b9', '#2471a3'] },
    { name: 'stone', colors: ['#7f8c8d', '#6c757d', '#5a6268'] }
];

function init() {
    setupCanvas();
    initGrid();

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', () => isDrawing = false);

    document.getElementById('colorBtn').addEventListener('click', changeMaterial);
    document.getElementById('clearBtn').addEventListener('click', initGrid);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    const displayWidth = Math.min(360, wrapper.clientWidth);
    width = resolution;
    height = Math.floor(resolution * 1.25);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = (displayWidth * height / width) + 'px';
}

function initGrid() {
    grid = [];
    for (let i = 0; i < width * height; i++) {
        grid[i] = null;
    }
}

function changeMaterial() {
    materialType = (materialType + 1) % materials.length;
}

function handleMouse(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    addParticles(pos.x, pos.y);
}

function handleTouchStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getTouchPos(e);
    addParticles(pos.x, pos.y);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getTouchPos(e);
    addParticles(pos.x, pos.y);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((e.clientX - rect.left) / rect.width * width),
        y: Math.floor((e.clientY - rect.top) / rect.height * height)
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((e.touches[0].clientX - rect.left) / rect.width * width),
        y: Math.floor((e.touches[0].clientY - rect.top) / rect.height * height)
    };
}

function addParticles(cx, cy) {
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
            const x = cx + dx;
            const y = cy + dy;
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = y * width + x;
                if (!grid[idx] && Math.random() < 0.5) {
                    const mat = materials[materialType];
                    grid[idx] = {
                        type: materialType,
                        color: mat.colors[Math.floor(Math.random() * mat.colors.length)]
                    };
                }
            }
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    for (let y = height - 2; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (!grid[idx]) continue;

            const particle = grid[idx];
            const below = (y + 1) * width + x;
            const belowLeft = (y + 1) * width + (x - 1);
            const belowRight = (y + 1) * width + (x + 1);

            if (particle.type === 0) {
                if (!grid[below]) {
                    grid[below] = particle;
                    grid[idx] = null;
                } else if (x > 0 && !grid[belowLeft] && Math.random() < 0.5) {
                    grid[belowLeft] = particle;
                    grid[idx] = null;
                } else if (x < width - 1 && !grid[belowRight]) {
                    grid[belowRight] = particle;
                    grid[idx] = null;
                }
            } else if (particle.type === 1) {
                if (!grid[below]) {
                    grid[below] = particle;
                    grid[idx] = null;
                } else {
                    const dir = Math.random() < 0.5 ? -1 : 1;
                    const side = y * width + (x + dir);
                    if (x + dir >= 0 && x + dir < width && !grid[side]) {
                        grid[side] = particle;
                        grid[idx] = null;
                    }
                }
            }
        }
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const particle = grid[y * width + x];
            if (particle) {
                ctx.fillStyle = particle.color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
