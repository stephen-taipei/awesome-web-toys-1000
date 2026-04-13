const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let leaves = [];
let treeLeaves = [];
const colors = ['#FF6347', '#FF4500', '#FFD700', '#FFA500', '#DC143C', '#B22222', '#CD853F'];

function initTreeLeaves() {
    treeLeaves = [];
    for (let i = 0; i < 50; i++) {
        treeLeaves.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 120,
            y: 40 + Math.random() * 80,
            size: 5 + Math.random() * 8,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#DEB887');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(canvas.width / 2 - 15, 100, 30, canvas.height - 130);

    ctx.strokeStyle = '#5D3A1A';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 100);
    ctx.quadraticCurveTo(canvas.width / 2 - 60, 60, canvas.width / 2 - 80, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 100);
    ctx.quadraticCurveTo(canvas.width / 2 + 60, 60, canvas.width / 2 + 80, 50);
    ctx.stroke();

    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
}

function drawTreeLeaves() {
    treeLeaves.forEach(leaf => {
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(leaf.x, leaf.y, leaf.size, leaf.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function shakeTree() {
    const fallingCount = Math.min(10, treeLeaves.length);
    for (let i = 0; i < fallingCount; i++) {
        if (treeLeaves.length === 0) break;
        const idx = Math.floor(Math.random() * treeLeaves.length);
        const leaf = treeLeaves.splice(idx, 1)[0];
        leaves.push({
            x: leaf.x,
            y: leaf.y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 0.5,
            size: leaf.size,
            color: leaf.color,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            swayPhase: Math.random() * Math.PI * 2
        });
    }
}

function updateLeaves() {
    leaves.forEach(leaf => {
        leaf.swayPhase += 0.05;
        leaf.vx = Math.sin(leaf.swayPhase) * 1.5;
        leaf.vy += 0.03;
        leaf.vy = Math.min(leaf.vy, 2);

        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotSpeed;
    });

    leaves = leaves.filter(l => l.y < canvas.height - 25);
}

function drawFallingLeaves() {
    leaves.forEach(leaf => {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);

        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-leaf.size * 0.8, 0);
        ctx.lineTo(leaf.size * 0.8, 0);
        ctx.stroke();

        ctx.restore();
    });
}

function drawGroundLeaves() {
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 20; i++) {
        const x = (i * 37 + 10) % canvas.width;
        const y = canvas.height - 25 + Math.random() * 15;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function animate() {
    drawBackground();
    drawGroundLeaves();
    drawTreeLeaves();
    updateLeaves();
    drawFallingLeaves();
    requestAnimationFrame(animate);
}

document.getElementById('shakeBtn').addEventListener('click', shakeTree);
canvas.addEventListener('click', shakeTree);

initTreeLeaves();
animate();
