const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cellSize = 8;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);

let grid = [];
let isPlaying = false;
let animationId = null;

function createGrid() {
    grid = [];
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;
        }
    }
}

function randomize() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() > 0.7 ? 1 : 0;
        }
    }
}

function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const ni = (x + i + cols) % cols;
            const nj = (y + j + rows) % rows;
            count += grid[ni][nj];
        }
    }
    return count;
}

function nextGeneration() {
    const newGrid = [];
    for (let i = 0; i < cols; i++) {
        newGrid[i] = [];
        for (let j = 0; j < rows; j++) {
            const neighbors = countNeighbors(i, j);
            const cell = grid[i][j];

            if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[i][j] = 0;
            } else if (cell === 0 && neighbors === 3) {
                newGrid[i][j] = 1;
            } else {
                newGrid[i][j] = cell;
            }
        }
    }
    grid = newGrid;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
            }
        }
    }
}

function animate() {
    if (isPlaying) {
        nextGeneration();
        draw();
        animationId = setTimeout(() => requestAnimationFrame(animate), 100);
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').textContent = isPlaying ? '暫停' : '播放';
    if (isPlaying) {
        animate();
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width) / cellSize);
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height) / cellSize);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        grid[x][y] = grid[x][y] ? 0 : 1;
        draw();
    }
});

document.getElementById('playBtn').addEventListener('click', togglePlay);

document.getElementById('clearBtn').addEventListener('click', () => {
    createGrid();
    draw();
});

document.getElementById('randomBtn').addEventListener('click', () => {
    randomize();
    draw();
});

createGrid();
randomize();
draw();
