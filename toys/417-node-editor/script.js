const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hintEl = document.getElementById('hint');
const connectBtn = document.getElementById('connectMode');

let nodes = [];
let edges = [];
let dragging = null;
let connectMode = false;
let connectSource = null;

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

function addNode(x, y) {
    nodes.push({
        id: nodes.length,
        x: x || 100 + Math.random() * 160,
        y: y || 100 + Math.random() * 120,
        color: colors[nodes.length % colors.length],
        label: String.fromCharCode(65 + nodes.length)
    });
    draw();
}

function findNode(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist < 20) return node;
    }
    return null;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (source && target) {
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();

            // Arrow
            const angle = Math.atan2(target.y - source.y, target.x - source.x);
            const arrowX = target.x - Math.cos(angle) * 25;
            const arrowY = target.y - Math.sin(angle) * 25;
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - Math.cos(angle - 0.3) * 10, arrowY - Math.sin(angle - 0.3) * 10);
            ctx.lineTo(arrowX - Math.cos(angle + 0.3) * 10, arrowY - Math.sin(angle + 0.3) * 10);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
        }
    });

    // Draw temporary connection line
    if (connectMode && connectSource && dragging === null) {
        // Will be drawn on mouse move
    }

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = node === connectSource ? '#fff' : 'rgba(255,255,255,0.5)';
        ctx.lineWidth = node === connectSource ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
    });
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const node = findNode(mx, my);

    if (connectMode) {
        if (node) {
            if (!connectSource) {
                connectSource = node;
                hintEl.textContent = `從 ${node.label} 連接到...`;
            } else if (node !== connectSource) {
                // Check if edge exists
                const exists = edges.some(e =>
                    (e.source === connectSource.id && e.target === node.id) ||
                    (e.source === node.id && e.target === connectSource.id)
                );
                if (!exists) {
                    edges.push({ source: connectSource.id, target: node.id });
                }
                connectSource = null;
                hintEl.textContent = '點擊節點開始連接';
            }
        }
    } else {
        if (node) {
            dragging = node;
        }
    }

    draw();
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    dragging.x = e.clientX - rect.left;
    dragging.y = e.clientY - rect.top;
    draw();
});

canvas.addEventListener('mouseup', () => {
    dragging = null;
});

document.getElementById('addNode').addEventListener('click', () => addNode());

connectBtn.addEventListener('click', () => {
    connectMode = !connectMode;
    connectBtn.classList.toggle('active', connectMode);
    connectSource = null;
    hintEl.textContent = connectMode ? '點擊節點開始連接' : '拖曳節點移動位置';
});

document.getElementById('clear').addEventListener('click', () => {
    nodes = [];
    edges = [];
    draw();
});

// Initial nodes
addNode(100, 100);
addNode(260, 100);
addNode(180, 220);
edges.push({ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 0 });
draw();
