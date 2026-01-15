const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const currentPlayerEl = document.getElementById('currentPlayer');
const timerEl = document.getElementById('timer');

canvas.width = 370;
canvas.height = 240;

const players = ['玩家 1', '玩家 2', '玩家 3', '玩家 4'];
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
let currentIndex = 0;
let timeLeft = 10;
let timerInterval = null;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function nextPlayer() {
    currentIndex = (currentIndex + 1) % players.length;
    currentPlayerEl.textContent = players[currentIndex];
    currentPlayerEl.style.color = colors[currentIndex];
    timeLeft = 10;
    timerEl.textContent = timeLeft;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            nextPlayer();
        }
    }, 1000);
}

function draw(x, y) {
    if (lastPos) {
        ctx.strokeStyle = colors[currentIndex];
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    lastPos = { x, y };
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); });
canvas.addEventListener('mousemove', (e) => { if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('passBtn').addEventListener('click', nextPlayer);

startTimer();
