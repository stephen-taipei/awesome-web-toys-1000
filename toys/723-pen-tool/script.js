const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let anchors = [];
let isDragging = false;
let currentAnchor = null;
let color = '#e74c3c';

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * canvas.width / rect.width,
        y: (e.clientY - rect.top) * canvas.height / rect.height
    };
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (anchors.length > 0) {
        ctx.beginPath();
        ctx.moveTo(anchors[0].x, anchors[0].y);

        for (let i = 1; i < anchors.length; i++) {
            const prev = anchors[i - 1];
            const curr = anchors[i];

            if (prev.handleOut && curr.handleIn) {
                ctx.bezierCurveTo(
                    prev.handleOut.x, prev.handleOut.y,
                    curr.handleIn.x, curr.handleIn.y,
                    curr.x, curr.y
                );
            } else {
                ctx.lineTo(curr.x, curr.y);
            }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Draw handles and anchors
    anchors.forEach((a, i) => {
        if (a.handleIn) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(a.handleIn.x, a.handleIn.y);
            ctx.strokeStyle = 'rgba(231,76,60,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(a.handleIn.x, a.handleIn.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
        }

        if (a.handleOut) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(a.handleOut.x, a.handleOut.y);
            ctx.strokeStyle = 'rgba(231,76,60,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(a.handleOut.x, a.handleOut.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(a.x, a.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getPos(e);
    isDragging = true;
    currentAnchor = { x: pos.x, y: pos.y };
    anchors.push(currentAnchor);
    draw();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentAnchor) return;
    const pos = getPos(e);

    const dx = pos.x - currentAnchor.x;
    const dy = pos.y - currentAnchor.y;

    currentAnchor.handleOut = { x: currentAnchor.x + dx, y: currentAnchor.y + dy };
    currentAnchor.handleIn = { x: currentAnchor.x - dx, y: currentAnchor.y - dy };

    draw();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    currentAnchor = null;
});

document.getElementById('colorPicker').addEventListener('input', (e) => {
    color = e.target.value;
    draw();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    anchors = [];
    draw();
});

draw();
