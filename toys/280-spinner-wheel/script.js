const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 280;
let options = ['選項 1', '選項 2', '選項 3', '選項 4', '選項 5', '選項 6'];
const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4'];
let angle = 0, isSpinning = false, velocity = 0;

function init() {
    canvas.width = size; canvas.height = size;
    document.getElementById('spinBtn').addEventListener('click', spin);
    document.getElementById('addBtn').addEventListener('click', addOption);
    draw();
}

function addOption() {
    const name = prompt('輸入新選項名稱:');
    if (name && name.trim()) {
        options.push(name.trim());
        draw();
    }
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;
    velocity = 0.3 + Math.random() * 0.2;
    animate();
}

function animate() {
    angle += velocity;
    velocity *= 0.99;
    draw();

    if (velocity > 0.001) {
        requestAnimationFrame(animate);
    } else {
        isSpinning = false;
        const normalizedAngle = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const sliceAngle = (Math.PI * 2) / options.length;
        const pointerAngle = (Math.PI * 1.5 - normalizedAngle + Math.PI * 2) % (Math.PI * 2);
        const selectedIndex = Math.floor(pointerAngle / sliceAngle) % options.length;
        document.getElementById('result').textContent = options[selectedIndex] + '!';
    }
}

function draw() {
    const cx = size/2, cy = size/2, r = size * 0.45;
    ctx.clearRect(0, 0, size, size);

    const sliceAngle = (Math.PI * 2) / options.length;

    options.forEach((opt, i) => {
        const startAngle = angle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.fillStyle = colors[i % colors.length];
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
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const text = opt.length > 8 ? opt.substring(0, 8) + '...' : opt;
        ctx.fillText(text, r - 10, 0);
        ctx.restore();
    });

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', init);
