const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let strokes = [];
let stones = [];

function init() {
    strokes = [];
    stones = [];

    for (let i = 0; i < 5; i++) {
        stones.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            size: Math.random() * 20 + 15,
            color: `hsl(${Math.random() * 30 + 20}, 20%, ${Math.random() * 20 + 30}%)`
        });
    }
}

function drawSand() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#C4A35A');
    gradient.addColorStop(0.5, '#D4B36A');
    gradient.addColorStop(1, '#C4A35A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(180, 150, 80, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
        const x1 = Math.random() * canvas.width;
        const y1 = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.random() * 5, y1 + Math.random() * 2);
        ctx.stroke();
    }
}

function drawRakeLines() {
    ctx.strokeStyle = 'rgba(160, 130, 60, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
        if (stroke.points.length < 2) return;

        for (let offset = -4; offset <= 4; offset += 2) {
            ctx.beginPath();
            stroke.points.forEach((point, i) => {
                const x = point.x + offset;
                const y = point.y;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }
    });
}

function drawStones() {
    stones.forEach(stone => {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, stone.size, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
            stone.x - stone.size * 0.3, stone.y - stone.size * 0.3, 0,
            stone.x, stone.y, stone.size
        );
        gradient.addColorStop(0, 'rgba(100, 100, 100, 0.8)');
        gradient.addColorStop(0.7, stone.color);
        gradient.addColorStop(1, 'rgba(50, 50, 50, 0.9)');

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(stone.x, stone.y + stone.size * 0.1, stone.size * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();

        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(stone.x, stone.y, stone.size + i * 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(160, 130, 60, ${0.4 - i * 0.1})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function draw() {
    drawSand();
    drawRakeLines();
    drawStones();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function isNearStone(x, y) {
    return stones.some(stone => {
        const dx = x - stone.x;
        const dy = y - stone.y;
        return Math.sqrt(dx * dx + dy * dy) < stone.size + 10;
    });
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    if (!isNearStone(pos.x, pos.y)) {
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;
        strokes.push({ points: [{ x: lastX, y: lastY }] });
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (isNearStone(pos.x, pos.y)) {
        isDrawing = false;
        return;
    }

    const currentStroke = strokes[strokes.length - 1];
    currentStroke.points.push({ x: pos.x, y: pos.y });

    lastX = pos.x;
    lastY = pos.y;

    draw();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    init();
    draw();
});

init();
draw();
