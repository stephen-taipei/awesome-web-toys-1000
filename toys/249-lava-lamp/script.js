const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 200, height = 450;
let blobs = [];
let time = 0;

let colorSchemes = [
    { blob: '#ff6b6b', bg1: '#2d1b4e', bg2: '#1a0a2e' },
    { blob: '#ffa500', bg1: '#1a2e1b', bg2: '#0a2e1a' },
    { blob: '#4ecdc4', bg1: '#2e1a2d', bg2: '#1a0a1e' },
    { blob: '#ff69b4', bg1: '#1a1a3e', bg2: '#0a0a2e' },
    { blob: '#9b59b6', bg1: '#2e2a1a', bg2: '#1e1a0a' }
];
let currentScheme = 0;

function init() {
    canvas.width = width;
    canvas.height = height;
    createBlobs();
    document.getElementById('color1Btn').addEventListener('click', () => changeScheme(1));
    document.getElementById('color2Btn').addEventListener('click', () => changeScheme(-1));
    gameLoop();
}

function createBlobs() {
    blobs = [];
    for (let i = 0; i < 8; i++) {
        blobs.push({
            x: width * 0.3 + Math.random() * width * 0.4,
            y: height * 0.3 + Math.random() * height * 0.4,
            radius: 25 + Math.random() * 30,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5 - Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function changeScheme(dir) {
    currentScheme = (currentScheme + dir + colorSchemes.length) % colorSchemes.length;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    time += 0.016;

    blobs.forEach(blob => {
        blob.x += blob.vx + Math.sin(time * 0.5 + blob.phase) * 0.3;
        blob.y += blob.vy;

        const heatZone = height * 0.85;
        const coolZone = height * 0.15;

        if (blob.y > heatZone) {
            blob.vy = -0.5 - Math.random() * 0.5;
            blob.radius = Math.min(60, blob.radius + 5);
        }

        if (blob.y < coolZone) {
            blob.vy = 0.3 + Math.random() * 0.3;
            blob.radius = Math.max(20, blob.radius - 3);
        }

        const margin = 30;
        if (blob.x < margin) {
            blob.x = margin;
            blob.vx = Math.abs(blob.vx);
        }
        if (blob.x > width - margin) {
            blob.x = width - margin;
            blob.vx = -Math.abs(blob.vx);
        }

        blob.radius += Math.sin(time * 2 + blob.phase) * 0.3;
    });
}

function draw() {
    const scheme = colorSchemes[currentScheme];

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, scheme.bg1);
    bgGradient.addColorStop(1, scheme.bg2);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const lampGradient = ctx.createLinearGradient(0, height - 50, 0, height);
    lampGradient.addColorStop(0, 'rgba(255,100,50,0.2)');
    lampGradient.addColorStop(1, 'rgba(255,50,0,0.4)');
    ctx.fillStyle = lampGradient;
    ctx.fillRect(0, height - 50, width, 50);

    ctx.filter = 'blur(15px)';
    blobs.forEach(blob => {
        drawBlob(blob, scheme.blob, 1.2);
    });
    ctx.filter = 'none';

    blobs.forEach(blob => {
        drawBlob(blob, scheme.blob, 1);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(width * 0.1, 0, width * 0.15, height);
}

function drawBlob(blob, color, scale) {
    const gradient = ctx.createRadialGradient(
        blob.x - blob.radius * 0.2 * scale,
        blob.y - blob.radius * 0.2 * scale,
        0,
        blob.x, blob.y,
        blob.radius * scale
    );

    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);

    gradient.addColorStop(0, 'rgba(' + (r+50) + ',' + (g+50) + ',' + (b+50) + ',0.9)');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(' + (r-30) + ',' + (g-30) + ',' + (b-30) + ',0.8)');

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const wobble1 = Math.sin(time * 2 + blob.phase) * 5;
    const wobble2 = Math.cos(time * 1.5 + blob.phase) * 3;

    ctx.ellipse(
        blob.x + wobble2,
        blob.y,
        blob.radius * scale + wobble1,
        blob.radius * scale * 1.2 - wobble1 * 0.5,
        0, 0, Math.PI * 2
    );
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
