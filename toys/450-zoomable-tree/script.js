const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const backBtn = document.getElementById('back');

const data = {
    name: '公司',
    children: [
        { name: '產品部', children: [
            { name: '設計組', children: [{ name: 'UI' }, { name: 'UX' }] },
            { name: '開發組', children: [{ name: '前端' }, { name: '後端' }] }
        ]},
        { name: '行銷部', children: [
            { name: '數位行銷', children: [{ name: 'SEO' }, { name: '社群' }] },
            { name: '傳統行銷' }
        ]},
        { name: '財務部', children: [
            { name: '會計' },
            { name: '稽核' }
        ]}
    ]
};

let currentNode = data;
let history = [];
let nodes = [];
let hoverNode = null;

const cx = canvas.width / 2;
const cy = canvas.height / 2 + 20;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Breadcrumb
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    const path = [...history.map(h => h.name), currentNode.name].join(' > ');
    ctx.fillText(path, 20, 25);

    nodes = [];

    // Center node
    const centerRadius = 40;
    nodes.push({ node: currentNode, x: cx, y: cy, r: centerRadius, isCenter: true });

    // Child nodes in circle around center
    if (currentNode.children) {
        const childRadius = 35;
        const orbitRadius = 90;
        const angleStep = (Math.PI * 2) / currentNode.children.length;

        currentNode.children.forEach((child, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const x = cx + Math.cos(angle) * orbitRadius;
            const y = cy + Math.sin(angle) * orbitRadius;
            nodes.push({ node: child, x, y, r: childRadius, isCenter: false });
        });
    }

    // Draw connections
    nodes.forEach(n => {
        if (!n.isCenter) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
        }
    });

    // Draw nodes
    nodes.forEach(n => {
        const isHover = hoverNode === n;
        const hasChildren = n.node.children && n.node.children.length > 0;

        // Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

        if (n.isCenter) {
            ctx.fillStyle = '#e74c3c';
        } else {
            ctx.fillStyle = hasChildren ? (isHover ? '#3498db' : '#2980b9') : (isHover ? '#2ecc71' : '#27ae60');
        }
        ctx.fill();

        if (isHover) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = n.isCenter ? 'bold 13px Arial' : '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(n.node.name, n.x, n.y + 4);

        // Child indicator
        if (hasChildren && !n.isCenter) {
            ctx.font = '9px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText(`+${n.node.children.length}`, n.x, n.y + 18);
        }
    });

    backBtn.disabled = history.length === 0;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverNode = null;
    for (const n of nodes) {
        const dist = Math.sqrt((x - n.x) ** 2 + (y - n.y) ** 2);
        if (dist <= n.r) {
            hoverNode = n;
            break;
        }
    }

    canvas.style.cursor = hoverNode && !hoverNode.isCenter && hoverNode.node.children ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverNode && !hoverNode.isCenter && hoverNode.node.children) {
        history.push(currentNode);
        currentNode = hoverNode.node;
        infoEl.textContent = `進入: ${currentNode.name}`;
        draw();
    }
});

backBtn.addEventListener('click', () => {
    if (history.length > 0) {
        currentNode = history.pop();
        infoEl.textContent = `返回: ${currentNode.name}`;
        draw();
    }
});

draw();
