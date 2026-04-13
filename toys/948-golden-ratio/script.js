const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const PHI = (1 + Math.sqrt(5)) / 2;
let mode = 0;
let time = 0;

function changeMode() {
    mode = (mode + 1) % 3;
}

function drawRectangles() {
    const startSize = 150;
    let x = (canvas.width - startSize * PHI) / 2 + 30;
    let y = (canvas.height - startSize) / 2;
    let size = startSize;

    for (let i = 0; i < 8; i++) {
        const hue = 40 + i * 10;
        ctx.strokeStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.1)`;
        ctx.lineWidth = 2;

        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);

        const direction = i % 4;
        const newSize = size / PHI;

        switch (direction) {
            case 0: x += size; break;
            case 1: y += newSize; x += size - newSize; break;
            case 2: x -= newSize; y += size - newSize; break;
            case 3: y -= newSize; break;
        }

        size = newSize;
    }
}

function drawSpiral() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 2;

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let angle = 0; angle < time * 0.1; angle += 0.02) {
        const r = scale * Math.pow(PHI, angle / (Math.PI / 2));
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        if (r > 150) break;
    }

    ctx.stroke();
}

function drawSunflower() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const goldenAngle = Math.PI * 2 / (PHI * PHI);
    const maxSeeds = Math.min(300, time * 2);

    for (let i = 0; i < maxSeeds; i++) {
        const angle = i * goldenAngle;
        const r = Math.sqrt(i) * 5;

        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        const hue = 30 + (i / maxSeeds) * 30;
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    ctx.fillStyle = '#15150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (mode) {
        case 0:
            drawRectangles();
            drawSpiral();
            break;
        case 1:
            drawSunflower();
            break;
        case 2:
            drawRectangles();
            break;
    }

    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 50);

    ctx.fillStyle = '#FFD700';
    ctx.font = '11px Arial';
    ctx.fillText(`φ = ${PHI.toFixed(6)}`, 20, 28);

    const modes = ['螺旋', '向日葵', '矩形'];
    ctx.fillText(`模式: ${modes[mode]}`, 20, 45);
}

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('modeBtn').addEventListener('click', changeMode);

animate();
