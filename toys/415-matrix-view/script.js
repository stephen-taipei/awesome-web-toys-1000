const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const SIZE = 8;
const PADDING = 50;
const CELL_SIZE = (canvas.width - PADDING * 2) / SIZE;

const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let matrix = [];
let hovered = null;

function generateMatrix() {
    matrix = [];
    for (let i = 0; i < SIZE; i++) {
        matrix[i] = [];
        for (let j = 0; j < SIZE; j++) {
            if (i === j) {
                matrix[i][j] = 0;
            } else {
                matrix[i][j] = Math.random() > 0.6 ? Math.random() : 0;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < SIZE; i++) {
        // Row labels
        ctx.fillText(labels[i], PADDING / 2, PADDING + i * CELL_SIZE + CELL_SIZE / 2);
        // Column labels
        ctx.fillText(labels[i], PADDING + i * CELL_SIZE + CELL_SIZE / 2, PADDING / 2);
    }

    // Draw cells
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const x = PADDING + j * CELL_SIZE;
            const y = PADDING + i * CELL_SIZE;
            const value = matrix[i][j];

            // Cell background
            if (hovered && (hovered.row === i || hovered.col === j)) {
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
            }
            ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);

            // Value indicator
            if (value > 0) {
                const size = value * (CELL_SIZE - 8);
                ctx.fillStyle = `rgba(231, 76, 60, ${0.3 + value * 0.7})`;
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Highlight hovered cell
    if (hovered) {
        const x = PADDING + hovered.col * CELL_SIZE;
        const y = PADDING + hovered.row * CELL_SIZE;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
    }
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const col = Math.floor((mx - PADDING) / CELL_SIZE);
    const row = Math.floor((my - PADDING) / CELL_SIZE);

    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
        hovered = { row, col };
        const value = matrix[row][col];
        if (value > 0) {
            infoEl.textContent = `${labels[row]} → ${labels[col]}: ${(value * 100).toFixed(0)}% 連結強度`;
        } else {
            infoEl.textContent = `${labels[row]} 與 ${labels[col]} 無連結`;
        }
    } else {
        hovered = null;
        infoEl.textContent = '懸停查看連結關係';
    }

    draw();
});

canvas.addEventListener('mouseleave', () => {
    hovered = null;
    infoEl.textContent = '懸停查看連結關係';
    draw();
});

document.getElementById('randomize').addEventListener('click', () => {
    generateMatrix();
    draw();
});

generateMatrix();
draw();
