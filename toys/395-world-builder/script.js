const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 30;
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;

let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
let currentBlock = 'grass';
let isDrawing = false;

const blocks = {
    grass: { color: '#27ae60', emoji: '🌿' },
    water: { color: '#3498db', emoji: '💧' },
    sand: { color: '#f1c40f', emoji: '🏖️' },
    stone: { color: '#7f8c8d', emoji: '🪨' },
    tree: { color: '#27ae60', emoji: '🌳' },
    house: { color: '#e74c3c', emoji: '🏠' }
};

document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentBlock = btn.dataset.block;
    });
});

function placeBlock(x, y) {
    const col = Math.floor(x / GRID_SIZE);
    const row = Math.floor(y / GRID_SIZE);

    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        if (currentBlock === 'erase') {
            grid[row][col] = null;
        } else {
            grid[row][col] = currentBlock;
        }
        draw();
    }
}

function draw() {
    // Sky background
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw blocks
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const block = grid[row][col];
            if (block && blocks[block]) {
                const x = col * GRID_SIZE;
                const y = row * GRID_SIZE;

                ctx.fillStyle = blocks[block].color;
                ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);

                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(blocks[block].emoji, x + GRID_SIZE / 2, y + GRID_SIZE / 2);
            }
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    placeBlock(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    placeBlock(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseleave', () => { isDrawing = false; });

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    placeBlock(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    placeBlock(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener('touchend', () => { isDrawing = false; });

document.getElementById('clearAll').addEventListener('click', () => {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    draw();
});

draw();
