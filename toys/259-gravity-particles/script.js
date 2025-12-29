const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let particles = [];
let mouseX = 0, mouseY = 0;
let isAttracting = true;

const numParticles = 500;

function init() {
    setupCanvas();
    createParticles();

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });

    document.getElementById('modeBtn').addEventListener('click', toggleMode);
    document.getElementById('resetBtn').addEventListener('click', resetParticles);

    mouseX = width / 2;
    mouseY = height / 2;

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function createParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            radius: 1 + Math.random() * 2,
            hue: Math.random() * 60 + 10
        });
    }
}

function resetParticles() {
    particles.forEach(p => {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.vx = 0;
        p.vy = 0;
    });
}

function toggleMode() {
    isAttracting = !isAttracting;
    document.getElementById('modeBtn').textContent = isAttracting ? '吸引' : '排斥';
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    particles.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            const force = isAttracting ? 50 / dist : -50 / dist;
            p.vx += (dx / dist) * force * 0.01;
            p.vy += (dy / dist) * force * 0.01;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > width) { p.x = width; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > height) { p.y = height; p.vy *= -0.5; }
    });
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const hue = p.hue + speed * 10;
        const alpha = 0.5 + Math.min(speed * 0.2, 0.5);

        ctx.fillStyle = 'hsla(' + hue + ', 100%, 60%, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (speed > 2) {
            ctx.strokeStyle = 'hsla(' + hue + ', 100%, 60%, ' + (alpha * 0.3) + ')';
            ctx.lineWidth = p.radius * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
            ctx.stroke();
        }
    });

    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 50);
    gradient.addColorStop(0, isAttracting ? 'rgba(255, 200, 100, 0.3)' : 'rgba(100, 150, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 50, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    createParticles();
});
