const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let effect = 0;
let time = 0;

const effects = ['wave', 'ripple', 'spiral', 'noise'];
const gridSize = 15;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

function changeEffect() {
    effect = (effect + 1) % effects.length;
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWave() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2;

            const wave = Math.sin(col * 0.3 + time * 0.05) + Math.sin(row * 0.3 + time * 0.03);
            const size = 2 + (wave + 2) * 2;
            const hue = (col * 10 + row * 10 + time * 2) % 360;

            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawRipple() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2;

            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            const wave = Math.sin(dist * 0.05 - time * 0.1);
            const size = 2 + (wave + 1) * 3;
            const hue = (dist + time * 3) % 360;

            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawSpiral() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2;

            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            const spiral = Math.sin(angle * 3 + dist * 0.05 - time * 0.05);
            const size = 2 + (spiral + 1) * 3;
            const hue = (angle * 30 + dist + time * 2) % 360;

            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawNoise() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2;

            const noise = Math.sin(col * 0.5 + time * 0.02) * Math.cos(row * 0.5 + time * 0.03);
            const size = 2 + (noise + 1) * 3 + Math.random() * 2;
            const hue = (noise * 180 + 180 + time * 2) % 360;

            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`效果: ${effects[effect]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();

    switch (effects[effect]) {
        case 'wave': drawWave(); break;
        case 'ripple': drawRipple(); break;
        case 'spiral': drawSpiral(); break;
        case 'noise': drawNoise(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('effectBtn').addEventListener('click', changeEffect);

animate();
