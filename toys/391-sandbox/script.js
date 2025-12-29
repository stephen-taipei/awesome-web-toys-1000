const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 4;
const COLS = canvas.width / CELL_SIZE;
const ROWS = canvas.height / CELL_SIZE;

const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const FIRE = 3;
const PLANT = 4;

let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
let currentTool = 'sand';
let isDrawing = false;

const colors = {
    [EMPTY]: '#2d3436',
    [SAND]: '#f1c40f',
    [WATER]: '#3498db',
    [FIRE]: '#e74c3c',
    [PLANT]: '#27ae60'
};

document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

function getToolType() {
    switch(currentTool) {
        case 'sand': return SAND;
        case 'water': return WATER;
        case 'fire': return FIRE;
        case 'plant': return PLANT;
        default: return EMPTY;
    }
}

function addParticles(x, y) {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const type = getToolType();

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const r = row + dy;
            const c = col + dx;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                if (currentTool === 'erase' || grid[r][c] === EMPTY) {
                    grid[r][c] = type;
                }
            }
        }
    }
}

function update() {
    const newGrid = grid.map(row => [...row]);

    for (let row = ROWS - 2; row >= 0; row--) {
        for (let col = 0; col < COLS; col++) {
            const cell = grid[row][col];

            if (cell === SAND) {
                if (grid[row + 1][col] === EMPTY) {
                    newGrid[row][col] = EMPTY;
                    newGrid[row + 1][col] = SAND;
                } else if (grid[row + 1][col] === WATER) {
                    newGrid[row][col] = WATER;
                    newGrid[row + 1][col] = SAND;
                } else if (col > 0 && grid[row + 1][col - 1] === EMPTY) {
                    newGrid[row][col] = EMPTY;
                    newGrid[row + 1][col - 1] = SAND;
                } else if (col < COLS - 1 && grid[row + 1][col + 1] === EMPTY) {
                    newGrid[row][col] = EMPTY;
                    newGrid[row + 1][col + 1] = SAND;
                }
            }

            if (cell === WATER) {
                if (grid[row + 1][col] === EMPTY) {
                    newGrid[row][col] = EMPTY;
                    newGrid[row + 1][col] = WATER;
                } else {
                    const dir = Math.random() < 0.5 ? -1 : 1;
                    if (col + dir >= 0 && col + dir < COLS && grid[row][col + dir] === EMPTY) {
                        newGrid[row][col] = EMPTY;
                        newGrid[row][col + dir] = WATER;
                    }
                }
            }

            if (cell === FIRE) {
                if (Math.random() < 0.1) {
                    newGrid[row][col] = EMPTY;
                } else if (row > 0 && Math.random() < 0.3) {
                    newGrid[row][col] = EMPTY;
                    newGrid[row - 1][col] = FIRE;
                }
                // Fire spreads to plants
                [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        if (grid[nr][nc] === PLANT && Math.random() < 0.1) {
                            newGrid[nr][nc] = FIRE;
                        }
                        if (grid[nr][nc] === WATER) {
                            newGrid[row][col] = EMPTY;
                        }
                    }
                });
            }

            if (cell === PLANT) {
                if (Math.random() < 0.01) {
                    [[0,1],[0,-1],[-1,0]].forEach(([dr, dc]) => {
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === EMPTY) {
                            if (Math.random() < 0.1) newGrid[nr][nc] = PLANT;
                        }
                    });
                }
            }
        }
    }

    grid = newGrid;
}

function draw() {
    ctx.fillStyle = colors[EMPTY];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col] !== EMPTY) {
                ctx.fillStyle = colors[grid[row][col]];
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

canvas.addEventListener('mousedown', (e) => { isDrawing = true; });
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    addParticles(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    addParticles(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; });
canvas.addEventListener('touchend', () => { isDrawing = false; });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    addParticles(touch.clientX - rect.left, touch.clientY - rect.top);
});

document.getElementById('clearAll').addEventListener('click', () => {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
