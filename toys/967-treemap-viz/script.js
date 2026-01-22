const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const categories = ['科技', '金融', '醫療', '能源', '消費', '工業'];
const colors = ['#BA68C8', '#7E57C2', '#5C6BC0', '#42A5F5', '#26C6DA', '#26A69A'];

let data = [];
let rects = [];
let hoveredRect = -1;

function randomize() {
    data = categories.map((name, i) => ({
        name,
        value: Math.random() * 80 + 20,
        color: colors[i]
    }));
    computeTreemap();
}

function computeTreemap() {
    const padding = 15;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const total = data.reduce((a, b) => a + b.value, 0);

    rects = [];
    let x = padding;
    let y = padding;
    let remainingWidth = width;
    let remainingHeight = height;

    const sorted = [...data].sort((a, b) => b.value - a.value);

    sorted.forEach((item, i) => {
        const ratio = item.value / total;
        const isVertical = remainingWidth > remainingHeight;

        let rectWidth, rectHeight;

        if (isVertical) {
            rectWidth = remainingWidth * ratio * 2;
            if (rectWidth > remainingWidth) rectWidth = remainingWidth;
            rectHeight = remainingHeight;

            if (i === sorted.length - 1) rectWidth = remainingWidth;

            rects.push({
                x, y,
                width: rectWidth - 2,
                height: rectHeight - 2,
                ...item
            });

            x += rectWidth;
            remainingWidth -= rectWidth;
        } else {
            rectWidth = remainingWidth;
            rectHeight = remainingHeight * ratio * 2;
            if (rectHeight > remainingHeight) rectHeight = remainingHeight;

            if (i === sorted.length - 1) rectHeight = remainingHeight;

            rects.push({
                x, y,
                width: rectWidth - 2,
                height: rectHeight - 2,
                ...item
            });

            y += rectHeight;
            remainingHeight -= rectHeight;
        }
    });
}

function draw() {
    ctx.fillStyle = '#150a20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rects.forEach((rect, i) => {
        const isHovered = hoveredRect === i;

        ctx.fillStyle = rect.color;
        ctx.globalAlpha = isHovered ? 1 : 0.8;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

        if (isHovered) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }

        ctx.globalAlpha = 1;

        if (rect.width > 40 && rect.height > 30) {
            ctx.fillStyle = '#fff';
            ctx.font = isHovered ? 'bold 12px Arial' : '11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rect.name, rect.x + rect.width / 2, rect.y + rect.height / 2 - 8);
            ctx.font = '10px Arial';
            ctx.fillText(Math.round(rect.value), rect.x + rect.width / 2, rect.y + rect.height / 2 + 8);
        }
    });
}

canvas.addEventListener('mousemove', (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    const mx = (e.clientX - canvasRect.left) * (canvas.width / canvasRect.width);
    const my = (e.clientY - canvasRect.top) * (canvas.height / canvasRect.height);

    hoveredRect = -1;
    rects.forEach((rect, i) => {
        if (mx >= rect.x && mx <= rect.x + rect.width &&
            my >= rect.y && my <= rect.y + rect.height) {
            hoveredRect = i;
        }
    });
});

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    draw();
    requestAnimationFrame(animate);
}

randomize();
animate();
