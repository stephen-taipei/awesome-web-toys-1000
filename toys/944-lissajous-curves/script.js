const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const ratios = [
    { a: 1, b: 2 },
    { a: 2, b: 3 },
    { a: 3, b: 4 },
    { a: 3, b: 5 },
    { a: 4, b: 5 },
    { a: 5, b: 6 }
];

let ratioIndex = 0;
let time = 0;
let trail = [];

function changeRatio() {
    ratioIndex = (ratioIndex + 1) % ratios.length;
    trail = [];
}

function draw() {
    ctx.fillStyle = 'rgba(21, 10, 21, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ratio = ratios[ratioIndex];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ampX = 120;
    const ampY = 100;

    const t = time * 0.02;
    const x = cx + Math.sin(ratio.a * t) * ampX;
    const y = cy + Math.sin(ratio.b * t) * ampY;

    trail.push({ x, y, t: time });
    if (trail.length > 500) trail.shift();

    ctx.beginPath();
    trail.forEach((p, i) => {
        const alpha = i / trail.length;
        const hue = 280 + alpha * 60;

        if (i === 0) {
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        }
    });

    ctx.fillStyle = '#E040FB';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#E040FB';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 50);

    const ratio = ratios[ratioIndex];
    ctx.fillStyle = '#E040FB';
    ctx.font = '11px Arial';
    ctx.fillText(`頻率比: ${ratio.a}:${ratio.b}`, 20, 28);
    ctx.fillText(`x = sin(${ratio.a}t)`, 20, 45);
}

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('changeBtn').addEventListener('click', changeRatio);

animate();
