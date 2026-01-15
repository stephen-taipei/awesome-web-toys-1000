const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pointerCount = document.getElementById('pointerCount');

canvas.width = 370;
canvas.height = 260;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const pointers = new Map();
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function draw(pointerId, x, y) {
    const pointer = pointers.get(pointerId);
    if (pointer && pointer.lastX !== null) {
        ctx.strokeStyle = pointer.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pointer.lastX, pointer.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    if (pointer) {
        pointer.lastX = x;
        pointer.lastY = y;
    }
}

canvas.addEventListener('pointerdown', (e) => {
    const pos = getPos(e);
    const color = colors[pointers.size % colors.length];
    pointers.set(e.pointerId, { lastX: pos.x, lastY: pos.y, color });
    pointerCount.textContent = `觸控點: ${pointers.size}`;
});

canvas.addEventListener('pointermove', (e) => {
    if (pointers.has(e.pointerId)) {
        const pos = getPos(e);
        draw(e.pointerId, pos.x, pos.y);
    }
});

canvas.addEventListener('pointerup', (e) => {
    pointers.delete(e.pointerId);
    pointerCount.textContent = `觸控點: ${pointers.size}`;
});

canvas.addEventListener('pointercancel', (e) => {
    pointers.delete(e.pointerId);
    pointerCount.textContent = `觸控點: ${pointers.size}`;
});

canvas.addEventListener('pointerleave', (e) => {
    pointers.delete(e.pointerId);
    pointerCount.textContent = `觸控點: ${pointers.size}`;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
