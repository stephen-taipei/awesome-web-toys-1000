const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

let nodes = [];
let selectedNode = null;
let nodeCounter = 0;

function createNode(text, x, y, parent = null) {
    const node = {
        id: nodeCounter++,
        text: text,
        x: x,
        y: y,
        parent: parent,
        children: [],
        color: parent ? parent.color : colors[0],
        level: parent ? parent.level + 1 : 0
    };

    if (parent) {
        node.color = colors[node.level % colors.length];
        parent.children.push(node);
    }

    nodes.push(node);
    return node;
}

function initMindMap() {
    nodes = [];
    nodeCounter = 0;
    selectedNode = null;

    const root = createNode('主題', 180, 160);
    createNode('想法1', 80, 80, root);
    createNode('想法2', 280, 80, root);
    createNode('想法3', 80, 240, root);
    createNode('想法4', 280, 240, root);
}

function getNodeAt(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const width = Math.max(60, ctx.measureText(node.text).width + 20);
        if (x >= node.x - width / 2 && x <= node.x + width / 2 &&
            y >= node.y - 15 && y <= node.y + 15) {
            return node;
        }
    }
    return null;
}

function layoutChildren(parent) {
    const children = parent.children;
    if (children.length === 0) return;

    const angleStep = (Math.PI * 2) / Math.max(children.length, 4);
    const startAngle = -Math.PI / 2;
    const radius = 80;

    children.forEach((child, i) => {
        const angle = startAngle + i * angleStep;
        child.x = parent.x + Math.cos(angle) * radius;
        child.y = parent.y + Math.sin(angle) * radius;
        layoutChildren(child);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    nodes.forEach(node => {
        if (node.parent) {
            ctx.beginPath();
            ctx.moveTo(node.parent.x, node.parent.y);

            // Curved line
            const cpX = (node.parent.x + node.x) / 2;
            const cpY = node.parent.y;
            ctx.quadraticCurveTo(cpX, cpY, node.x, node.y);

            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Draw nodes
    ctx.font = '12px Arial';
    nodes.forEach(node => {
        const width = Math.max(60, ctx.measureText(node.text).width + 20);
        const height = 30;

        // Node background
        ctx.beginPath();
        ctx.roundRect(node.x - width / 2, node.y - height / 2, width, height, 15);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Selection highlight
        if (node === selectedNode) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.text, node.x, node.y);
    });
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = getNodeAt(x, y);
    selectedNode = node;
    draw();
});

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = getNodeAt(x, y);
    if (node) {
        const newText = prompt('編輯文字:', node.text);
        if (newText !== null && newText.trim() !== '') {
            node.text = newText.trim();
            draw();
        }
    }
});

document.getElementById('addChild').addEventListener('click', () => {
    if (!selectedNode) {
        alert('請先選擇一個節點');
        return;
    }

    const newText = prompt('輸入新節點文字:');
    if (newText !== null && newText.trim() !== '') {
        createNode(newText.trim(), selectedNode.x + 50, selectedNode.y + 50, selectedNode);
        layoutChildren(selectedNode);
        draw();
    }
});

document.getElementById('reset').addEventListener('click', () => {
    initMindMap();
    draw();
});

initMindMap();
draw();
