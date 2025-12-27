let canvas, ctx;
let grid = [];
let gridSize = 100;
let leftTemp = 100, rightTemp = 0;
let conductivity = 0.1;
let isPaused = false;
let isMouseDown = false;
let heatMode = true;

function init() {
    canvas = document.getElementById('heatCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    resetGrid();
    animate();
}

function resizeCanvas() {
    const size = Math.min(600, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size * 0.6;
}

function resetGrid() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = 20; // Room temperature
        }
    }
}

function setupControls() {
    document.getElementById('leftTemp').addEventListener('input', (e) => {
        leftTemp = parseInt(e.target.value);
        document.getElementById('leftTempValue').textContent = leftTemp + '°C';
    });
    document.getElementById('rightTemp').addEventListener('input', (e) => {
        rightTemp = parseInt(e.target.value);
        document.getElementById('rightTempValue').textContent = rightTemp + '°C';
    });
    document.getElementById('conductivity').addEventListener('input', (e) => {
        conductivity = parseFloat(e.target.value);
        document.getElementById('conductivityValue').textContent = conductivity.toFixed(2);
    });
    document.getElementById('resetBtn').addEventListener('click', resetGrid);
    document.getElementById('pauseBtn').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pauseBtn').textContent = isPaused ? '繼續' : '暫停';
    });

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        heatMode = e.button !== 2;
        addHeat(e);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) addHeat(e);
    });
    canvas.addEventListener('mouseup', () => isMouseDown = false);
    canvas.addEventListener('mouseleave', () => isMouseDown = false);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

function addHeat(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const gridX = Math.floor(x * gridSize);
    const gridY = Math.floor(y * gridSize);
    const radius = 3;
    const temp = heatMode ? 100 : 0;

    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const gi = gridX + i;
            const gj = gridY + j;
            if (gi >= 0 && gi < gridSize && gj >= 0 && gj < gridSize) {
                const d = Math.sqrt(i * i + j * j);
                if (d <= radius) {
                    grid[gi][gj] = temp;
                }
            }
        }
    }
}

function update() {
    if (isPaused) return;

    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
        newGrid[i] = grid[i].slice();
    }

    // Apply boundary conditions
    for (let j = 0; j < gridSize; j++) {
        grid[0][j] = leftTemp;
        grid[gridSize - 1][j] = rightTemp;
    }

    // Heat diffusion using finite difference
    for (let i = 1; i < gridSize - 1; i++) {
        for (let j = 1; j < gridSize - 1; j++) {
            const laplacian = grid[i-1][j] + grid[i+1][j] + grid[i][j-1] + grid[i][j+1] - 4 * grid[i][j];
            newGrid[i][j] = grid[i][j] + conductivity * laplacian;
            newGrid[i][j] = Math.max(0, Math.min(100, newGrid[i][j]));
        }
    }

    grid = newGrid;
}

function tempToColor(temp) {
    const t = temp / 100;
    let r, g, b;

    if (t < 0.25) {
        r = 0;
        g = Math.floor(t * 4 * 255);
        b = 255;
    } else if (t < 0.5) {
        r = 0;
        g = 255;
        b = Math.floor((1 - (t - 0.25) * 4) * 255);
    } else if (t < 0.75) {
        r = Math.floor((t - 0.5) * 4 * 255);
        g = 255;
        b = 0;
    } else {
        r = 255;
        g = Math.floor((1 - (t - 0.75) * 4) * 255);
        b = 0;
    }

    return `rgb(${r},${g},${b})`;
}

function draw() {
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = tempToColor(grid[i][j]);
            ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth + 1, cellHeight + 1);
        }
    }

    // Draw boundary indicators
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '12px monospace';
    ctx.fillText(leftTemp + '°C', 5, 15);
    ctx.fillText(rightTemp + '°C', canvas.width - 35, 15);
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
