const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const branchesInput = document.getElementById('branches');
const branchVal = document.getElementById('branchVal');

canvas.width = 370;
canvas.height = 280;

let branches = 6;

function drawBranch(x, y, length, angle, depth) {
    if (depth === 0 || length < 5) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const newLength = length * 0.6;
    const branchAngle = Math.PI / 4;

    if (depth > 1) {
        drawBranch(endX, endY, newLength, angle - branchAngle, depth - 1);
        drawBranch(endX, endY, newLength, angle + branchAngle, depth - 1);
    }

    // Sub-branches along main
    if (depth > 2) {
        const midX = x + Math.cos(angle) * length * 0.5;
        const midY = y + Math.sin(angle) * length * 0.5;
        drawBranch(midX, midY, newLength * 0.7, angle - branchAngle, depth - 2);
        drawBranch(midX, midY, newLength * 0.7, angle + branchAngle, depth - 2);
    }
}

function generateSnowflake() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseLength = 60 + Math.random() * 30;
    const angleStep = (Math.PI * 2) / branches;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.shadowColor = '#00bcd4';
    ctx.shadowBlur = 10;

    for (let i = 0; i < branches; i++) {
        const angle = angleStep * i - Math.PI / 2;
        drawBranch(centerX, centerY, baseLength, angle, 4);
    }

    ctx.shadowBlur = 0;
}

branchesInput.addEventListener('input', () => {
    branches = parseInt(branchesInput.value);
    branchVal.textContent = branches;
});

document.getElementById('generateBtn').addEventListener('click', generateSnowflake);

generateSnowflake();
