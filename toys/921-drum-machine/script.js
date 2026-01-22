const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const rows = 4;
const cols = 16;
const cellWidth = canvas.width / cols;
const cellHeight = (canvas.height - 50) / rows;

let grid = [];
let currentStep = 0;
let isPlaying = false;
let lastTime = 0;
const tempo = 120;

const drumNames = ['Kick', 'Snare', 'Hi-Hat', 'Tom'];
const drumColors = ['#E74C3C', '#F39C12', '#3498DB', '#2ECC71'];

function init() {
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            grid[row][col] = Math.random() < 0.2;
        }
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
}

function toggleCell(row, col) {
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        grid[row][col] = !grid[row][col];
    }
}

function update(timestamp) {
    if (isPlaying) {
        const interval = 60000 / tempo / 4;
        if (timestamp - lastTime >= interval) {
            currentStep = (currentStep + 1) % cols;
            lastTime = timestamp;
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    for (let row = 0; row < rows; row++) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(drumNames[row], 5, row * cellHeight + cellHeight / 2 + 30);

        for (let col = 0; col < cols; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight + 20;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);

            if (grid[row][col]) {
                ctx.fillStyle = drumColors[row];
                ctx.fillRect(x + 4, y + 4, cellWidth - 8, cellHeight - 8);

                if (col === currentStep && isPlaying) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 4, y + 4, cellWidth - 8, cellHeight - 8);
                }
            }

            if (col === currentStep && isPlaying) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            }

            if (col % 4 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }
        }
    }
}

function drawPlayhead() {
    const x = currentStep * cellWidth + cellWidth / 2;
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 15);
    ctx.lineTo(x, rows * cellHeight + 25);
    ctx.stroke();

    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(x - 5, 10);
    ctx.lineTo(x + 5, 10);
    ctx.lineTo(x, 18);
    ctx.fill();
}

function drawBeats() {
    const y = canvas.height - 25;
    for (let col = 0; col < cols; col++) {
        const x = col * cellWidth + cellWidth / 2;
        ctx.fillStyle = col === currentStep && isPlaying ? '#E74C3C' : 'rgba(255, 255, 255, 0.3)';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(col + 1, x, y);
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, canvas.height - 45, 100, 25);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(isPlaying ? '播放中...' : '已暫停', 20, canvas.height - 30);
}

function animate(timestamp) {
    update(timestamp);
    drawBackground();
    drawGrid();
    drawPlayhead();
    drawBeats();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const col = Math.floor(x / cellWidth);
    const row = Math.floor((y - 20) / cellHeight);

    toggleCell(row, col);
});

document.getElementById('playBtn').addEventListener('click', togglePlay);

init();
requestAnimationFrame(animate);
