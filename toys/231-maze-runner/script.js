const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

let mazeSize = 11;
let cellSize;
let maze = [];
let player = { x: 1, y: 1 };
let exit = { x: 0, y: 0 };
let moves = 0;
let level = 1;
let seconds = 0;
let timerInterval = null;

function init() {
    setupCanvas();
    generateMaze();
    draw();
    startTimer();

    document.getElementById('newMazeBtn').addEventListener('click', newMaze);
    document.addEventListener('keydown', handleKeydown);
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', () => movePlayer(btn.dataset.dir));
    });
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    const size = Math.min(400, wrapper.clientWidth - 6);
    canvas.width = size;
    canvas.height = size;
    cellSize = size / mazeSize;
}

function generateMaze() {
    maze = [];
    for (let y = 0; y < mazeSize; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            maze[y][x] = 1;
        }
    }

    const stack = [];
    const startX = 1, startY = 1;
    maze[startY][startX] = 0;
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current.x, current.y);

        if (neighbors.length === 0) {
            stack.pop();
        } else {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
            maze[next.y][next.x] = 0;
            stack.push(next);
        }
    }

    player = { x: 1, y: 1 };
    exit = { x: mazeSize - 2, y: mazeSize - 2 };
    maze[exit.y][exit.x] = 0;
}

function getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const dirs = [
        { x: 0, y: -2 }, { x: 0, y: 2 },
        { x: -2, y: 0 }, { x: 2, y: 0 }
    ];

    dirs.forEach(d => {
        const nx = x + d.x, ny = y + d.y;
        if (nx > 0 && nx < mazeSize - 1 && ny > 0 && ny < mazeSize - 1 && maze[ny][nx] === 1) {
            neighbors.push({ x: nx, y: ny });
        }
    });

    return neighbors;
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#34495e';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(exit.x * cellSize + 2, exit.y * cellSize + 2, cellSize - 4, cellSize - 4);

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        player.x * cellSize + cellSize / 2,
        player.y * cellSize + cellSize / 2,
        cellSize / 2 - 4,
        0, Math.PI * 2
    );
    ctx.fill();
}

function handleKeydown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    if (e.key === 'ArrowUp') movePlayer('up');
    if (e.key === 'ArrowDown') movePlayer('down');
    if (e.key === 'ArrowLeft') movePlayer('left');
    if (e.key === 'ArrowRight') movePlayer('right');
}

function movePlayer(dir) {
    let nx = player.x, ny = player.y;
    if (dir === 'up') ny--;
    if (dir === 'down') ny++;
    if (dir === 'left') nx--;
    if (dir === 'right') nx++;

    if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && maze[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
        moves++;
        document.getElementById('moves').textContent = moves;
        draw();

        if (player.x === exit.x && player.y === exit.y) {
            levelComplete();
        }
    }
}

function levelComplete() {
    level++;
    mazeSize = Math.min(21, 9 + level * 2);
    document.getElementById('level').textContent = level;

    setTimeout(() => {
        setupCanvas();
        generateMaze();
        draw();
    }, 500);
}

function newMaze() {
    level = 1;
    mazeSize = 11;
    moves = 0;
    seconds = 0;
    document.getElementById('level').textContent = level;
    document.getElementById('moves').textContent = moves;
    document.getElementById('timer').textContent = '0:00';

    setupCanvas();
    generateMaze();
    draw();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timer').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    draw();
});
