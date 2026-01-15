const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let mode = 'flow';

function noise(x, y) {
    return Math.sin(x * 0.01) * Math.cos(y * 0.01) + Math.sin(x * 0.02 + y * 0.02);
}

function generateFlowField() {
    ctx.fillStyle = 'rgba(10, 10, 10, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseHue = Math.random() * 360;
    const particles = [];

    for (let i = 0; i < 500; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            hue: (baseHue + Math.random() * 60) % 360
        });
    }

    for (let step = 0; step < 100; step++) {
        for (const p of particles) {
            const angle = noise(p.x + step * 0.5, p.y + step * 0.5) * Math.PI * 2;
            const prevX = p.x;
            const prevY = p.y;

            p.x += Math.cos(angle) * 2;
            p.y += Math.sin(angle) * 2;

            ctx.strokeStyle = `hsla(${p.hue}, 70%, 60%, 0.1)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
                p.x = Math.random() * canvas.width;
                p.y = Math.random() * canvas.height;
            }
        }
    }
}

function generateCircles() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseHue = Math.random() * 360;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 50; i++) {
        const radius = 20 + i * 4;
        const hue = (baseHue + i * 5) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        const segments = 60;
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const wobble = Math.sin(angle * 6 + i * 0.5) * (5 + i * 0.5);
            const r = radius + wobble;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function generateRecursive() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseHue = Math.random() * 360;

    function drawBranch(x, y, angle, length, depth) {
        if (depth === 0 || length < 2) return;

        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        const hue = (baseHue + depth * 20) % 360;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.3 + depth * 0.1})`;
        ctx.lineWidth = depth * 0.5;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const spread = 0.4 + Math.random() * 0.3;
        const shrink = 0.65 + Math.random() * 0.15;

        drawBranch(endX, endY, angle - spread, length * shrink, depth - 1);
        drawBranch(endX, endY, angle + spread, length * shrink, depth - 1);

        if (Math.random() > 0.7) {
            drawBranch(endX, endY, angle, length * shrink, depth - 1);
        }
    }

    drawBranch(canvas.width / 2, canvas.height - 20, -Math.PI / 2, 60, 8);
}

function generate() {
    if (mode === 'flow') generateFlowField();
    else if (mode === 'circle') generateCircles();
    else generateRecursive();
}

document.querySelectorAll('.controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.id;
        generate();
    });
});

document.getElementById('generateBtn').addEventListener('click', generate);

generate();
