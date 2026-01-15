const svg = document.getElementById('svgCanvas');
const path = document.getElementById('mainPath');
const nodes = [];
let dragging = null;
let closed = false;

function updatePath() {
    if (nodes.length < 2) {
        path.setAttribute('d', '');
        return;
    }

    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
        d += ` L ${nodes[i].x} ${nodes[i].y}`;
    }
    if (closed) d += ' Z';
    path.setAttribute('d', d);
}

function createNode(x, y) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 8);
    circle.setAttribute('class', 'node');

    const nodeData = { x, y, el: circle };
    nodes.push(nodeData);

    circle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragging = nodeData;
    });

    svg.appendChild(circle);
    updatePath();
}

function getPos(e) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    return {
        x: ((e.clientX - rect.left) / rect.width) * viewBox.width,
        y: ((e.clientY - rect.top) / rect.height) * viewBox.height
    };
}

svg.addEventListener('click', (e) => {
    if (e.target === svg || e.target === path) {
        const pos = getPos(e);
        createNode(pos.x, pos.y);
    }
});

svg.addEventListener('mousemove', (e) => {
    if (dragging) {
        const pos = getPos(e);
        dragging.x = pos.x;
        dragging.y = pos.y;
        dragging.el.setAttribute('cx', pos.x);
        dragging.el.setAttribute('cy', pos.y);
        updatePath();
    }
});

svg.addEventListener('mouseup', () => {
    dragging = null;
});

document.getElementById('addPoint').addEventListener('click', () => {
    const x = 100 + Math.random() * 160;
    const y = 80 + Math.random() * 120;
    createNode(x, y);
});

document.getElementById('closePath').addEventListener('click', () => {
    closed = !closed;
    updatePath();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    nodes.forEach(n => n.el.remove());
    nodes.length = 0;
    closed = false;
    updatePath();
});
