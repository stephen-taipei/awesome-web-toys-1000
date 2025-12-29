const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let particles = [];
let mouseX = 0, mouseY = 0;
let effect = 0;
let hueOffset = 0;

const effects = ['trail', 'burst', 'swirl', 'sparkle'];

function init() {
    setupCanvas();

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });

    document.getElementById('effectBtn').addEventListener('click', changeEffect);
    document.getElementById('colorBtn').addEventListener('click', changeColor);

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

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    createParticles();
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    createParticles();
}

function changeEffect() {
    effect = (effect + 1) % effects.length;
}

function changeColor() {
    hueOffset = (hueOffset + 60) % 360;
}

function createParticles() {
    const count = effects[effect] === 'burst' ? 8 : 3;

    for (let i = 0; i < count; i++) {
        const particle = {
            x: mouseX,
            y: mouseY,
            vx: 0,
            vy: 0,
            radius: 3 + Math.random() * 5,
            life: 60,
            maxLife: 60,
            hue: (hueOffset + Math.random() * 60) % 360
        };

        switch (effects[effect]) {
            case 'trail':
                particle.vx = (Math.random() - 0.5) * 2;
                particle.vy = (Math.random() - 0.5) * 2;
                break;
            case 'burst':
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
                const speed = 3 + Math.random() * 2;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                break;
            case 'swirl':
                particle.angle = Math.random() * Math.PI * 2;
                particle.radius = 2 + Math.random() * 3;
                particle.orbitRadius = 0;
                particle.orbitSpeed = 0.1 + Math.random() * 0.1;
                break;
            case 'sparkle':
                particle.vx = (Math.random() - 0.5) * 4;
                particle.vy = -Math.random() * 4 - 2;
                particle.gravity = 0.1;
                break;
        }

        particles.push(particle);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    particles.forEach((p, index) => {
        p.life--;

        switch (effects[effect]) {
            case 'trail':
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.vy *= 0.98;
                break;
            case 'burst':
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.95;
                p.vy *= 0.95;
                break;
            case 'swirl':
                p.angle += p.orbitSpeed;
                p.orbitRadius += 0.5;
                p.x = mouseX + Math.cos(p.angle) * p.orbitRadius;
                p.y = mouseY + Math.sin(p.angle) * p.orbitRadius;
                break;
            case 'sparkle':
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                break;
        }

        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });

    if (particles.length > 500) {
        particles = particles.slice(-500);
    }
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 21, 0.1)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        const size = p.radius * alpha;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, 'hsla(' + p.hue + ', 100%, 70%, ' + alpha + ')');
        gradient.addColorStop(0.5, 'hsla(' + p.hue + ', 100%, 50%, ' + (alpha * 0.5) + ')');
        gradient.addColorStop(1, 'hsla(' + p.hue + ', 100%, 50%, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 80%, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
