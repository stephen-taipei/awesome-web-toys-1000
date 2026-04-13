const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let flowField = [];
let time = 0;
let hueOffset = 0;

const resolution = 20;
const cols = Math.ceil(canvas.width / resolution);
const rows = Math.ceil(canvas.height / resolution);

function init() {
    particles = [];
    hueOffset = Math.random() * 360;

    for (let i = 0; i < 500; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 1 + Math.random() * 2,
            hue: hueOffset + Math.random() * 60
        });
    }

    updateFlowField();

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateFlowField() {
    flowField = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const angle = Math.sin(x * 0.1 + time * 0.01) * Math.cos(y * 0.1 + time * 0.01) * Math.PI * 2;
            flowField.push(angle);
        }
    }
}

function updateParticles() {
    particles.forEach(p => {
        const col = Math.floor(p.x / resolution);
        const row = Math.floor(p.y / resolution);
        const index = col + row * cols;

        if (index >= 0 && index < flowField.length) {
            const angle = flowField[index];
            p.x += Math.cos(angle) * p.speed;
            p.y += Math.sin(angle) * p.speed;
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawParticles() {
    particles.forEach(p => {
        const hue = (p.hue + time * 0.5) % 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.3)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('抽象流動', 20, 28);
}

function animate() {
    time++;

    if (time % 5 === 0) {
        updateFlowField();
    }

    drawBackground();
    updateParticles();
    drawParticles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
