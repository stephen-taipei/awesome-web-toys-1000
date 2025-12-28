const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const periods = ['2020', '2022', '2024'];
const categories = {
    2020: [
        { name: '初學者', value: 100, color: '#3498db' },
        { name: '進階者', value: 60, color: '#2ecc71' },
        { name: '專家', value: 40, color: '#e74c3c' }
    ],
    2022: [
        { name: '初學者', value: 70, color: '#3498db' },
        { name: '進階者', value: 90, color: '#2ecc71' },
        { name: '專家', value: 60, color: '#e74c3c' }
    ],
    2024: [
        { name: '初學者', value: 50, color: '#3498db' },
        { name: '進階者', value: 80, color: '#2ecc71' },
        { name: '專家', value: 90, color: '#e74c3c' }
    ]
};

const flows = [
    { from: [0, 0], to: [1, 0], value: 40 },
    { from: [0, 0], to: [1, 1], value: 60 },
    { from: [0, 1], to: [1, 1], value: 30 },
    { from: [0, 1], to: [1, 2], value: 30 },
    { from: [0, 2], to: [1, 2], value: 40 },
    { from: [1, 0], to: [2, 0], value: 30 },
    { from: [1, 0], to: [2, 1], value: 40 },
    { from: [1, 1], to: [2, 1], value: 40 },
    { from: [1, 1], to: [2, 2], value: 50 },
    { from: [1, 2], to: [2, 2], value: 40 }
];

const chartLeft = 40;
const chartRight = canvas.width - 40;
const chartTop = 60;
const chartBottom = canvas.height - 40;
const columnWidth = 30;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('學習者程度變化', canvas.width / 2, 25);

    const columnSpacing = (chartRight - chartLeft - columnWidth * 3) / 2;
    const columnPositions = [
        chartLeft,
        chartLeft + columnWidth + columnSpacing,
        chartLeft + 2 * (columnWidth + columnSpacing)
    ];

    // Calculate node positions
    const nodePositions = {};
    periods.forEach((period, pi) => {
        const cats = categories[period];
        const total = cats.reduce((a, b) => a + b.value, 0);
        let currentY = chartTop;

        cats.forEach((cat, ci) => {
            const height = (cat.value / total) * (chartBottom - chartTop - 20);
            nodePositions[`${pi}-${ci}`] = {
                x: columnPositions[pi],
                y: currentY,
                height,
                color: cat.color
            };
            currentY += height + 10;
        });
    });

    // Draw flows
    flows.forEach(flow => {
        const fromKey = `${flow.from[0]}-${flow.from[1]}`;
        const toKey = `${flow.to[0]}-${flow.to[1]}`;
        const fromNode = nodePositions[fromKey];
        const toNode = nodePositions[toKey];

        const flowHeight = flow.value * 0.5;

        ctx.beginPath();
        ctx.moveTo(fromNode.x + columnWidth, fromNode.y);
        ctx.bezierCurveTo(
            fromNode.x + columnWidth + columnSpacing / 2, fromNode.y,
            toNode.x - columnSpacing / 2, toNode.y,
            toNode.x, toNode.y
        );
        ctx.lineTo(toNode.x, toNode.y + flowHeight);
        ctx.bezierCurveTo(
            toNode.x - columnSpacing / 2, toNode.y + flowHeight,
            fromNode.x + columnWidth + columnSpacing / 2, fromNode.y + flowHeight,
            fromNode.x + columnWidth, fromNode.y + flowHeight
        );
        ctx.closePath();

        ctx.fillStyle = `${fromNode.color}55`;
        ctx.fill();
    });

    // Draw nodes
    Object.entries(nodePositions).forEach(([key, node]) => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(node.x, node.y, columnWidth, node.height, 4);
        ctx.fill();
    });

    // Period labels
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    periods.forEach((period, i) => {
        ctx.fillText(period, columnPositions[i] + columnWidth / 2, chartTop - 15);
    });

    // Legend
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    categories[2020].forEach((cat, i) => {
        ctx.fillStyle = cat.color;
        ctx.fillRect(30 + i * 100, canvas.height - 25, 12, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(cat.name, 45 + i * 100, canvas.height - 15);
    });
}

draw();
infoEl.textContent = '顯示學習者程度隨時間的轉變';
