const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 280;
const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f'];
const positions = [
    { x: 0, y: 0 }, { x: 1, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }
];
let sequence = [], playerSequence = [], level = 1, score = 0;
let isPlaying = false, isShowingSequence = false, activeColor = -1;

function init() {
    canvas.width = size; canvas.height = size;
    canvas.addEventListener('click', handleClick);
    document.getElementById('startBtn').addEventListener('click', startGame);
    draw();
}

function startGame() {
    sequence = [];
    playerSequence = [];
    level = 1;
    score = 0;
    isPlaying = true;
    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = score;
    nextRound();
}

function nextRound() {
    playerSequence = [];
    sequence.push(Math.floor(Math.random() * 4));
    document.getElementById('status').textContent = '觀察順序...';
    isShowingSequence = true;
    showSequence();
}

function showSequence() {
    let i = 0;
    const interval = setInterval(() => {
        activeColor = sequence[i];
        draw();
        setTimeout(() => { activeColor = -1; draw(); }, 400);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            setTimeout(() => {
                isShowingSequence = false;
                document.getElementById('status').textContent = '輪到你了!';
            }, 500);
        }
    }, 800);
}

function handleClick(e) {
    if (!isPlaying || isShowingSequence) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = size / 2;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const colorIndex = row * 2 + col;

    activeColor = colorIndex;
    draw();
    setTimeout(() => { activeColor = -1; draw(); }, 200);

    playerSequence.push(colorIndex);

    const currentIndex = playerSequence.length - 1;
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        document.getElementById('status').textContent = '遊戲結束! 分數: ' + score;
        isPlaying = false;
        return;
    }

    if (playerSequence.length === sequence.length) {
        score += level * 10;
        level++;
        document.getElementById('level').textContent = level;
        document.getElementById('score').textContent = score;
        document.getElementById('status').textContent = '正確! 下一關...';
        setTimeout(nextRound, 1000);
    }
}

function draw() {
    ctx.clearRect(0, 0, size, size);
    const cellSize = size / 2 - 10;
    const gap = 10;

    positions.forEach((pos, i) => {
        const x = pos.x * (cellSize + gap) + gap/2;
        const y = pos.y * (cellSize + gap) + gap/2;

        ctx.fillStyle = i === activeColor ? '#fff' : colors[i];
        ctx.globalAlpha = i === activeColor ? 1 : 0.7;
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, 15);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

document.addEventListener('DOMContentLoaded', init);
