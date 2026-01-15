const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const angleInput = document.getElementById('angle');
const depthInput = document.getElementById('depth');
const angleVal = document.getElementById('angleVal');
const depthVal = document.getElementById('depthVal');

canvas.width = 370;
canvas.height = 250;

let branchAngle = 25;
let maxDepth = 8;

function drawBranch(x, y, length, angle, depth) {
    if (depth === 0) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    const hue = 30 + (maxDepth - depth) * 10;
    ctx.strokeStyle = `hsl(${hue}, 60%, ${30 + depth * 5}%)`;
    ctx.lineWidth = depth * 0.8;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const newLength = length * 0.72;
    const angleRad = branchAngle * Math.PI / 180;

    drawBranch(endX, endY, newLength, angle - angleRad, depth - 1);
    drawBranch(endX, endY, newLength, angle + angleRad, depth - 1);
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a237e');
    gradient.addColorStop(1, '#0d47a1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBranch(canvas.width / 2, canvas.height, 60, -Math.PI / 2, maxDepth);
}

angleInput.addEventListener('input', () => {
    branchAngle = parseInt(angleInput.value);
    angleVal.textContent = branchAngle + '°';
});

depthInput.addEventListener('input', () => {
    maxDepth = parseInt(depthInput.value);
    depthVal.textContent = maxDepth;
});

document.getElementById('drawBtn').addEventListener('click', draw);

draw();
