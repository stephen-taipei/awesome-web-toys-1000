const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let leaves = [];
let groundLeaves = [];
let windStrength = 0;
let time = 0;

const leafColors = ['#D2691E', '#FF6347', '#FFD700', '#FF4500', '#8B4513', '#CD853F'];

function init() {
    for (let i = 0; i < 30; i++) {
        groundLeaves.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 20 - Math.random() * 30,
            rotation: Math.random() * Math.PI * 2,
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
            size: 8 + Math.random() * 8
        });
    }
}

function blowWind() {
    windStrength = 5;

    for (let i = 0; i < 10; i++) {
        const gl = groundLeaves[Math.floor(Math.random() * groundLeaves.length)];
        if (gl) {
            leaves.push({
                x: gl.x,
                y: gl.y,
                vx: 2 + Math.random() * 3,
                vy: -2 - Math.random() * 3,
                rotation: gl.rotation,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                color: gl.color,
                size: gl.size
            });
        }
    }
}

function spawnLeaf() {
    if (Math.random() < 0.05) {
        leaves.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 2,
            vy: 1 + Math.random(),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
            size: 8 + Math.random() * 10
        });
    }
}

function updateLeaves() {
    windStrength *= 0.98;

    for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.vx += windStrength * 0.1 + Math.sin(time * 0.02 + l.y * 0.01) * 0.1;
        l.vy += 0.05;
        l.x += l.vx;
        l.y += l.vy;
        l.rotation += l.rotationSpeed;
        l.vx *= 0.99;

        if (l.y > canvas.height - 30) {
            groundLeaves.push({
                x: l.x,
                y: canvas.height - 20 - Math.random() * 10,
                rotation: l.rotation,
                color: l.color,
                size: l.size
            });
            leaves.splice(i, 1);
        } else if (l.x < -50 || l.x > canvas.width + 50) {
            leaves.splice(i, 1);
        }
    }

    if (groundLeaves.length > 100) {
        groundLeaves = groundLeaves.slice(-80);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFB347');
    gradient.addColorStop(0.5, '#FFCC99');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTree() {
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(280, canvas.height);
    ctx.lineTo(290, canvas.height - 150);
    ctx.lineTo(310, canvas.height - 150);
    ctx.lineTo(320, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(300, canvas.height - 180, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(260, canvas.height - 150, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(340, canvas.height - 150, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.arc(280, canvas.height - 200, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(320, canvas.height - 190, 35, 0, Math.PI * 2);
    ctx.fill();
}

function drawLeaf(l, onGround = false) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rotation);

    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.moveTo(0, -l.size);
    ctx.quadraticCurveTo(l.size * 0.8, -l.size * 0.3, l.size * 0.5, l.size * 0.5);
    ctx.quadraticCurveTo(0, l.size * 0.8, -l.size * 0.5, l.size * 0.5);
    ctx.quadraticCurveTo(-l.size * 0.8, -l.size * 0.3, 0, -l.size);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -l.size);
    ctx.lineTo(0, l.size * 0.5);
    ctx.stroke();

    ctx.restore();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`落葉: ${leaves.length}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawTree();

    groundLeaves.forEach(l => drawLeaf(l, true));

    spawnLeaf();
    updateLeaves();
    leaves.forEach(l => drawLeaf(l));

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('windBtn').addEventListener('click', blowWind);

init();
animate();
