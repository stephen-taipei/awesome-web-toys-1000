const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let step = 0;
const maxSteps = 12;
let time = 0;

function nextStep() {
    step = (step + 1) % maxSteps;
    if (step === 0) step = 1;
}

function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

function draw() {
    ctx.fillStyle = '#0a150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 8;
    let x = canvas.width / 2 + 50;
    let y = canvas.height / 2 + 30;

    for (let i = 0; i < step; i++) {
        const size = fibonacci(i + 1) * scale;
        const hue = 80 + i * 20;

        ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.8)`;
        ctx.fillStyle = `hsla(${hue}, 60%, 30%, 0.3)`;
        ctx.lineWidth = 2;

        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);

        ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();

        const direction = i % 4;
        let startAngle, endAngle, cx, cy;

        switch (direction) {
            case 0:
                cx = x + size; cy = y + size;
                startAngle = Math.PI; endAngle = Math.PI * 1.5;
                x -= fibonacci(i + 2) * scale;
                break;
            case 1:
                cx = x + size; cy = y;
                startAngle = Math.PI * 0.5; endAngle = Math.PI;
                y -= fibonacci(i + 2) * scale;
                break;
            case 2:
                cx = x; cy = y;
                startAngle = 0; endAngle = Math.PI * 0.5;
                x += size;
                break;
            case 3:
                cx = x; cy = y + size;
                startAngle = Math.PI * 1.5; endAngle = Math.PI * 2;
                y += size;
                break;
        }

        ctx.arc(cx, cy, size, startAngle, endAngle);
        ctx.stroke();
    }

    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 50);

    ctx.fillStyle = '#8BC34A';
    ctx.font = '11px Arial';
    ctx.fillText(`步驟: ${step}`, 20, 28);

    let seq = '';
    for (let i = 1; i <= Math.min(step, 8); i++) {
        seq += fibonacci(i) + ' ';
    }
    ctx.fillText(`數列: ${seq}`, 20, 45);
}

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('stepBtn').addEventListener('click', nextStep);

step = 8;
animate();
