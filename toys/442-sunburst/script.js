const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const data = {
    name: '全部',
    children: [
        { name: '科技', value: 40, color: '#3498db', children: [
            { name: '軟體', value: 25, children: [
                { name: 'Web', value: 15 },
                { name: 'App', value: 10 }
            ]},
            { name: '硬體', value: 15 }
        ]},
        { name: '金融', value: 30, color: '#2ecc71', children: [
            { name: '銀行', value: 18 },
            { name: '保險', value: 12 }
        ]},
        { name: '醫療', value: 30, color: '#e74c3c', children: [
            { name: '醫院', value: 20 },
            { name: '藥品', value: 10 }
        ]}
    ]
};

const cx = canvas.width / 2;
const cy = canvas.height / 2 + 10;
const innerRadius = 30;
const ringWidth = 40;

let hoveredArc = null;
let arcs = [];

function getDescendants(node, depth = 0, startAngle = 0, endAngle = Math.PI * 2, parentColor = null) {
    const result = [];
    const color = node.color || parentColor || '#666';

    if (depth > 0) {
        result.push({
            node,
            depth,
            startAngle,
            endAngle,
            color
        });
    }

    if (node.children) {
        const total = node.children.reduce((sum, c) => sum + (c.value || getTotal(c)), 0);
        let currentAngle = startAngle;

        node.children.forEach(child => {
            const value = child.value || getTotal(child);
            const angle = (value / total) * (endAngle - startAngle);
            result.push(...getDescendants(child, depth + 1, currentAngle, currentAngle + angle, child.color || color));
            currentAngle += angle;
        });
    }

    return result;
}

function getTotal(node) {
    if (node.value) return node.value;
    return node.children.reduce((sum, c) => sum + getTotal(c), 0);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('產業投資分布', cx, 25);

    arcs = getDescendants(data);

    arcs.forEach(arc => {
        const isHover = hoveredArc === arc;
        const r1 = innerRadius + (arc.depth - 1) * ringWidth;
        const r2 = r1 + ringWidth - 2;

        ctx.beginPath();
        ctx.arc(cx, cy, r1, arc.startAngle - Math.PI / 2, arc.endAngle - Math.PI / 2);
        ctx.arc(cx, cy, r2, arc.endAngle - Math.PI / 2, arc.startAngle - Math.PI / 2, true);
        ctx.closePath();

        const lightness = isHover ? 0.2 : 0;
        ctx.fillStyle = adjustColor(arc.color, lightness);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        const midAngle = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2;
        const midR = (r1 + r2) / 2;
        const arcSpan = arc.endAngle - arc.startAngle;

        if (arcSpan > 0.3) {
            ctx.save();
            ctx.translate(cx + Math.cos(midAngle) * midR, cy + Math.sin(midAngle) * midR);
            ctx.rotate(midAngle + Math.PI / 2);
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(arc.node.name, 0, 4);
            ctx.restore();
        }
    });

    // Center
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('全部', cx, cy + 4);
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount * 255);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount * 255);
    const b = Math.min(255, (num & 0xff) + amount * 255);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function isInArc(x, y, arc) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r1 = innerRadius + (arc.depth - 1) * ringWidth;
    const r2 = r1 + ringWidth;

    if (dist < r1 || dist > r2) return false;

    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    return angle >= arc.startAngle && angle <= arc.endAngle;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoveredArc = null;
    for (const arc of arcs) {
        if (isInArc(x, y, arc)) {
            hoveredArc = arc;
            break;
        }
    }

    canvas.style.cursor = hoveredArc ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoveredArc) {
        const value = hoveredArc.node.value || getTotal(hoveredArc.node);
        infoEl.textContent = `${hoveredArc.node.name}: ${value}%`;
    }
});

draw();
