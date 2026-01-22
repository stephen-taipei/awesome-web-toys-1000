const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let currentShape = 0;
let morphProgress = 1;
let time = 0;

const shapes = ['circle', 'square', 'triangle', 'star', 'hexagon'];
const colors = ['#9B59B6', '#3498DB', '#E74C3C', '#F1C40F', '#1ABC9C'];

function getShapePoints(shape, cx, cy, size, pointCount = 60) {
    const points = [];

    for (let i = 0; i < pointCount; i++) {
        const angle = (i / pointCount) * Math.PI * 2 - Math.PI / 2;
        let x, y;

        switch (shape) {
            case 'circle':
                x = cx + Math.cos(angle) * size;
                y = cy + Math.sin(angle) * size;
                break;
            case 'square':
                const squareAngle = angle + Math.PI / 4;
                const squareRadius = size / Math.cos((squareAngle % (Math.PI / 2)) - Math.PI / 4);
                x = cx + Math.cos(angle) * Math.min(squareRadius, size * 1.4);
                y = cy + Math.sin(angle) * Math.min(squareRadius, size * 1.4);
                break;
            case 'triangle':
                const triAngle = angle + Math.PI / 2;
                const section = Math.floor(((triAngle + Math.PI) % (Math.PI * 2)) / (Math.PI * 2 / 3));
                const triRadius = size / Math.cos((triAngle % (Math.PI * 2 / 3)) - Math.PI / 3);
                x = cx + Math.cos(angle) * Math.min(triRadius, size * 1.2);
                y = cy + Math.sin(angle) * Math.min(triRadius, size * 1.2);
                break;
            case 'star':
                const starPoints = 5;
                const starAngle = (i / pointCount) * starPoints;
                const starRadius = size * (0.5 + 0.5 * Math.cos(starAngle * Math.PI * 2));
                x = cx + Math.cos(angle) * starRadius;
                y = cy + Math.sin(angle) * starRadius;
                break;
            case 'hexagon':
                const hexAngle = angle + Math.PI / 6;
                const hexRadius = size / Math.cos((hexAngle % (Math.PI / 3)) - Math.PI / 6);
                x = cx + Math.cos(angle) * Math.min(hexRadius, size * 1.15);
                y = cy + Math.sin(angle) * Math.min(hexRadius, size * 1.15);
                break;
        }
        points.push({ x, y });
    }
    return points;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function triggerMorph() {
    if (morphProgress >= 1) {
        currentShape = (currentShape + 1) % shapes.length;
        morphProgress = 0;
    }
}

function drawBackground() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50; i++) {
        const x = (i * 37 + time * 0.1) % canvas.width;
        const y = (i * 23 + Math.sin(i + time * 0.01) * 10) % canvas.height;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(i + time * 0.05) * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawShape() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const size = 70;

    const prevShape = shapes[(currentShape - 1 + shapes.length) % shapes.length];
    const nextShape = shapes[currentShape];

    const prevPoints = getShapePoints(prevShape, cx, cy, size);
    const nextPoints = getShapePoints(nextShape, cx, cy, size);

    const t = easeInOut(morphProgress);

    const prevColor = colors[(currentShape - 1 + colors.length) % colors.length];
    const nextColor = colors[currentShape];

    ctx.beginPath();
    for (let i = 0; i < prevPoints.length; i++) {
        const x = lerp(prevPoints[i].x, nextPoints[i].x, t);
        const y = lerp(prevPoints[i].y, nextPoints[i].y, t);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
    gradient.addColorStop(0, nextColor);
    gradient.addColorStop(1, prevColor);

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = nextColor;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`形狀: ${shapes[currentShape]}`, 20, 28);
}

function animate() {
    time++;

    if (morphProgress < 1) {
        morphProgress += 0.02;
        if (morphProgress > 1) morphProgress = 1;
    }

    drawBackground();
    drawShape();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('morphBtn').addEventListener('click', triggerMorph);

animate();
