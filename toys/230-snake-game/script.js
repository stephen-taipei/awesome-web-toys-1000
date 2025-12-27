const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let canvasSize = 400;
let tileCount;

let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;
let gameLoop = null;
let isPlaying = false;

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);

    document.addEventListener('keydown', handleKeydown);

    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDirection(btn.dataset.dir));
    });
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    canvasSize = Math.min(400, wrapper.clientWidth - 6);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    tileCount = canvasSize / gridSize;
}

function startGame() {
    snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    isPlaying = true;

    placeFood();
    updateStats();

    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('show');

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 100);
}

function gameStep() {
    direction = nextDirection;
    moveSnake();
    if (checkCollision()) {
        endGame();
        return;
    }
    if (checkFood()) {
        score += 10;
        updateStats();
        placeFood();
    } else {
        snake.pop();
    }
    draw();
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function checkFood() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

function placeFood() {
    do {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
    } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0, Math.PI * 2
    );
    ctx.fill();

    snake.forEach((seg, i) => {
        const gradient = ctx.createRadialGradient(
            seg.x * gridSize + gridSize / 2,
            seg.y * gridSize + gridSize / 2,
            0,
            seg.x * gridSize + gridSize / 2,
            seg.y * gridSize + gridSize / 2,
            gridSize / 2
        );
        gradient.addColorStop(0, i === 0 ? '#2ecc71' : '#27ae60');
        gradient.addColorStop(1, i === 0 ? '#27ae60' : '#1e8449');
        ctx.fillStyle = gradient;
        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

function handleKeydown(e) {
    const key = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
    }
    if (key === 'ArrowUp') handleDirection('up');
    if (key === 'ArrowDown') handleDirection('down');
    if (key === 'ArrowLeft') handleDirection('left');
    if (key === 'ArrowRight') handleDirection('right');
}

function handleDirection(dir) {
    if (!isPlaying) return;
    if (dir === 'up' && direction.y !== 1) nextDirection = { x: 0, y: -1 };
    if (dir === 'down' && direction.y !== -1) nextDirection = { x: 0, y: 1 };
    if (dir === 'left' && direction.x !== 1) nextDirection = { x: -1, y: 0 };
    if (dir === 'right' && direction.x !== -1) nextDirection = { x: 1, y: 0 };
}

function updateStats() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function endGame() {
    isPlaying = false;
    clearInterval(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.add('show');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
