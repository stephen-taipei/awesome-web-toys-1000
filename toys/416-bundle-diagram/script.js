const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tensionSlider = document.getElementById('tension');
const tensionVal = document.getElementById('tensionVal');

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = 150;
const nodeCount = 20;

let nodes = [];
let edges = [];

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

function init() {
    nodes = [];
    edges = [];

    // Create nodes in circle
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const group = Math.floor(i / 4);
        nodes.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            angle: angle,
            color: colors[group % colors.length],
            group: group
        });
    }

    // Create edges between groups
    for (let i = 0; i < nodeCount; i++) {
        const numEdges = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numEdges; j++) {
            const target = Math.floor(Math.random() * nodeCount);
            if (target !== i && nodes[i].group !== nodes[target].group) {
                edges.push({ source: i, target: target });
            }
        }
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tension = tensionSlider.value / 100;

    // Draw edges with bundling
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];

        // Control point moves toward center based on tension
        const cpX = lerp((source.x + target.x) / 2, cx, tension);
        const cpY = lerp((source.y + target.y) / 2, cy, tension);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
    });
}

tensionSlider.addEventListener('input', () => {
    tensionVal.textContent = tensionSlider.value + '%';
    draw();
});

init();
draw();
