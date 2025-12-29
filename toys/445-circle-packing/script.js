const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const cx = canvas.width / 2;
const cy = canvas.height / 2 + 10;
const mainRadius = 120;

const data = {
    name: '世界',
    children: [
        { name: '亞洲', x: -35, y: -20, r: 55, color: '#e74c3c', children: [
            { name: '中國', x: -55, y: -35, r: 22 },
            { name: '日本', x: -20, y: -5, r: 18 },
            { name: '印度', x: -50, y: 10, r: 15 }
        ]},
        { name: '歐洲', x: 45, y: -25, r: 45, color: '#3498db', children: [
            { name: '英國', x: 30, y: -35, r: 15 },
            { name: '法國', x: 55, y: -15, r: 16 }
        ]},
        { name: '美洲', x: 10, y: 55, r: 50, color: '#2ecc71', children: [
            { name: '美國', x: -5, y: 40, r: 22 },
            { name: '巴西', x: 25, y: 70, r: 18 }
        ]}
    ]
};

let circles = [];
let hoverCircle = null;

function buildCircles() {
    circles = [];

    // Main circle
    circles.push({
        node: data,
        x: cx,
        y: cy,
        r: mainRadius,
        color: 'rgba(255,255,255,0.1)',
        depth: 0
    });

    // Child circles
    data.children.forEach(child => {
        circles.push({
            node: child,
            x: cx + child.x,
            y: cy + child.y,
            r: child.r,
            color: child.color,
            depth: 1
        });

        if (child.children) {
            child.children.forEach(grandchild => {
                circles.push({
                    node: grandchild,
                    x: cx + grandchild.x,
                    y: cy + grandchild.y,
                    r: grandchild.r,
                    color: child.color,
                    depth: 2
                });
            });
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('全球人口分布', canvas.width / 2, 25);

    circles.forEach(circle => {
        const isHover = hoverCircle === circle;

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);

        if (circle.depth === 0) {
            ctx.fillStyle = circle.color;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        } else if (circle.depth === 1) {
            ctx.fillStyle = isHover ? circle.color : `${circle.color}cc`;
            ctx.strokeStyle = '#fff';
        } else {
            ctx.fillStyle = isHover ? `${circle.color}ee` : `${circle.color}88`;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        }

        ctx.fill();
        ctx.lineWidth = isHover ? 3 : 1;
        ctx.stroke();

        // Label
        if (circle.r > 12) {
            ctx.fillStyle = '#fff';
            ctx.font = circle.depth === 1 ? 'bold 11px Arial' : '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(circle.node.name, circle.x, circle.y + 4);
        }
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverCircle = null;
    // Check in reverse to get topmost circle
    for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i];
        const dist = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2);
        if (dist <= c.r) {
            hoverCircle = c;
            break;
        }
    }

    canvas.style.cursor = hoverCircle && hoverCircle.depth > 0 ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverCircle && hoverCircle.depth > 0) {
        const depthName = hoverCircle.depth === 1 ? '洲' : '國家';
        infoEl.textContent = `${hoverCircle.node.name} (${depthName}層級)`;
    }
});

buildCircles();
draw();
