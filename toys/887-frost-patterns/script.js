const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let frostCrystals = [];
let frostLevel = 0;

function freeze() {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        frostCrystals.push({
            x: 30 + Math.random() * (canvas.width - 60),
            y: 30 + Math.random() * (canvas.height - 60),
            size: 0,
            targetSize: 20 + Math.random() * 40,
            branches: 6 + Math.floor(Math.random() * 3),
            rotation: Math.random() * Math.PI * 2,
            complexity: 2 + Math.floor(Math.random() * 3)
        });
    }
    frostLevel = Math.min(1, frostLevel + 0.2);
}

function updateCrystals() {
    frostCrystals.forEach(c => {
        if (c.size < c.targetSize) {
            c.size += 0.5;
        }
    });

    if (frostCrystals.length > 30) {
        frostCrystals = frostCrystals.slice(-25);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4682B4');
    gradient.addColorStop(1, '#2F4F4F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (frostLevel > 0) {
        ctx.fillStyle = `rgba(200, 230, 255, ${frostLevel * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawWindowFrame() {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 15;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(canvas.width / 2, canvas.height - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, canvas.height / 2);
    ctx.lineTo(canvas.width - 10, canvas.height / 2);
    ctx.stroke();
}

function drawCrystalBranch(x, y, length, angle, depth, maxDepth) {
    if (depth > maxDepth || length < 3) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const branchLength = length * 0.6;
    const branchAngle = Math.PI / 4;

    drawCrystalBranch(endX, endY, branchLength, angle + branchAngle, depth + 1, maxDepth);
    drawCrystalBranch(endX, endY, branchLength, angle - branchAngle, depth + 1, maxDepth);

    if (depth < maxDepth - 1) {
        const midX = x + Math.cos(angle) * length * 0.5;
        const midY = y + Math.sin(angle) * length * 0.5;
        drawCrystalBranch(midX, midY, branchLength * 0.7, angle + branchAngle, depth + 1, maxDepth);
        drawCrystalBranch(midX, midY, branchLength * 0.7, angle - branchAngle, depth + 1, maxDepth);
    }
}

function drawCrystal(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;

    for (let i = 0; i < c.branches; i++) {
        const angle = (i / c.branches) * Math.PI * 2;
        drawCrystalBranch(0, 0, c.size, angle, 0, c.complexity);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawFrostEdge() {
    if (frostLevel > 0) {
        ctx.fillStyle = `rgba(220, 240, 255, ${frostLevel * 0.5})`;

        for (let i = 0; i < 50; i++) {
            const x = (i * 17) % canvas.width;
            const y = 15 + Math.random() * 20 * frostLevel;
            ctx.beginPath();
            ctx.arc(x, y, 5 + Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 50; i++) {
            const x = (i * 17) % canvas.width;
            const y = canvas.height - 15 - Math.random() * 20 * frostLevel;
            ctx.beginPath();
            ctx.arc(x, y, 5 + Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`霜花: ${frostCrystals.length}`, 30, 38);
}

function animate() {
    drawBackground();
    drawFrostEdge();
    updateCrystals();
    frostCrystals.forEach(c => drawCrystal(c));
    drawWindowFrame();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('freezeBtn').addEventListener('click', freeze);

animate();
