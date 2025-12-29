const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20, cellSize = 15;
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

let snake = [], food = { x: 0, y: 0 }, direction = { x: 1, y: 0 };
let score = 0, highScore = 0, isPlaying = false, gameInterval = null;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKey);
    document.getElementById('upBtn').addEventListener('click', () => setDir(0, -1));
    document.getElementById('downBtn').addEventListener('click', () => setDir(0, 1));
    document.getElementById('leftBtn').addEventListener('click', () => setDir(-1, 0));
    document.getElementById('rightBtn').addEventListener('click', () => setDir(1, 0));
    draw();
}

function setDir(x, y) {
    if (direction.x !== -x || direction.y !== -y) {
        direction = { x, y };
    }
}

function handleKey(e) {
    switch(e.key) {
        case 'ArrowUp': setDir(0, -1); break;
        case 'ArrowDown': setDir(0, 1); break;
        case 'ArrowLeft': setDir(-1, 0); break;
        case 'ArrowRight': setDir(1, 0); break;
    }
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    score = 0;
    spawnFood();
    isPlaying = true;
    document.getElementById('score').textContent = score;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
}

function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * gridSize);
        food.y = Math.floor(Math.random() * gridSize);
    } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function gameLoop() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }

    draw();
}

function endGame() {
    clearInterval(gameInterval);
    isPlaying = false;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
        ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });

    if (!isPlaying && score > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束', canvas.width/2, canvas.height/2);
    }
}

document.addEventListener('DOMContentLoaded', init);
