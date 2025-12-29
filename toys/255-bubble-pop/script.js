const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let bubbles = [];
let particles = [];
let score = 0;
let combo = 0;
let lastPopTime = 0;

function init() {
    setupCanvas();
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    checkPop(x, y);
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    checkPop(x, y);
}

function checkPop(x, y) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = x - b.x;
        const dy = y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < b.radius) {
            popBubble(b, i);
            break;
        }
    }
}

function popBubble(bubble, index) {
    const now = Date.now();
    if (now - lastPopTime < 500) {
        combo++;
    } else {
        combo = 1;
    }
    lastPopTime = now;

    score += 10 * combo;
    updateStats();

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        particles.push({
            x: bubble.x,
            y: bubble.y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            radius: 3 + Math.random() * 3,
            color: bubble.color,
            life: 30
        });
    }

    bubbles.splice(index, 1);
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('combo').textContent = combo;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (Math.random() < 0.05 && bubbles.length < 20) {
        createBubble();
    }

    bubbles.forEach(b => {
        b.y -= b.speed;
        b.x += Math.sin(b.wobble) * 0.5;
        b.wobble += 0.05;
        b.shimmer = (b.shimmer + 0.1) % (Math.PI * 2);
    });

    bubbles = bubbles.filter(b => b.y + b.radius > 0);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;
        p.radius *= 0.95;
    });

    particles = particles.filter(p => p.life > 0);

    if (Date.now() - lastPopTime > 2000) {
        combo = 0;
        updateStats();
    }
}

function createBubble() {
    const radius = 20 + Math.random() * 30;
    const hue = Math.random() * 360;
    bubbles.push({
        x: radius + Math.random() * (width - radius * 2),
        y: height + radius,
        radius: radius,
        speed: 1 + Math.random() * 2,
        wobble: Math.random() * Math.PI * 2,
        shimmer: 0,
        color: 'hsl(' + hue + ', 70%, 70%)',
        hue: hue
    });
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e0f7fa');
    gradient.addColorStop(1, '#b2ebf2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    bubbles.forEach(b => {
        const gradient = ctx.createRadialGradient(
            b.x - b.radius * 0.3, b.y - b.radius * 0.3, 0,
            b.x, b.y, b.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, b.color);
        gradient.addColorStop(1, 'hsla(' + b.hue + ', 70%, 50%, 0.6)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(
            b.x - b.radius * 0.3,
            b.y - b.radius * 0.3,
            b.radius * 0.2,
            b.radius * 0.15,
            -Math.PI / 4, 0, Math.PI * 2
        );
        ctx.fill();

        const shimmerAlpha = 0.3 + Math.sin(b.shimmer) * 0.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + shimmerAlpha + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius - 3, 0, Math.PI * 2);
        ctx.stroke();
    });

    particles.forEach(p => {
        const alpha = p.life / 30;
        ctx.fillStyle = p.color.replace(')', ', ' + alpha + ')').replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
