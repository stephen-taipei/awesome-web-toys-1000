const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let snowflakes = [];
let accumulated = [];
let wind = 0;
let intensity = 1;
let time = 0;

function init() {
    setupCanvas();
    initAccumulation();

    document.getElementById('windBtn').addEventListener('click', toggleWind);
    document.getElementById('intensityBtn').addEventListener('click', changeIntensity);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function initAccumulation() {
    accumulated = [];
    for (let x = 0; x < width; x++) {
        accumulated[x] = 0;
    }
}

function toggleWind() {
    wind = wind === 0 ? 1 : 0;
    document.getElementById('windBtn').classList.toggle('active', wind !== 0);
}

function changeIntensity() {
    intensity = intensity === 1 ? 2 : intensity === 2 ? 3 : 1;
}

function gameLoop() {
    time += 0.02;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (Math.random() < 0.1 * intensity) {
        createSnowflake();
    }

    const windForce = wind ? Math.sin(time) * 2 : 0;

    snowflakes.forEach((flake, index) => {
        flake.x += flake.drift + windForce;
        flake.y += flake.speed;
        flake.rotation += flake.rotSpeed;

        const groundLevel = height - 30 - accumulated[Math.floor(flake.x)] || height - 30;

        if (flake.y >= groundLevel) {
            const x = Math.floor(flake.x);
            if (x >= 0 && x < width) {
                accumulated[x] = Math.min(accumulated[x] + 0.5, 50);
                for (let i = -2; i <= 2; i++) {
                    if (x + i >= 0 && x + i < width) {
                        accumulated[x + i] = Math.min(accumulated[x + i] + 0.1, 50);
                    }
                }
            }
            snowflakes.splice(index, 1);
        }

        if (flake.x < -20 || flake.x > width + 20) {
            snowflakes.splice(index, 1);
        }
    });
}

function createSnowflake() {
    snowflakes.push({
        x: Math.random() * (width + 40) - 20,
        y: -10,
        size: 2 + Math.random() * 4,
        speed: 1 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        type: Math.floor(Math.random() * 3)
    });
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(0.5, '#2d4a5e');
    gradient.addColorStop(1, '#a0c0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#f0f8ff';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x < width; x++) {
        ctx.lineTo(x, height - 30 - accumulated[x]);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#e8f4ff';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x < width; x++) {
        ctx.lineTo(x, height - 25 - accumulated[x] * 0.8);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    snowflakes.forEach(flake => {
        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.rotation);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        if (flake.type === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, flake.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (flake.type === 1) {
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(flake.size, 0);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.rotate(Math.PI / 3);
            }
        } else {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * flake.size;
                const y = Math.sin(angle) * flake.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    initAccumulation();
});
