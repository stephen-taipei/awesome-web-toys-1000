const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300;
const holes = [];
let score = 0, timeLeft = 30, isPlaying = false;
let gameInterval = null, timerInterval = null;

function init() {
    canvas.width = size; canvas.height = size;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            holes.push({
                x: col * 100 + 50,
                y: row * 100 + 50,
                hasMole: false,
                hitTime: 0
            });
        }
    }
    canvas.addEventListener('click', handleClick);
    document.getElementById('startBtn').addEventListener('click', startGame);
    draw();
}

function startGame() {
    score = 0;
    timeLeft = 30;
    isPlaying = true;
    holes.forEach(h => { h.hasMole = false; h.hitTime = 0; });
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;

    gameInterval = setInterval(spawnMole, 800);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function spawnMole() {
    holes.forEach(h => h.hasMole = false);
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    randomHole.hasMole = true;
    draw();

    setTimeout(() => {
        if (randomHole.hasMole) {
            randomHole.hasMole = false;
            draw();
        }
    }, 700);
}

function handleClick(e) {
    if (!isPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    holes.forEach(hole => {
        const dist = Math.sqrt((x - hole.x) ** 2 + (y - hole.y) ** 2);
        if (dist < 35 && hole.hasMole) {
            score += 10;
            hole.hasMole = false;
            hole.hitTime = Date.now();
            document.getElementById('score').textContent = score;
            draw();
        }
    });
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    isPlaying = false;
    holes.forEach(h => h.hasMole = false);
    draw();
}

function draw() {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#3d7a1a';
    ctx.fillRect(0, 0, size, size);

    holes.forEach(hole => {
        ctx.fillStyle = '#2d1810';
        ctx.beginPath();
        ctx.ellipse(hole.x, hole.y + 10, 35, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        if (hole.hasMole) {
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.arc(hole.x, hole.y - 10, 25, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(hole.x - 8, hole.y - 15, 4, 0, Math.PI * 2);
            ctx.arc(hole.x + 8, hole.y - 15, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.ellipse(hole.x, hole.y - 5, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (Date.now() - hole.hitTime < 200) {
            ctx.fillStyle = '#ff0';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+10', hole.x, hole.y - 30);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
