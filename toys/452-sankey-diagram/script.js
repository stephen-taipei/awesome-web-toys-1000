const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const nodes = {
    sources: [
        { name: '薪資', value: 100, color: '#3498db' },
        { name: '投資', value: 30, color: '#2ecc71' },
        { name: '其他', value: 20, color: '#9b59b6' }
    ],
    targets: [
        { name: '生活', value: 50, color: '#e74c3c' },
        { name: '儲蓄', value: 40, color: '#f39c12' },
        { name: '娛樂', value: 30, color: '#1abc9c' },
        { name: '投資', value: 30, color: '#e67e22' }
    ]
};

const flows = [
    { source: 0, target: 0, value: 40 },
    { source: 0, target: 1, value: 30 },
    { source: 0, target: 2, value: 20 },
    { source: 0, target: 3, value: 10 },
    { source: 1, target: 1, value: 10 },
    { source: 1, target: 3, value: 20 },
    { source: 2, target: 0, value: 10 },
    { source: 2, target: 2, value: 10 }
];

const leftX = 50;
const rightX = canvas.width - 50;
const nodeWidth = 20;
let hoverFlow = null;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('收入支出流向圖', canvas.width / 2, 25);

    const totalSource = nodes.sources.reduce((a, b) => a + b.value, 0);
    const totalTarget = nodes.targets.reduce((a, b) => a + b.value, 0);
    const chartHeight = canvas.height - 80;

    // Calculate positions
    let sourceY = 50;
    const sourcePositions = nodes.sources.map(node => {
        const height = (node.value / totalSource) * chartHeight;
        const pos = { y: sourceY, height };
        sourceY += height + 10;
        return pos;
    });

    let targetY = 50;
    const targetPositions = nodes.targets.map(node => {
        const height = (node.value / totalTarget) * chartHeight;
        const pos = { y: targetY, height };
        targetY += height + 8;
        return pos;
    });

    // Track flow positions
    const sourceFlowY = nodes.sources.map(() => 0);
    const targetFlowY = nodes.targets.map(() => 0);

    // Draw flows
    flows.forEach(flow => {
        const sourcePos = sourcePositions[flow.source];
        const targetPos = targetPositions[flow.target];
        const sourceNode = nodes.sources[flow.source];
        const targetNode = nodes.targets[flow.target];

        const flowHeight = (flow.value / sourceNode.value) * sourcePos.height;
        const targetFlowHeight = (flow.value / targetNode.value) * targetPos.height;

        const sy1 = sourcePos.y + sourceFlowY[flow.source];
        const sy2 = sy1 + flowHeight;
        const ty1 = targetPos.y + targetFlowY[flow.target];
        const ty2 = ty1 + targetFlowHeight;

        sourceFlowY[flow.source] += flowHeight;
        targetFlowY[flow.target] += targetFlowHeight;

        const isHover = hoverFlow === flow;

        // Draw curved flow
        ctx.beginPath();
        ctx.moveTo(leftX + nodeWidth, sy1);
        ctx.bezierCurveTo(
            canvas.width / 2, sy1,
            canvas.width / 2, ty1,
            rightX - nodeWidth, ty1
        );
        ctx.lineTo(rightX - nodeWidth, ty2);
        ctx.bezierCurveTo(
            canvas.width / 2, ty2,
            canvas.width / 2, sy2,
            leftX + nodeWidth, sy2
        );
        ctx.closePath();

        ctx.fillStyle = isHover ? `${sourceNode.color}cc` : `${sourceNode.color}66`;
        ctx.fill();
    });

    // Draw source nodes
    nodes.sources.forEach((node, i) => {
        const pos = sourcePositions[i];
        ctx.fillStyle = node.color;
        ctx.fillRect(leftX, pos.y, nodeWidth, pos.height);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(node.name, leftX - 5, pos.y + pos.height / 2 + 4);
    });

    // Draw target nodes
    nodes.targets.forEach((node, i) => {
        const pos = targetPositions[i];
        ctx.fillStyle = node.color;
        ctx.fillRect(rightX - nodeWidth, pos.y, nodeWidth, pos.height);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(node.name, rightX + 5, pos.y + pos.height / 2 + 4);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x > leftX + nodeWidth && x < rightX - nodeWidth) {
        hoverFlow = flows[Math.floor(Math.random() * flows.length)];
    } else {
        hoverFlow = null;
    }
    draw();
});

canvas.addEventListener('click', () => {
    infoEl.textContent = '點擊流動查看詳細數據';
});

draw();
