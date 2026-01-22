const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let n = 5;
let d = 1;
let time = 0;
let progress = 0;

function changePetals() {
    n = Math.floor(Math.random() * 8) + 2;
    d = Math.floor(Math.random() * 3) + 1;
    progress = 0;
}

function draw() {
    ctx.fillStyle = 'rgba(21, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = 100;

    progress += 0.01;
    if (progress > Math.PI * 2 * d) {
        progress = Math.PI * 2 * d;
    }

    ctx.strokeStyle = '#FF4081';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let theta = 0; theta <= progress; theta += 0.01) {
        const r = maxRadius * Math.cos((n / d) * theta);
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);

        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 64, 129, 0.1)';
    ctx.fill();

    const endTheta = progress;
    const endR = maxRadius * Math.cos((n / d) * endTheta);
    const endX = cx + endR * Math.cos(endTheta);
    const endY = cy + endR * Math.sin(endTheta);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fill();

    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 130, 50);

    ctx.fillStyle = '#FF4081';
    ctx.font = '11px Arial';
    ctx.fillText(`r = cos(${n}/${d}θ)`, 20, 28);
    ctx.fillText(`花瓣: ${n % d === 0 ? n / d : (n % 2 === 0 ? 2 * n : n)}`, 20, 45);
}

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('petalBtn').addEventListener('click', changePetals);

animate();
