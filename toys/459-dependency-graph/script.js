const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const modules = [
    { name: 'App', x: 180, y: 50, level: 0 },
    { name: 'Router', x: 80, y: 120, level: 1 },
    { name: 'Store', x: 180, y: 120, level: 1 },
    { name: 'API', x: 280, y: 120, level: 1 },
    { name: 'Utils', x: 130, y: 200, level: 2 },
    { name: 'Auth', x: 230, y: 200, level: 2 },
    { name: 'Logger', x: 180, y: 270, level: 3 }
];

const dependencies = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 }
];

const nodeRadius = 30;
const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'];
let hoverNode = null;

function drawArrow(fromX, fromY, toX, toY, highlight) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const startX = fromX + Math.cos(angle) * nodeRadius;
    const startY = fromY + Math.sin(angle) * nodeRadius;
    const endX = toX - Math.cos(angle) * (nodeRadius + 8);
    const endY = toY - Math.sin(angle) * (nodeRadius + 8);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = highlight ? '#fff' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = highlight ? 3 : 2;
    ctx.stroke();

    // Arrow head
    const headLen = 10;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = highlight ? '#fff' : 'rgba(255,255,255,0.4)';
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('模組依賴關係圖', canvas.width / 2, 25);

    // Draw dependencies
    dependencies.forEach(dep => {
        const from = modules[dep.from];
        const to = modules[dep.to];
        const highlight = hoverNode === dep.from || hoverNode === dep.to;
        drawArrow(from.x, from.y, to.x, to.y, highlight);
    });

    // Draw modules
    modules.forEach((module, i) => {
        const isHover = hoverNode === i;
        const color = colors[module.level];

        ctx.beginPath();
        ctx.arc(module.x, module.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? color : `${color}cc`;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = isHover ? 4 : 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(module.name, module.x, module.y + 4);
    });

    // Legend
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ['入口', '核心', '服務', '基礎'].forEach((label, i) => {
        ctx.fillStyle = colors[i];
        ctx.fillRect(20 + i * 80, canvas.height - 18, 10, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(label, 33 + i * 80, canvas.height - 9);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverNode = null;
    modules.forEach((module, i) => {
        if (Math.sqrt((x - module.x) ** 2 + (y - module.y) ** 2) < nodeRadius) {
            hoverNode = i;
        }
    });

    canvas.style.cursor = hoverNode !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverNode !== null) {
        const module = modules[hoverNode];
        const deps = dependencies.filter(d => d.from === hoverNode).map(d => modules[d.to].name);
        const dependents = dependencies.filter(d => d.to === hoverNode).map(d => modules[d.from].name);
        infoEl.textContent = `${module.name}: 依賴 [${deps.join(', ') || '無'}]，被 [${dependents.join(', ') || '無'}] 依賴`;
    }
});

draw();
