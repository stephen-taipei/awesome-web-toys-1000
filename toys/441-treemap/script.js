const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const data = {
    name: '總支出',
    children: [
        { name: '生活', value: 35, color: '#e74c3c', children: [
            { name: '食品', value: 20 },
            { name: '日用', value: 15 }
        ]},
        { name: '交通', value: 20, color: '#3498db', children: [
            { name: '捷運', value: 12 },
            { name: '計程車', value: 8 }
        ]},
        { name: '娛樂', value: 25, color: '#2ecc71', children: [
            { name: '電影', value: 10 },
            { name: '遊戲', value: 15 }
        ]},
        { name: '儲蓄', value: 20, color: '#f39c12' }
    ]
};

let hoverRect = null;

function squarify(data, x, y, width, height) {
    const totalValue = data.reduce((sum, d) => sum + (d.value || sumValues(d)), 0);
    const rects = [];
    let currentX = x;
    let currentY = y;
    let remainingWidth = width;
    let remainingHeight = height;

    data.forEach(d => {
        const value = d.value || sumValues(d);
        const ratio = value / totalValue;
        let rectWidth, rectHeight;

        if (remainingWidth > remainingHeight) {
            rectWidth = remainingWidth * ratio;
            rectHeight = remainingHeight;
            rects.push({ ...d, x: currentX, y: currentY, width: rectWidth, height: rectHeight });
            currentX += rectWidth;
            remainingWidth -= rectWidth;
        } else {
            rectWidth = remainingWidth;
            rectHeight = remainingHeight * ratio;
            rects.push({ ...d, x: currentX, y: currentY, width: rectWidth, height: rectHeight });
            currentY += rectHeight;
            remainingHeight -= rectHeight;
        }
    });

    return rects;
}

function sumValues(node) {
    if (node.value) return node.value;
    return node.children.reduce((sum, child) => sum + sumValues(child), 0);
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = 20;
    const rects = squarify(data.children, padding, 40, canvas.width - padding * 2, canvas.height - 70);

    rects.forEach(rect => {
        const isHover = hoverRect === rect;

        // Main rect
        ctx.fillStyle = rect.color || '#666';
        ctx.strokeStyle = isHover ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isHover ? 3 : 1;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 4);
        ctx.fill();
        ctx.stroke();

        // Children rects (nested)
        if (rect.children && rect.width > 60 && rect.height > 40) {
            const childPadding = 4;
            const childRects = squarify(
                rect.children,
                rect.x + childPadding,
                rect.y + 25,
                rect.width - childPadding * 2,
                rect.height - 30
            );

            childRects.forEach(child => {
                ctx.fillStyle = `${rect.color}88`;
                ctx.beginPath();
                ctx.roundRect(child.x, child.y, child.width, child.height, 2);
                ctx.fill();

                if (child.width > 40 && child.height > 20) {
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.font = '9px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(child.name, child.x + child.width / 2, child.y + child.height / 2 + 3);
                }
            });
        }

        // Label
        if (rect.width > 50) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(rect.name, rect.x + rect.width / 2, rect.y + 15);

            const value = rect.value || sumValues(rect);
            ctx.font = '10px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(`${value}%`, rect.x + rect.width / 2, rect.y + rect.height - 8);
        }
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('月度支出分布', canvas.width / 2, 25);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 20;
    const rects = squarify(data.children, padding, 40, canvas.width - padding * 2, canvas.height - 70);

    hoverRect = null;
    for (const r of rects) {
        if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
            hoverRect = r;
            break;
        }
    }

    canvas.style.cursor = hoverRect ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverRect) {
        const value = hoverRect.value || sumValues(hoverRect);
        infoEl.textContent = `${hoverRect.name}: 佔比 ${value}%`;
    }
});

draw();
