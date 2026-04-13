const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let fractalType = 0;
const fractals = ['謝爾賓斯基', '科赫雪花', '分形樹', '龍曲線'];

function drawSierpinski(x, y, size, depth) {
    if (depth === 0 || size < 2) {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.866, y + size * 0.5);
        ctx.lineTo(x + size * 0.866, y + size * 0.5);
        ctx.closePath();
        ctx.fillStyle = `hsla(${180 + depth * 30 + time}, 80%, 60%, 0.8)`;
        ctx.fill();
        return;
    }

    const newSize = size / 2;
    drawSierpinski(x, y - newSize, newSize, depth - 1);
    drawSierpinski(x - newSize * 0.866, y + newSize * 0.5, newSize, depth - 1);
    drawSierpinski(x + newSize * 0.866, y + newSize * 0.5, newSize, depth - 1);
}

function drawKoch(x1, y1, x2, y2, depth) {
    if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(${200 + time}, 80%, 60%, 0.8)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;

    const x3 = x1 + dx / 3;
    const y3 = y1 + dy / 3;
    const x5 = x1 + dx * 2 / 3;
    const y5 = y1 + dy * 2 / 3;

    const x4 = (x1 + x2) / 2 + Math.sqrt(3) * (y1 - y2) / 6;
    const y4 = (y1 + y2) / 2 + Math.sqrt(3) * (x2 - x1) / 6;

    drawKoch(x1, y1, x3, y3, depth - 1);
    drawKoch(x3, y3, x4, y4, depth - 1);
    drawKoch(x4, y4, x5, y5, depth - 1);
    drawKoch(x5, y5, x2, y2, depth - 1);
}

function drawTree(x, y, length, angle, depth) {
    if (depth === 0 || length < 2) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `hsla(${120 + depth * 20 + time}, 70%, ${40 + depth * 5}%, 0.9)`;
    ctx.lineWidth = depth * 0.8;
    ctx.stroke();

    const branchAngle = 0.4 + Math.sin(time * 0.02) * 0.1;
    drawTree(endX, endY, length * 0.7, angle - branchAngle, depth - 1);
    drawTree(endX, endY, length * 0.7, angle + branchAngle, depth - 1);
}

function drawDragon(iterations) {
    let sequence = [1];

    for (let i = 0; i < iterations; i++) {
        const newSeq = [...sequence, 1];
        for (let j = sequence.length - 1; j >= 0; j--) {
            newSeq.push(j % 2 === 0 ? -sequence[j] : sequence[j]);
        }
        sequence = newSeq;
    }

    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let angle = 0;
    const step = Math.max(2, 150 / Math.pow(1.5, iterations));

    ctx.beginPath();
    ctx.moveTo(x, y);

    sequence.forEach((turn, i) => {
        angle += turn * Math.PI / 2;
        x += Math.cos(angle) * step;
        y += Math.sin(angle) * step;
        ctx.lineTo(x, y);
    });

    ctx.strokeStyle = `hsla(${time % 360}, 80%, 60%, 0.8)`;
    ctx.lineWidth = 1;
    ctx.stroke();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const depth = Math.floor((Math.sin(time * 0.02) + 1) * 2) + 3;

    switch (fractalType) {
        case 0:
            drawSierpinski(canvas.width / 2, canvas.height / 2 + 20, 100, depth);
            break;
        case 1:
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const r = 100;
            for (let i = 0; i < 3; i++) {
                const a1 = (i / 3) * Math.PI * 2 - Math.PI / 2 + time * 0.01;
                const a2 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2 + time * 0.01;
                drawKoch(
                    cx + Math.cos(a1) * r, cy + Math.sin(a1) * r,
                    cx + Math.cos(a2) * r, cy + Math.sin(a2) * r,
                    depth - 1
                );
            }
            break;
        case 2:
            drawTree(canvas.width / 2, canvas.height - 20, 70, -Math.PI / 2, depth + 3);
            break;
        case 3:
            drawDragon(Math.min(12, depth + 6));
            break;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(fractals[fractalType], canvas.width / 2, 20);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('fractalBtn').addEventListener('click', () => {
    fractalType = (fractalType + 1) % fractals.length;
});

animate();
