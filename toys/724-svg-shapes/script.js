const svg = document.getElementById('svgCanvas');
let shapeType = 'rect';
let color = '#2ecc71';
let drawing = false;
let startX, startY;
let currentShape = null;

function getPos(e) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    return {
        x: ((e.clientX - rect.left) / rect.width) * viewBox.width,
        y: ((e.clientY - rect.top) / rect.height) * viewBox.height
    };
}

function createShape(x, y) {
    const ns = 'http://www.w3.org/2000/svg';
    let shape;

    switch (shapeType) {
        case 'rect':
            shape = document.createElementNS(ns, 'rect');
            shape.setAttribute('x', x);
            shape.setAttribute('y', y);
            shape.setAttribute('rx', 5);
            break;
        case 'circle':
            shape = document.createElementNS(ns, 'circle');
            shape.setAttribute('cx', x);
            shape.setAttribute('cy', y);
            break;
        case 'ellipse':
            shape = document.createElementNS(ns, 'ellipse');
            shape.setAttribute('cx', x);
            shape.setAttribute('cy', y);
            break;
        case 'polygon':
            shape = document.createElementNS(ns, 'polygon');
            break;
    }

    shape.setAttribute('fill', color);
    shape.setAttribute('stroke', '#fff');
    shape.setAttribute('stroke-width', 2);
    svg.appendChild(shape);
    return shape;
}

function updateShape(endX, endY) {
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);

    switch (shapeType) {
        case 'rect':
            currentShape.setAttribute('x', minX);
            currentShape.setAttribute('y', minY);
            currentShape.setAttribute('width', width);
            currentShape.setAttribute('height', height);
            break;
        case 'circle':
            const radius = Math.sqrt(width * width + height * height) / 2;
            currentShape.setAttribute('r', radius);
            break;
        case 'ellipse':
            currentShape.setAttribute('rx', width / 2);
            currentShape.setAttribute('ry', height / 2);
            break;
        case 'polygon':
            const cx = (startX + endX) / 2;
            const cy = (startY + endY) / 2;
            const r = Math.min(width, height) / 2;
            let points = '';
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 - 90) * Math.PI / 180;
                points += `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `;
            }
            currentShape.setAttribute('points', points.trim());
            break;
    }
}

svg.addEventListener('mousedown', (e) => {
    drawing = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;
    currentShape = createShape(pos.x, pos.y);
});

svg.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    updateShape(pos.x, pos.y);
});

svg.addEventListener('mouseup', () => {
    drawing = false;
    currentShape = null;
});

document.querySelectorAll('.shape').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.shape').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        shapeType = btn.dataset.shape;
    });
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    svg.innerHTML = '';
});
