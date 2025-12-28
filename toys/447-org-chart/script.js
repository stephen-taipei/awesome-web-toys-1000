const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const org = {
    name: '執行長',
    title: 'CEO',
    children: [
        { name: '技術長', title: 'CTO', children: [
            { name: '前端主管', title: 'FE Lead' },
            { name: '後端主管', title: 'BE Lead' }
        ]},
        { name: '財務長', title: 'CFO', children: [
            { name: '會計', title: 'Accountant' }
        ]},
        { name: '營運長', title: 'COO', children: [
            { name: '人資', title: 'HR' },
            { name: '行政', title: 'Admin' }
        ]}
    ]
};

const nodeWidth = 70;
const nodeHeight = 40;
const levelGap = 60;
let nodes = [];
let hoverNode = null;

function layoutTree(node, depth, startX, endX) {
    const x = (startX + endX) / 2;
    const y = 50 + depth * levelGap;

    const nodeObj = { ...node, x, y, depth };
    nodes.push(nodeObj);

    if (node.children) {
        const childCount = node.children.length;
        const childWidth = (endX - startX) / childCount;

        node.children.forEach((child, i) => {
            const childStartX = startX + i * childWidth;
            const childEndX = childStartX + childWidth;
            layoutTree(child, depth + 1, childStartX, childEndX);
        });
    }

    return nodeObj;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes = [];
    layoutTree(org, 0, 20, canvas.width - 20);

    // Draw connections first
    nodes.forEach(node => {
        if (node.children) {
            node.children.forEach(childName => {
                const child = nodes.find(n => n.name === childName.name && n.depth === node.depth + 1);
                if (child) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y + nodeHeight / 2);
                    ctx.lineTo(node.x, node.y + levelGap / 2);
                    ctx.lineTo(child.x, node.y + levelGap / 2);
                    ctx.lineTo(child.x, child.y - nodeHeight / 2);
                    ctx.stroke();
                }
            });
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const isHover = hoverNode === node;
        const colors = ['#e74c3c', '#3498db', '#2ecc71'];
        const color = colors[Math.min(node.depth, 2)];

        // Card
        ctx.fillStyle = isHover ? color : `${color}cc`;
        ctx.beginPath();
        ctx.roundRect(node.x - nodeWidth / 2, node.y - nodeHeight / 2, nodeWidth, nodeHeight, 8);
        ctx.fill();

        if (isHover) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y - 3);
        ctx.font = '9px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(node.title, node.x, node.y + 10);
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('公司組織架構', canvas.width / 2, 25);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverNode = null;
    for (const node of nodes) {
        if (x >= node.x - nodeWidth / 2 && x <= node.x + nodeWidth / 2 &&
            y >= node.y - nodeHeight / 2 && y <= node.y + nodeHeight / 2) {
            hoverNode = node;
            break;
        }
    }

    canvas.style.cursor = hoverNode ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverNode) {
        const childCount = hoverNode.children ? hoverNode.children.length : 0;
        infoEl.textContent = `${hoverNode.name} (${hoverNode.title}) - 下屬: ${childCount} 人`;
    }
});

draw();
