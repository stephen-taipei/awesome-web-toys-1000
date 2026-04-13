const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let segments = 6;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let shapes = [];
let time = 0;

function addSegment() {
    segments = segments >= 12 ? 4 : segments + 2;
}

function init() {
    for (let i = 0; i < 20; i++) {
        shapes.push({
            angle: Math.random() * Math.PI * 2,
            distance: 20 + Math.random() * 100,
            size: 5 + Math.random() * 15,
            hue: Math.random() * 360,
            type: Math.floor(Math.random() * 3),
            speed: 0.01 + Math.random() * 0.02
        });
    }
}

function updateShapes() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const mouseDist = Math.sqrt(dx * dx + dy * dy);
    const mouseAngle = Math.atan2(dy, dx);

    shapes.forEach(shape => {
        shape.angle += shape.speed + (mouseDist * 0.0001);
        shape.hue = (shape.hue + 0.5) % 360;
    });
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawKaleidoscope() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let seg = 0; seg < segments; seg++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((seg / segments) * Math.PI * 2);

        if (seg % 2 === 1) {
            ctx.scale(1, -1);
        }

        shapes.forEach(shape => {
            const x = Math.cos(shape.angle) * shape.distance;
            const y = Math.sin(shape.angle) * shape.distance;

            ctx.fillStyle = `hsla(${shape.hue}, 80%, 60%, 0.8)`;
            ctx.shadowColor = `hsl(${shape.hue}, 80%, 60%)`;
            ctx.shadowBlur = 10;

            ctx.beginPath();

            switch (shape.type) {
                case 0:
                    ctx.arc(x, y, shape.size, 0, Math.PI * 2);
                    break;
                case 1:
                    ctx.rect(x - shape.size / 2, y - shape.size / 2, shape.size, shape.size);
                    break;
                case 2:
                    ctx.moveTo(x, y - shape.size);
                    ctx.lineTo(x + shape.size, y + shape.size);
                    ctx.lineTo(x - shape.size, y + shape.size);
                    ctx.closePath();
                    break;
            }

            ctx.fill();
        });

        ctx.restore();
    }

    ctx.shadowBlur = 0;
}

function drawCenter() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    gradient.addColorStop(0, `hsla(${time % 360}, 80%, 70%, 0.8)`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`分割: ${segments}`, 20, 28);
}

function animate() {
    time++;
    updateShapes();
    drawBackground();
    drawKaleidoscope();
    drawCenter();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height);
});

document.getElementById('segmentBtn').addEventListener('click', addSegment);

init();
animate();
