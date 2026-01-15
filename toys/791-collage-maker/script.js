const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let layout = 4;
let colors = [];

function randomColor() {
    return `hsl(${Math.random() * 360}, ${50 + Math.random() * 30}%, ${40 + Math.random() * 30}%)`;
}

function generateColors(count) {
    colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(randomColor());
    }
}

function drawPattern(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;

    const pattern = Math.floor(Math.random() * 4);

    if (pattern === 0) {
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(x + Math.random() * w, y + Math.random() * h, 5 + Math.random() * 15, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else if (pattern === 1) {
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(x + Math.random() * w, y + Math.random() * h);
            ctx.lineTo(x + Math.random() * w, y + Math.random() * h);
            ctx.stroke();
        }
    } else if (pattern === 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(x + w/2, y + 10);
        ctx.lineTo(x + w - 10, y + h - 10);
        ctx.lineTo(x + 10, y + h - 10);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6);
    }
}

function drawCollage() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gap = 4;
    const w = canvas.width;
    const h = canvas.height;

    if (layout === 2) {
        generateColors(2);
        drawPattern(gap, gap, w/2 - gap*1.5, h - gap*2, colors[0]);
        drawPattern(w/2 + gap/2, gap, w/2 - gap*1.5, h - gap*2, colors[1]);
    } else if (layout === 4) {
        generateColors(4);
        const cellW = (w - gap*3) / 2;
        const cellH = (h - gap*3) / 2;
        drawPattern(gap, gap, cellW, cellH, colors[0]);
        drawPattern(cellW + gap*2, gap, cellW, cellH, colors[1]);
        drawPattern(gap, cellH + gap*2, cellW, cellH, colors[2]);
        drawPattern(cellW + gap*2, cellH + gap*2, cellW, cellH, colors[3]);
    } else {
        generateColors(6);
        const cellW = (w - gap*4) / 3;
        const cellH = (h - gap*3) / 2;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                drawPattern(
                    gap + col * (cellW + gap),
                    gap + row * (cellH + gap),
                    cellW, cellH,
                    colors[row * 3 + col]
                );
            }
        }
    }
}

document.getElementById('layout1').addEventListener('click', () => {
    layout = 2;
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    document.getElementById('layout1').classList.add('active');
    drawCollage();
});

document.getElementById('layout2').addEventListener('click', () => {
    layout = 4;
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    document.getElementById('layout2').classList.add('active');
    drawCollage();
});

document.getElementById('layout3').addEventListener('click', () => {
    layout = 6;
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    document.getElementById('layout3').classList.add('active');
    drawCollage();
});

document.getElementById('shuffle').addEventListener('click', drawCollage);

drawCollage();
