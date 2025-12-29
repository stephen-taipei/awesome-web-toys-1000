const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const breadcrumbEl = document.getElementById('breadcrumb');
const infoEl = document.getElementById('info');

const hierarchyData = {
    name: '全部',
    value: 1000,
    children: [
        {
            name: '電子產品',
            value: 450,
            children: [
                { name: '手機', value: 200 },
                { name: '電腦', value: 150 },
                { name: '平板', value: 100 }
            ]
        },
        {
            name: '服飾',
            value: 300,
            children: [
                { name: '上衣', value: 120 },
                { name: '褲子', value: 100 },
                { name: '配件', value: 80 }
            ]
        },
        {
            name: '食品',
            value: 250,
            children: [
                { name: '零食', value: 100 },
                { name: '飲料', value: 90 },
                { name: '生鮮', value: 60 }
            ]
        }
    ]
};

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
let currentLevel = hierarchyData;
let path = [hierarchyData];
let slices = [];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    slices = [];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;
    const radius = 100;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentLevel.name, cx, 25);

    if (!currentLevel.children) {
        // Leaf node - show single value
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[0];
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(currentLevel.value, cx, cy);
        ctx.font = '12px Arial';
        ctx.fillText('銷售額', cx, cy + 25);

        infoEl.textContent = '已達最底層，點擊麵包屑返回';
        return;
    }

    const total = currentLevel.children.reduce((s, c) => s + c.value, 0);
    let startAngle = -Math.PI / 2;

    currentLevel.children.forEach((child, i) => {
        const pct = child.value / total;
        const endAngle = startAngle + pct * Math.PI * 2;

        slices.push({
            data: child,
            startAngle,
            endAngle
        });

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = radius * 0.65;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(child.name, cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR);
        ctx.font = '10px Arial';
        ctx.fillText(child.value, cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR + 14);

        startAngle = endAngle;
    });

    // Legend
    const legendY = canvas.height - 35;
    currentLevel.children.forEach((child, i) => {
        const x = 30 + i * 115;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, legendY, 12, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${child.name} (${(child.value / total * 100).toFixed(0)}%)`, x + 16, legendY + 10);
    });

    infoEl.textContent = child ? '點擊區塊深入查看' : '已達最底層';
}

function updateBreadcrumb() {
    breadcrumbEl.innerHTML = path.map((p, i) =>
        `<span data-index="${i}">${p.name}</span>`
    ).join(' > ');

    breadcrumbEl.querySelectorAll('span').forEach(span => {
        span.addEventListener('click', () => {
            const index = parseInt(span.dataset.index);
            path = path.slice(0, index + 1);
            currentLevel = path[path.length - 1];
            updateBreadcrumb();
            draw();
        });
    });
}

canvas.addEventListener('click', (e) => {
    if (!currentLevel.children) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 100) return;

    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) angle += Math.PI * 2;

    for (const slice of slices) {
        if (angle >= slice.startAngle && angle < slice.endAngle) {
            currentLevel = slice.data;
            path.push(currentLevel);
            updateBreadcrumb();
            draw();
            break;
        }
    }
});

updateBreadcrumb();
draw();
