const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const nodes = [
    { name: 'A', x: 40 },
    { name: 'B', x: 90 },
    { name: 'C', x: 140 },
    { name: 'D', x: 190 },
    { name: 'E', x: 240 },
    { name: 'F', x: 290 },
    { name: 'G', x: 340 }
];

const links = [
    { source: 0, target: 2, weight: 3 },
    { source: 0, target: 4, weight: 2 },
    { source: 1, target: 3, weight: 4 },
    { source: 1, target: 5, weight: 2 },
    { source: 2, target: 4, weight: 3 },
    { source: 2, target: 6, weight: 1 },
    { source: 3, target: 5, weight: 3 },
    { source: 4, target: 6, weight: 2 },
    { source: 0, target: 6, weight: 1 }
];

const baseY = 200;
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
let hoverNode = null;
let hoverLink = null;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('節點關係弧線圖', canvas.width / 2, 25);

    // Draw arcs
    links.forEach(link => {
        const source = nodes[link.source];
        const target = nodes[link.target];
        const isHover = hoverLink === link || hoverNode === link.source || hoverNode === link.target;

        const midX = (source.x + target.x) / 2;
        const radius = Math.abs(target.x - source.x) / 2;

        ctx.beginPath();
        ctx.arc(midX, baseY, radius, Math.PI, 0);
        ctx.strokeStyle = isHover ? colors[link.source] : `${colors[link.source]}66`;
        ctx.lineWidth = link.weight + (isHover ? 2 : 0);
        ctx.stroke();
    });

    // Base line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, baseY);
    ctx.lineTo(canvas.width - 20, baseY);
    ctx.stroke();

    // Draw nodes
    nodes.forEach((node, i) => {
        const isHover = hoverNode === i;

        ctx.beginPath();
        ctx.arc(node.x, baseY, isHover ? 15 : 12, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, baseY + 4);

        // Label below
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Arial';
        ctx.fillText(`節點 ${node.name}`, node.x, baseY + 30);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverNode = null;
    hoverLink = null;

    // Check nodes
    nodes.forEach((node, i) => {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - baseY) ** 2);
        if (dist < 15) {
            hoverNode = i;
        }
    });

    canvas.style.cursor = hoverNode !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverNode !== null) {
        const connections = links.filter(l => l.source === hoverNode || l.target === hoverNode);
        infoEl.textContent = `節點 ${nodes[hoverNode].name}: ${connections.length} 個連接`;
    }
});

draw();
