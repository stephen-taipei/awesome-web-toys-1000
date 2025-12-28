const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 200;
let isFlipping = false, rotation = 0, result = 'heads', flipFrame = 0;
let headsCount = 0, tailsCount = 0;

function init() {
    canvas.width = size; canvas.height = size;
    document.getElementById('flipBtn').addEventListener('click', flip);
    document.getElementById('resetBtn').addEventListener('click', resetStats);
    canvas.addEventListener('click', flip);
    draw();
}

function flip() {
    if (isFlipping) return;
    isFlipping = true;
    flipFrame = 0;
    result = Math.random() < 0.5 ? 'heads' : 'tails';
    animate();
}

function animate() {
    flipFrame++;
    rotation += 0.5 - flipFrame * 0.015;
    draw();
    if (flipFrame < 30) {
        requestAnimationFrame(animate);
    } else {
        rotation = 0;
        isFlipping = false;
        if (result === 'heads') {
            headsCount++;
            document.getElementById('result').textContent = '正面!';
        } else {
            tailsCount++;
            document.getElementById('result').textContent = '反面!';
        }
        document.getElementById('headsCount').textContent = '正面: ' + headsCount;
        document.getElementById('tailsCount').textContent = '反面: ' + tailsCount;
        draw();
    }
}

function resetStats() {
    headsCount = 0;
    tailsCount = 0;
    document.getElementById('headsCount').textContent = '正面: 0';
    document.getElementById('tailsCount').textContent = '反面: 0';
    document.getElementById('result').textContent = '點擊硬幣';
}

function draw() {
    const cx = size/2, cy = size/2, r = 70;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(cx, cy);

    const scale = Math.abs(Math.cos(rotation * Math.PI));
    ctx.scale(scale, 1);

    const showHeads = Math.cos(rotation * Math.PI) > 0;
    const side = isFlipping ? (showHeads ? 'heads' : 'tails') : result;

    const gradient = ctx.createRadialGradient(-20, -20, 0, 0, 0, r);
    gradient.addColorStop(0, '#fff7cc');
    gradient.addColorStop(0.5, '#ffd700');
    gradient.addColorStop(1, '#b8860b');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8b6914';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (side === 'heads') {
        ctx.fillText('正', 0, 0);
    } else {
        ctx.fillText('反', 0, 0);
    }

    ctx.restore();
}

document.addEventListener('DOMContentLoaded', init);
