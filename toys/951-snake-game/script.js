const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const gridSize = 15;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameRunning = false;
let gameLoop;

function init() {
    snake = [
        { x: 5, y: Math.floor(rows / 2) },
        { x: 4, y: Math.floor(rows / 2) },
        { x: 3, y: Math.floor(rows / 2) }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    spawnFood();
}

function spawnFood() {
    do {
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function update() {
    direction = nextDirection;

    const head = {
        x: (snake[0].x + direction.x + cols) % cols,
        y: (snake[0].y + direction.y + rows) % rows
    };

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = '#0a150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(76, 175, 80, 0.1)';
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    snake.forEach((segment, i) => {
        const brightness = 100 - (i / snake.length) * 50;
        ctx.fillStyle = `hsl(120, 70%, ${brightness}%)`;
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0, Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 80, 30);
    ctx.fillStyle = '#4CAF50';
    ctx.font = '14px Arial';
    ctx.fillText(`分數: ${score}`, 20, 30);
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('遊戲結束!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText(`最終分數: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = 'left';
}

function startGame() {
    if (gameRunning) return;
    init();
    gameRunning = true;
    gameLoop = setInterval(() => {
        update();
        draw();
    }, 100);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }
});

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    if (Math.abs(x) > Math.abs(y)) {
        if (x > 0 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
        else if (x < 0 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
    } else {
        if (y > 0 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
        else if (y < 0 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
    }
});

document.getElementById('startBtn').addEventListener('click', startGame);

init();
draw();
