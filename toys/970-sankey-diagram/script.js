const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const leftNodes = ['來源A', '來源B', '來源C'];
const rightNodes = ['目標1', '目標2', '目標3', '目標4'];
const colors = ['#4DB6AC', '#81C784', '#64B5F6', '#BA68C8'];

let flows = [];
let targetFlows = [];

function randomize() {
    targetFlows = [];
    leftNodes.forEach((source, si) => {
        rightNodes.forEach((target, ti) => {
            if (Math.random() > 0.3) {
                targetFlows.push({
                    source: si,
                    target: ti,
                    value: Math.random() * 40 + 10
                });
            }
        });
    });
}

function init() {
    flows = [];
    leftNodes.forEach((source, si) => {
        rightNodes.forEach((target, ti) => {
            flows.push({
                source: si,
                target: ti,
                value: 0
            });
        });
    });
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    flows.forEach(flow => {
        const target = targetFlows.find(f => f.source === flow.source && f.target === flow.target);
        flow.value = lerp(flow.value, target ? target.value : 0, 0.1);
    });
}

function draw() {
    ctx.fillStyle = '#0a1515';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 60, right: 60, top: 30, bottom: 30 };
    const nodeWidth = 20;

    const leftTotal = leftNodes.map((_, i) =>
        flows.filter(f => f.source === i).reduce((a, f) => a + f.value, 0)
    );
    const rightTotal = rightNodes.map((_, i) =>
        flows.filter(f => f.target === i).reduce((a, f) => a + f.value, 0)
    );

    const leftHeight = canvas.height - padding.top - padding.bottom;
    const rightHeight = canvas.height - padding.top - padding.bottom;

    const leftScale = leftHeight / Math.max(...leftTotal, 1);
    const rightScale = rightHeight / Math.max(...rightTotal, 1);
    const scale = Math.min(leftScale, rightScale, 3);

    let leftY = [];
    let currentY = padding.top;
    leftNodes.forEach((_, i) => {
        leftY[i] = currentY;
        currentY += leftTotal[i] * scale + 15;
    });

    let rightY = [];
    currentY = padding.top;
    rightNodes.forEach((_, i) => {
        rightY[i] = currentY;
        currentY += rightTotal[i] * scale + 10;
    });

    let leftOffset = leftNodes.map(() => 0);
    let rightOffset = rightNodes.map(() => 0);

    flows.forEach(flow => {
        if (flow.value < 0.5) return;

        const height = flow.value * scale;
        const x1 = padding.left + nodeWidth;
        const y1 = leftY[flow.source] + leftOffset[flow.source];
        const x2 = canvas.width - padding.right - nodeWidth;
        const y2 = rightY[flow.target] + rightOffset[flow.target];

        const gradient = ctx.createLinearGradient(x1, 0, x2, 0);
        gradient.addColorStop(0, colors[flow.source] + '80');
        gradient.addColorStop(1, colors[flow.target] + '80');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
            x1 + (x2 - x1) / 3, y1,
            x2 - (x2 - x1) / 3, y2,
            x2, y2
        );
        ctx.lineTo(x2, y2 + height);
        ctx.bezierCurveTo(
            x2 - (x2 - x1) / 3, y2 + height,
            x1 + (x2 - x1) / 3, y1 + height,
            x1, y1 + height
        );
        ctx.closePath();
        ctx.fill();

        leftOffset[flow.source] += height;
        rightOffset[flow.target] += height;
    });

    leftNodes.forEach((name, i) => {
        const height = leftTotal[i] * scale;
        if (height < 1) return;

        ctx.fillStyle = colors[i];
        ctx.fillRect(padding.left, leftY[i], nodeWidth, height);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(name, padding.left - 5, leftY[i] + height / 2 + 3);
    });

    rightNodes.forEach((name, i) => {
        const height = rightTotal[i] * scale;
        if (height < 1) return;

        ctx.fillStyle = colors[i];
        ctx.fillRect(canvas.width - padding.right - nodeWidth, rightY[i], nodeWidth, height);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(name, canvas.width - padding.right + 5, rightY[i] + height / 2 + 3);
    });
}

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
