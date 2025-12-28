const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const data = {
    name: '公司',
    value: 100,
    children: [
        { name: '研發部', value: 40, color: '#e74c3c', children: [
            { name: '前端組', value: 15 },
            { name: '後端組', value: 15 },
            { name: '測試組', value: 10 }
        ]},
        { name: '行銷部', value: 30, color: '#3498db', children: [
            { name: '廣告組', value: 18 },
            { name: '品牌組', value: 12 }
        ]},
        { name: '營運部', value: 30, color: '#2ecc71', children: [
            { name: '客服組', value: 15 },
            { name: '物流組', value: 15 }
        ]}
    ]
};

const chartLeft = 20;
const chartWidth = canvas.width - 40;
const rowHeight = 50;
let rects = [];
let hoverRect = null;

function layout(node, x, width, depth, parentColor) {
    const color = node.color || parentColor || '#666';
    const rect = {
        node,
        x,
        y: 40 + depth * rowHeight,
        width,
        height: rowHeight - 4,
        color,
        depth
    };
    rects.push(rect);

    if (node.children) {
        const total = node.children.reduce((sum, c) => sum + c.value, 0);
        let currentX = x;
        node.children.forEach(child => {
            const childWidth = (child.value / total) * width;
            layout(child, currentX, childWidth, depth + 1, color);
            currentX += childWidth;
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rects = [];
    layout(data, chartLeft, chartWidth, 0);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('組織架構圖 (冰柱圖)', canvas.width / 2, 25);

    // Draw rects
    rects.forEach(rect => {
        const isHover = hoverRect === rect;
        const alpha = 1 - rect.depth * 0.15;

        ctx.fillStyle = isHover ? adjustBrightness(rect.color, 30) : rect.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.roundRect(rect.x + 1, rect.y, rect.width - 2, rect.height, 4);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isHover) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Label
        if (rect.width > 35) {
            ctx.fillStyle = '#fff';
            ctx.font = rect.width > 60 ? 'bold 11px Arial' : '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(rect.node.name, rect.x + rect.width / 2, rect.y + rect.height / 2 - 5);
            ctx.font = '9px Arial';
            ctx.fillText(`${rect.node.value}%`, rect.x + rect.width / 2, rect.y + rect.height / 2 + 10);
        }
    });

    // Depth labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    const depths = ['層級 1', '層級 2', '層級 3'];
    depths.forEach((label, i) => {
        if (40 + i * rowHeight < canvas.height - 30) {
            ctx.fillText(label, 5, 40 + i * rowHeight + rowHeight / 2 + 3);
        }
    });
}

function adjustBrightness(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r}, ${g}, ${b})`;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverRect = null;
    for (const r of rects) {
        if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
            hoverRect = r;
        }
    }

    canvas.style.cursor = hoverRect ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverRect) {
        infoEl.textContent = `${hoverRect.node.name}: ${hoverRect.node.value}% (層級 ${hoverRect.depth + 1})`;
    }
});

draw();
