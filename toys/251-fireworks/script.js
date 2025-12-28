const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 500;
let rockets = [];
let particles = [];
let autoMode = false;
let burstMode = false;

function init() {
    setupCanvas();
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
    document.getElementById('autoBtn').addEventListener('click', toggleAuto);
    document.getElementById('burstBtn').addEventListener('click', toggleBurst);
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.4;
    canvas.width = width;
    canvas.height = height;
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    launchRocket(x, y);
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    launchRocket(x, y);
}

function launchRocket(targetX, targetY) {
    const startX = width * 0.2 + Math.random() * width * 0.6;
    rockets.push({
        x: startX,
        y: height,
        targetX: targetX,
        targetY: targetY,
        speed: 8 + Math.random() * 4,
        hue: Math.random() * 360,
        trail: []
    });
}

function toggleAuto() {
    autoMode = !autoMode;
    document.getElementById('autoBtn').classList.toggle('active', autoMode);
}

function toggleBurst() {
    burstMode = !burstMode;
    document.getElementById('burstBtn').classList.toggle('active', burstMode);
}

function explode(x, y, hue) {
    const count = burstMode ? 100 : 60;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
        const speed = 2 + Math.random() * 4;
        const particleHue = burstMode ? Math.random() * 360 : hue + Math.random() * 30 - 15;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 60 + Math.random() * 40,
            maxLife: 100,
            hue: particleHue,
            size: 2 + Math.random() * 2
        });
    }

    if (burstMode) {
        for (let ring = 0; ring < 2; ring++) {
            const ringCount = 30;
            const ringSpeed = 5 + ring * 2;
            for (let i = 0; i < ringCount; i++) {
                const angle = (Math.PI * 2 / ringCount) * i;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * ringSpeed,
                    vy: Math.sin(angle) * ringSpeed,
                    life: 40,
                    maxLife: 40,
                    hue: (hue + 180) % 360,
                    size: 3
                });
            }
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (autoMode && Math.random() < 0.03) {
        const x = width * 0.2 + Math.random() * width * 0.6;
        const y = height * 0.2 + Math.random() * height * 0.4;
        launchRocket(x, y);
    }

    rockets.forEach((rocket, index) => {
        const dx = rocket.targetX - rocket.x;
        const dy = rocket.targetY - rocket.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < rocket.speed) {
            explode(rocket.x, rocket.y, rocket.hue);
            rockets.splice(index, 1);
        } else {
            rocket.x += (dx / dist) * rocket.speed;
            rocket.y += (dy / dist) * rocket.speed;

            rocket.trail.push({ x: rocket.x, y: rocket.y });
            if (rocket.trail.length > 10) rocket.trail.shift();
        }
    });

    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;

        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 25, 0.2)';
    ctx.fillRect(0, 0, width, height);

    rockets.forEach(rocket => {
        rocket.trail.forEach((point, i) => {
            const alpha = i / rocket.trail.length;
            ctx.fillStyle = 'hsla(' + rocket.hue + ', 100%, 70%, ' + alpha + ')';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = 'hsl(' + rocket.hue + ', 100%, 80%)';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 60%, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 90%, ' + (alpha * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
