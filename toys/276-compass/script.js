const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let size = 300, angle = 0, targetAngle = 0, isSpinning = false;
const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function init() {
    const wrapper = document.querySelector('.game-wrapper');
    size = Math.min(300, wrapper.clientWidth - 20);
    canvas.width = size; canvas.height = size;
    document.getElementById('rotateBtn').addEventListener('click', spin);
    gameLoop();
}

function spin() {
    if (!isSpinning) { targetAngle = angle + 360 + Math.random() * 720; isSpinning = true; }
}

function gameLoop() {
    if (isSpinning) {
        const diff = targetAngle - angle;
        angle += diff * 0.05;
        if (Math.abs(diff) < 0.5) { angle = targetAngle % 360; isSpinning = false; }
    }
    const deg = Math.round(angle % 360);
    const dirIdx = Math.round(deg / 45) % 8;
    document.getElementById('direction').textContent = directions[dirIdx] + ' ' + deg + '°';
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    const cx = size/2, cy = size/2, r = size * 0.4;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#1a252f'; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle * Math.PI / 180);
    ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-15, 0); ctx.lineTo(0, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(15, 0); ctx.lineTo(0, 15); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - r - 20);
    ctx.fillStyle = '#888';
    ctx.fillText('E', cx + r + 20, cy + 7); ctx.fillText('S', cx, cy + r + 25); ctx.fillText('W', cx - r - 20, cy + 7);
}

document.addEventListener('DOMContentLoaded', init);
