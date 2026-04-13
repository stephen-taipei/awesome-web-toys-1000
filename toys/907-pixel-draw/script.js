const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gridSize = 15;
canvas.width = 370;
canvas.height = 300;

const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

let pixels = [];
let currentHue = 0;
let isDrawing = false;

const colors = [
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F',
    '#9B59B6', '#1ABC9C', '#E67E22', '#ECF0F1'
];

function init() {
    for (let y = 0; y < rows; y++) {
        pixels[y] = [];
        for (let x = 0; x < cols; x++) {
            pixels[y][x] = null;
        }
    }
}

function clearCanvas() {
    init();
}

function getPixelCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return {
        col: Math.floor(x / gridSize),
        row: Math.floor(y / gridSize)
    };
}

function setPixel(col, row) {
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
        currentHue = (currentHue + 5) % 360;
        pixels[row][col] = `hsl(${currentHue}, 70%, 60%)`;
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPixels() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (pixels[y][x]) {
                ctx.fillStyle = pixels[y][x];
                ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, 3);
                ctx.fillRect(x * gridSize + 1, y * gridSize + 1, 3, gridSize - 2);
            }
        }
    }
}

function countPixels() {
    let count = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (pixels[y][x]) count++;
        }
    }
    return count;
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`像素: ${countPixels()}`, 20, 28);
}

function render() {
    drawBackground();
    drawPixels();
    drawInfo();
    requestAnimationFrame(render);
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { col, row } = getPixelCoords(e.clientX, e.clientY);
    setPixel(col, row);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const { col, row } = getPixelCoords(e.clientX, e.clientY);
        setPixel(col, row);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    const { col, row } = getPixelCoords(touch.clientX, touch.clientY);
    setPixel(col, row);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        const touch = e.touches[0];
        const { col, row } = getPixelCoords(touch.clientX, touch.clientY);
        setPixel(col, row);
    }
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);

init();
render();
