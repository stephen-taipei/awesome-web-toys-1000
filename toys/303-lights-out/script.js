const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, gridSize = 5, cellSize = size / gridSize;
canvas.width = size; canvas.height = size;

let lights = [], moves = 0;

function init() {
    document.getElementById('newBtn').addEventListener('click', newGame);
    canvas.addEventListener('click', handleClick);
    newGame();
}

function newGame() {
    lights = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    moves = 0;
    document.getElementById('moves').textContent = moves;
    document.getElementById('status').textContent = '';

    for (let i = 0; i < 10; i++) {
        const r = Math.floor(Math.random() * gridSize);
        const c = Math.floor(Math.random() * gridSize);
        toggle(r, c);
    }
    moves = 0;
    document.getElementById('moves').textContent = moves;
    draw();
}

function toggle(row, col) {
    const positions = [
        [row, col], [row-1, col], [row+1, col], [row, col-1], [row, col+1]
    ];
    positions.forEach(([r, c]) => {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
            lights[r][c] = !lights[r][c];
        }
    });
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    toggle(row, col);
    moves++;
    document.getElementById('moves').textContent = moves;
    draw();
    checkWin();
}

function checkWin() {
    const allOff = lights.every(row => row.every(light => !light));
    if (allOff) {
        document.getElementById('status').textContent = '恭喜! 全部關閉!';
    }
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * cellSize + 3;
            const y = row * cellSize + 3;
            const s = cellSize - 6;

            if (lights[row][col]) {
                const gradient = ctx.createRadialGradient(x + s/2, y + s/2, 0, x + s/2, y + s/2, s/2);
                gradient.addColorStop(0, '#fff7aa');
                gradient.addColorStop(0.5, '#f1c40f');
                gradient.addColorStop(1, '#f39c12');
                ctx.fillStyle = gradient;
                ctx.shadowColor = '#f1c40f';
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = '#333';
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.roundRect(x, y, s, s, 8);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
