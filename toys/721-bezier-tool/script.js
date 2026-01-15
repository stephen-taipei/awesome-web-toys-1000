const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let points = [];
let draggingPoint = null;
let color = '#9b59b6';

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        if (points.length === 2) {
            ctx.lineTo(points[1].x, points[1].y);
        } else if (points.length === 3) {
            ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
        } else if (points.length >= 4) {
            ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw control lines
        ctx.strokeStyle = 'rgba(155,89,182,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw points
    points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 || i === points.length - 1 ? color : '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * canvas.width / rect.width,
        y: (e.clientY - rect.top) * canvas.height / rect.height
    };
}

function findPoint(pos) {
    return points.find(p => Math.hypot(p.x - pos.x, p.y - pos.y) < 15);
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getPos(e);
    const found = findPoint(pos);

    if (found) {
        draggingPoint = found;
    } else if (points.length < 4) {
        points.push(pos);
        draw();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingPoint) {
        const pos = getPos(e);
        draggingPoint.x = pos.x;
        draggingPoint.y = pos.y;
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    draggingPoint = null;
});

document.getElementById('colorPicker').addEventListener('input', (e) => {
    color = e.target.value;
    draw();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    points = [];
    draw();
});

draw();
