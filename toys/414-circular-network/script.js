const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = 140;
const nodeCount = 12;

let nodes = [];
let edges = [];

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

function generateNetwork() {
    nodes = [];
    edges = [];

    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        nodes.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            color: colors[i % colors.length],
            label: String.fromCharCode(65 + i) // A, B, C...
        });
    }

    // Generate random edges
    for (let i = 0; i < nodeCount; i++) {
        const numEdges = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numEdges; j++) {
            const target = Math.floor(Math.random() * nodeCount);
            if (target !== i) {
                edges.push({ source: i, target: target });
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges as bezier curves through center
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);

        // Control point at center for curved lines
        const cpX = cx + (source.x + target.x - 2 * cx) * 0.1;
        const cpY = cy + (source.y + target.y - 2 * cy) * 0.1;
        ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
    });

    // Draw center indicator
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
}

document.getElementById('randomize').addEventListener('click', () => {
    generateNetwork();
    draw();
});

generateNetwork();
draw();
