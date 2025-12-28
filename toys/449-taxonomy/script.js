const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const taxonomy = {
    rank: '界',
    name: '動物界',
    latin: 'Animalia',
    children: [
        { rank: '門', name: '脊索動物門', latin: 'Chordata', children: [
            { rank: '綱', name: '哺乳綱', latin: 'Mammalia', children: [
                { rank: '目', name: '靈長目', latin: 'Primates', children: [
                    { rank: '科', name: '人科', latin: 'Hominidae' }
                ]},
                { rank: '目', name: '食肉目', latin: 'Carnivora', children: [
                    { rank: '科', name: '貓科', latin: 'Felidae' }
                ]}
            ]}
        ]}
    ]
};

const levelColors = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'];
const rowHeight = 45;
let items = [];
let hoverItem = null;

function flattenTaxonomy(node, depth = 0) {
    const result = [{ node, depth }];
    if (node.children) {
        node.children.forEach(child => {
            result.push(...flattenTaxonomy(child, depth + 1));
        });
    }
    return result;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('生物分類階層', canvas.width / 2, 25);

    items = flattenTaxonomy(taxonomy);

    items.forEach((item, i) => {
        const y = 50 + i * rowHeight;
        item.y = y;

        const isHover = hoverItem === item;
        const color = levelColors[item.depth % levelColors.length];
        const indentX = 30 + item.depth * 25;

        // Connection line
        if (item.depth > 0) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(indentX - 15, y - rowHeight + 15);
            ctx.lineTo(indentX - 15, y);
            ctx.lineTo(indentX - 5, y);
            ctx.stroke();
        }

        // Badge
        ctx.fillStyle = isHover ? color : `${color}cc`;
        ctx.beginPath();
        ctx.roundRect(indentX, y - 15, canvas.width - indentX - 30, 35, 8);
        ctx.fill();

        if (isHover) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Rank badge
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(indentX + 5, y - 10, 25, 25, 4);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.node.rank, indentX + 17, y + 5);

        // Names
        ctx.textAlign = 'left';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(item.node.name, indentX + 38, y - 1);
        ctx.font = 'italic 10px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(item.node.latin, indentX + 38, y + 13);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    hoverItem = null;
    for (const item of items) {
        if (y >= item.y - 15 && y < item.y + 25) {
            hoverItem = item;
            break;
        }
    }

    canvas.style.cursor = hoverItem ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverItem) {
        infoEl.textContent = `${hoverItem.node.rank}: ${hoverItem.node.name} (${hoverItem.node.latin})`;
    }
});

draw();
