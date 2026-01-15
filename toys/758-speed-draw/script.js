const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const wordEl = document.getElementById('word');
const countEl = document.getElementById('count');
const timerFill = document.getElementById('timerFill');
const startBtn = document.getElementById('startBtn');

canvas.width = 370;
canvas.height = 200;

const words = ['圓形', '方形', '三角形', '心形', '星星', '線條', '波浪', '螺旋', 'X', '箭頭', '房子', '太陽', '雲朵', '閃電'];

let gameActive = false;
let count = 0;
let timeLeft = 5;
let gameTimer = null;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function nextWord() {
    wordEl.textContent = words[Math.floor(Math.random() * words.length)];
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    timeLeft = 5;
    timerFill.style.width = '100%';
}

function startGame() {
    gameActive = true;
    count = 0;
    countEl.textContent = count;
    startBtn.textContent = '下一個';
    nextWord();

    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft -= 0.1;
        timerFill.style.width = (timeLeft / 5 * 100) + '%';

        if (timeLeft <= 0) {
            endGame();
        }
    }, 100);
}

function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    wordEl.textContent = '結束!';
    startBtn.textContent = '再玩一次';
}

function draw(x, y) {
    if (!gameActive) return;

    if (lastPos) {
        ctx.strokeStyle = '#333';
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

startBtn.addEventListener('click', () => {
    if (gameActive) {
        count++;
        countEl.textContent = count;
        nextWord();
    } else {
        startGame();
    }
});
