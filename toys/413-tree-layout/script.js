const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tree = {
    name: 'CEO',
    children: [
        {
            name: 'CTO',
            children: [
                { name: '開發' },
                { name: '測試' }
            ]
        },
        {
            name: 'CFO',
            children: [
                { name: '會計' },
                { name: '財務' }
            ]
        },
        {
            name: 'CMO',
            children: [
                { name: '行銷' },
                { name: '業務' }
            ]
        }
    ]
};

let layout = 'vertical';
let positions = [];

function calculatePositions(node, depth = 0, index = 0, parentX = 180, parentY = 30) {
    positions = [];
    layoutTree(tree, 0, 0, 360, layout);
}

function layoutTree(node, depth, startX, width, layoutType) {
    const children = node.children || [];

    if (layoutType === 'vertical') {
        const y = 40 + depth * 80;
        const x = startX + width / 2;
        node.x = x;
        node.y = y;

        const childWidth = width / (children.length || 1);
        children.forEach((child, i) => {
            layoutTree(child, depth + 1, startX + i * childWidth, childWidth, layoutType);
        });
    } else if (layoutType === 'horizontal') {
        const x = 50 + depth * 100;
        const y = startX + width / 2;
        node.x = x;
        node.y = y;

        const childWidth = width / (children.length || 1);
        children.forEach((child, i) => {
            layoutTree(child, depth + 1, startX + i * childWidth, childWidth, layoutType);
        });
    } else if (layoutType === 'radial') {
        const cx = 180, cy = 180;
        if (depth === 0) {
            node.x = cx;
            node.y = cy;
        }

        const radius = 50 + depth * 70;
        const angleSpan = width;
        const startAngle = startX;

        const childAngle = angleSpan / (children.length || 1);
        children.forEach((child, i) => {
            const angle = startAngle + (i + 0.5) * childAngle;
            child.x = cx + Math.cos(angle) * radius;
            child.y = cy + Math.sin(angle) * radius;
            layoutTree(child, depth + 1, startAngle + i * childAngle, childAngle, layoutType);
        });
    }
}

function drawTree(node, parent = null) {
    const children = node.children || [];

    // Draw edge to parent
    if (parent) {
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw children first (so edges are behind)
    children.forEach(child => drawTree(child, node));

    // Draw node
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = parent ? '#3498db' : '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, node.x, node.y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (layout === 'radial') {
        layoutTree(tree, 0, -Math.PI / 2, Math.PI * 2, layout);
    } else if (layout === 'horizontal') {
        layoutTree(tree, 0, 30, 300, layout);
    } else {
        layoutTree(tree, 0, 0, 360, layout);
    }

    drawTree(tree);
}

document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.layout-btn.active').classList.remove('active');
        btn.classList.add('active');
        layout = btn.dataset.layout;
        draw();
    });
});

draw();
