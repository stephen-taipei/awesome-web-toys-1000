const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const curves = [
    {
        name: '心形線',
        x: (t) => 16 * Math.pow(Math.sin(t), 3),
        y: (t) => -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)),
        scale: 6
    },
    {
        name: '蝴蝶曲線',
        x: (t) => Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4*t) - Math.pow(Math.sin(t/12), 5)),
        y: (t) => Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4*t) - Math.pow(Math.sin(t/12), 5)),
        scale: 30
    },
    {
        name: '螺線',
        x: (t) => t * Math.cos(t) / 5,
        y: (t) => t * Math.sin(t) / 5,
        scale: 5
    },
    {
        name: '星形線',
        x: (t) => Math.pow(Math.cos(t), 3),
        y: (t) => Math.pow(Math.sin(t), 3),
        scale: 100
    }
];

let curveIndex = 0;
let time = 0;
let progress = 0;

function changeCurve() {
    curveIndex = (curveIndex + 1) % curves.length;
    progress = 0;
}

function draw() {
    ctx.fillStyle = 'rgba(10, 21, 21, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const curve = curves[curveIndex];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    progress += 0.03;
    const maxT = Math.PI * 2 * (curveIndex === 1 ? 12 : 1);
    if (progress > maxT) progress = maxT;

    ctx.strokeStyle = '#00BFA5';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let t = 0; t <= progress; t += 0.01) {
        const x = cx + curve.x(t) * curve.scale;
        const y = cy + curve.y(t) * curve.scale;

        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();

    const endX = cx + curve.x(progress) * curve.scale;
    const endY = cy + curve.y(progress) * curve.scale;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#00BFA5';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#00BFA5';
    ctx.font = '11px Arial';
    ctx.fillText(curves[curveIndex].name, 20, 28);
}

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('curveBtn').addEventListener('click', changeCurve);

animate();
