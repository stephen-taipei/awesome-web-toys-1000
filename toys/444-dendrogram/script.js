const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const data = {
    name: 'Root',
    children: [
        { name: 'A', children: [
            { name: 'A1', children: [{ name: '甲' }, { name: '乙' }] },
            { name: 'A2', children: [{ name: '丙' }] }
        ]},
        { name: 'B', children: [
            { name: 'B1', children: [{ name: '丁' }, { name: '戊' }] },
            { name: 'B2', children: [{ name: '己' }, { name: '庚' }, { name: '辛' }] }
        ]}
    ]
};

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
let colorIndex = 0;

function countLeaves(node) {
    if (!node.children) return 1;
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

function assignPositions(node, xStart, xEnd, depth) {
    const leaves = countLeaves(node);
    node.y = 50 + depth * 50;
    node.x = (xStart + xEnd) / 2;
    node.xStart = xStart;
    node.xEnd = xEnd;

    if (!node.children) {
        node.color = colors[colorIndex++ % colors.length];
        return;
    }

    let currentX = xStart;
    node.children.forEach(child => {
        const childLeaves = countLeaves(child);
        const childWidth = (childLeaves / leaves) * (xEnd - xStart);
        assignPositions(child, currentX, currentX + childWidth, depth + 1);
        currentX += childWidth;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('聚類樹狀圖', canvas.width / 2, 25);

    colorIndex = 0;
    assignPositions(data, 30, canvas.width - 30, 0);
    drawNode(data);
}

function drawNode(node) {
    // Draw connections to children
    if (node.children) {
        node.children.forEach(child => {
            // Vertical line from parent
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y + 8);
            ctx.lineTo(node.x, (node.y + child.y) / 2);
            ctx.stroke();

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(node.x, (node.y + child.y) / 2);
            ctx.lineTo(child.x, (node.y + child.y) / 2);
            ctx.stroke();

            // Vertical line to child
            ctx.beginPath();
            ctx.moveTo(child.x, (node.y + child.y) / 2);
            ctx.lineTo(child.x, child.y - 8);
            ctx.stroke();

            drawNode(child);
        });
    }

    // Draw node
    const isLeaf = !node.children;
    const radius = isLeaf ? 12 : 8;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color || '#fff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = isLeaf ? 'bold 11px Arial' : '10px Arial';
    ctx.textAlign = 'center';

    if (isLeaf) {
        ctx.fillText(node.name, node.x, node.y + 25);
    } else if (node.name !== 'Root') {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(node.name, node.x, node.y - 12);
    }
}

draw();

// Add hover info
canvas.addEventListener('click', () => {
    const totalLeaves = countLeaves(data);
    infoEl.textContent = `總共 ${totalLeaves} 個葉節點，分為 2 大群組`;
});
