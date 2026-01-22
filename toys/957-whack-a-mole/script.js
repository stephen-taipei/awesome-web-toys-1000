const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const holes = [];
const cols = 3;
const rows = 3;
const holeSize = 50;

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let activeMole = -1;
let moleTimer = null;
let gameTimer = null;

function init() {
    holes.length = 0;
    const startX = (canvas.width - cols * (holeSize + 30)) / 2 + 15;
    const startY = (canvas.height - rows * (holeSize + 20)) / 2 + 10;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            holes.push({
                x: startX + col * (holeSize + 30),
                y: startY + row * (holeSize + 20),
                active: false,
                hit: false
            });
        }
    }
}

function showMole() {
    if (!gameRunning) return;

    holes.forEach(h => { h.active = false; h.hit = false; });

    activeMole = Math.floor(Math.random() * holes.length);
    holes[activeMole].active = true;

    const delay = Math.max(500, 1500 - score * 20);
    moleTimer = setTimeout(() => {
        if (holes[activeMole]) holes[activeMole].active = false;
        showMole();
    }, delay);
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#81C784');
    gradient.addColorStop(1, '#4CAF50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    holes.forEach((hole, i) => {
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.ellipse(
            hole.x + holeSize / 2,
            hole.y + holeSize,
            holeSize / 2 + 5,
            15,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = '#1B0000';
        ctx.beginPath();
        ctx.ellipse(
            hole.x + holeSize / 2,
            hole.y + holeSize - 5,
            holeSize / 2,
            12,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        if (hole.active && !hole.hit) {
            ctx.fillStyle = '#8D6E63';
            ctx.beginPath();
            ctx.arc(hole.x + holeSize / 2, hole.y + holeSize / 2, holeSize / 2 - 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#5D4037';
            ctx.beginPath();
            ctx.arc(hole.x + holeSize / 2 - 8, hole.y + holeSize / 2 - 5, 5, 0, Math.PI * 2);
            ctx.arc(hole.x + holeSize / 2 + 8, hole.y + holeSize / 2 - 5, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#3E2723';
            ctx.beginPath();
            ctx.ellipse(hole.x + holeSize / 2, hole.y + holeSize / 2 + 8, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (hole.hit) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+10', hole.x + holeSize / 2, hole.y);
        }
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分數: ${score}  時間: ${timeLeft}`, 20, 30);

    if (!gameRunning && timeLeft === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '16px Arial';
        ctx.fillText(`最終分數: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

function startGame() {
    if (gameRunning) return;

    score = 0;
    timeLeft = 30;
    gameRunning = true;

    showMole();

    gameTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            gameRunning = false;
            clearTimeout(moleTimer);
            clearInterval(gameTimer);
            holes.forEach(h => h.active = false);
        }
    }, 1000);
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    holes.forEach((hole, i) => {
        if (hole.active && !hole.hit) {
            const dx = mx - (hole.x + holeSize / 2);
            const dy = my - (hole.y + holeSize / 2);
            if (dx * dx + dy * dy < (holeSize / 2) * (holeSize / 2)) {
                hole.hit = true;
                hole.active = false;
                score += 10;

                setTimeout(() => { hole.hit = false; }, 300);
            }
        }
    });
});

document.getElementById('startBtn').addEventListener('click', startGame);

function animate() {
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
