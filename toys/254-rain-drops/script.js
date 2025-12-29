const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let drops = [];
let splashes = [];
let intensity = 1;
let lightning = 0;

const intensities = [
    { rate: 0.3, name: 'light' },
    { rate: 0.6, name: 'normal' },
    { rate: 1, name: 'heavy' },
    { rate: 1.5, name: 'storm' }
];
let intensityIndex = 2;

function init() {
    setupCanvas();
    document.getElementById('lightBtn').addEventListener('click', triggerLightning);
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

function changeIntensity() {
    intensityIndex = (intensityIndex + 1) % intensities.length;
    intensity = intensities[intensityIndex].rate;
}

function triggerLightning() {
    lightning = 1;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (Math.random() < 0.1 * intensity) {
        createDrop();
    }

    drops.forEach((drop, index) => {
        drop.y += drop.speed;
        drop.x += drop.wind;

        if (drop.y > height) {
            createSplash(drop.x, height);
            drops.splice(index, 1);
        }
    });

    splashes.forEach((splash, index) => {
        splash.life--;
        splash.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
        });
        if (splash.life <= 0) {
            splashes.splice(index, 1);
        }
    });

    if (lightning > 0) {
        lightning -= 0.05;
    }
}

function createDrop() {
    drops.push({
        x: Math.random() * width,
        y: -20,
        length: 15 + Math.random() * 25,
        speed: 8 + Math.random() * 8,
        wind: (Math.random() - 0.5) * 2,
        opacity: 0.3 + Math.random() * 0.4
    });
}

function createSplash(x, y) {
    const particles = [];
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1
        });
    }
    splashes.push({
        particles: particles,
        life: 15
    });
}

function draw() {
    const bgBrightness = 30 + lightning * 200;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgb(' + bgBrightness + ',' + (bgBrightness + 10) + ',' + (bgBrightness + 20) + ')');
    gradient.addColorStop(1, 'rgb(' + (bgBrightness - 15) + ',' + (bgBrightness - 10) + ',' + bgBrightness + ')');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (lightning > 0.8) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let lx = width * 0.3 + Math.random() * width * 0.4;
        let ly = 0;
        ctx.moveTo(lx, ly);
        while (ly < height * 0.7) {
            lx += (Math.random() - 0.5) * 40;
            ly += 20 + Math.random() * 30;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();
    }

    drops.forEach(drop => {
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        gradient.addColorStop(0, 'rgba(174, 194, 224, 0)');
        gradient.addColorStop(1, 'rgba(174, 194, 224, ' + drop.opacity + ')');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.wind * 2, drop.y + drop.length);
        ctx.stroke();
    });

    splashes.forEach(splash => {
        const alpha = splash.life / 15;
        ctx.fillStyle = 'rgba(174, 194, 224, ' + alpha + ')';
        splash.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 20 + Math.random() * 40;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
