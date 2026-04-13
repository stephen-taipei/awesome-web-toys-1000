const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cols = 12;
const rows = 8;
let data = [];
let targetData = [];
let hoveredCell = { x: -1, y: -1 };

function randomize() {
    targetData = [];
    for (let y = 0; y < rows; y++) {
        targetData[y] = [];
        for (let x = 0; x < cols; x++) {
            targetData[y][x] = Math.random() * 100;
        }
    }
}

function init() {
    data = [];
    for (let y = 0; y < rows; y++) {
        data[y] = [];
        for (let x = 0; x < cols; x++) {
            data[y][x] = 50;
        }
    }
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            data[y][x] = lerp(data[y][x], targetData[y][x], 0.1);
        }
    }
}

function valueToColor(value) {
    if (value < 25) {
        return `rgb(${Math.round(value / 25 * 100)}, ${Math.round(value / 25 * 100)}, ${Math.round(150 + value / 25 * 105)})`;
    } else if (value < 50) {
        const t = (value - 25) / 25;
        return `rgb(${Math.round(100 + t * 155)}, ${Math.round(100 + t * 155)}, ${Math.round(255 - t * 55)})`;
    } else if (value < 75) {
        const t = (value - 50) / 25;
        return `rgb(255, ${Math.round(255 - t * 100)}, ${Math.round(200 - t * 200)})`;
    } else {
        const t = (value - 75) / 25;
        return `rgb(255, ${Math.round(155 - t * 100)}, ${Math.round(t * 50)})`;
    }
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 40, right: 20, top: 30, bottom: 30 };
    const cellWidth = (canvas.width - padding.left - padding.right) / cols;
    const cellHeight = (canvas.height - padding.top - padding.bottom) / rows;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = padding.left + x * cellWidth;
            const py = padding.top + y * cellHeight;
            const value = data[y][x];

            ctx.fillStyle = valueToColor(value);
            ctx.fillRect(px + 1, py + 1, cellWidth - 2, cellHeight - 2);

            if (hoveredCell.x === x && hoveredCell.y === y) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 1, py + 1, cellWidth - 2, cellHeight - 2);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.round(value), px + cellWidth / 2, py + cellHeight / 2);
            }
        }
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    for (let x = 0; x < cols; x++) {
        const px = padding.left + x * cellWidth + cellWidth / 2;
        ctx.fillText(x + 1, px, canvas.height - 10);
    }

    ctx.textAlign = 'right';
    for (let y = 0; y < rows; y++) {
        const py = padding.top + y * cellHeight + cellHeight / 2;
        ctx.fillText(String.fromCharCode(65 + y), padding.left - 10, py + 3);
    }

    const legendWidth = 15;
    const legendHeight = canvas.height - padding.top - padding.bottom;
    const legendX = canvas.width - padding.right + 5;

    for (let i = 0; i < legendHeight; i++) {
        const value = 100 - (i / legendHeight) * 100;
        ctx.fillStyle = valueToColor(value);
        ctx.fillRect(legendX, padding.top + i, legendWidth - 5, 1);
    }
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const padding = { left: 40, right: 20, top: 30, bottom: 30 };
    const cellWidth = (canvas.width - padding.left - padding.right) / cols;
    const cellHeight = (canvas.height - padding.top - padding.bottom) / rows;

    const x = Math.floor((mx - padding.left) / cellWidth);
    const y = Math.floor((my - padding.top) / cellHeight);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        hoveredCell = { x, y };
    } else {
        hoveredCell = { x: -1, y: -1 };
    }
});

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
