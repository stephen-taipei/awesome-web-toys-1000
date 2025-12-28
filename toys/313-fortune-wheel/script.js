const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 280;
canvas.width = size; canvas.height = size;

const prizes = ['$1000', '$500', '$100', '$50', '再轉一次', '$10', '謝謝參與', '$200'];
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4'];
let angle = 0, isSpinning = false;

function init() {
    document.getElementById('spinBtn').addEventListener('click', spin);
    draw();
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('result').textContent = '';

    const spinAngle = 360 * 5 + Math.random() * 360;
    const duration = 5000;
    const startTime = Date.now();
    const startAngle = angle;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);
        angle = startAngle + spinAngle * easing;

        draw();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            document.getElementById('spinBtn').disabled = false;
            showResult();
        }
    }

    animate();
}

function showResult() {
    const normalizedAngle = (360 - (angle % 360) + 90) % 360;
    const sliceAngle = 360 / prizes.length;
    const prizeIndex = Math.floor(normalizedAngle / sliceAngle);
    document.getElementById('result').textContent = '🎉 ' + prizes[prizeIndex] + '!';
}

function draw() {
    const cx = size/2, cy = size/2, r = size * 0.45;
    ctx.clearRect(0, 0, size, size);

    const sliceAngle = (Math.PI * 2) / prizes.length;

    prizes.forEach((prize, i) => {
        const startAngle = (angle * Math.PI / 180) + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(prize, r - 15, 0);
        ctx.restore();
    });

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3;
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', init);
