const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

let mode = 'triangle';
const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4'];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawTriangles() {
    const size = 40;
    const h = size * Math.sqrt(3) / 2;

    for (let row = 0; row < canvas.height / h + 1; row++) {
        for (let col = 0; col < canvas.width / size + 1; col++) {
            const x = col * size + (row % 2) * (size / 2);
            const y = row * h;

            // Up triangle
            ctx.fillStyle = randomColor();
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + size / 2, y);
            ctx.lineTo(x + size, y + h);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            // Down triangle
            ctx.fillStyle = randomColor();
            ctx.beginPath();
            ctx.moveTo(x + size / 2, y);
            ctx.lineTo(x + size, y + h);
            ctx.lineTo(x + size * 1.5, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawSquares() {
    const size = 40;

    for (let row = 0; row < canvas.height / size; row++) {
        for (let col = 0; col < canvas.width / size; col++) {
            ctx.fillStyle = randomColor();
            ctx.fillRect(col * size, row * size, size, size);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(col * size, row * size, size, size);
        }
    }
}

function drawHexagons() {
    const size = 25;
    const w = size * 2;
    const h = size * Math.sqrt(3);

    for (let row = 0; row < canvas.height / h + 1; row++) {
        for (let col = 0; col < canvas.width / (w * 0.75) + 1; col++) {
            const x = col * w * 0.75;
            const y = row * h + (col % 2) * (h / 2);

            ctx.fillStyle = randomColor();
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }
    }
}

function generate() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mode === 'triangle') drawTriangles();
    else if (mode === 'square') drawSquares();
    else drawHexagons();
}

document.querySelectorAll('.controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.id;
        generate();
    });
});

document.getElementById('generateBtn').addEventListener('click', generate);

generate();
