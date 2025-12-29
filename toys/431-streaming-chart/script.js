const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const maxPoints = 60;
let data = [];
let running = true;
let spike = false;

for (let i = 0; i < maxPoints; i++) {
    data.push(50 + Math.random() * 20);
}

function generateValue() {
    const last = data[data.length - 1];
    let change = (Math.random() - 0.5) * 15;
    if (spike) {
        change += 40;
        spike = false;
    }
    let newVal = last + change;
    newVal = Math.max(10, Math.min(90, newVal));
    return newVal;
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let y = 40; y < canvas.height - 20; y += 40) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 30);
    data.forEach((val, i) => {
        const x = 40 + (i / (maxPoints - 1)) * (canvas.width - 60);
        const y = canvas.height - 30 - (val / 100) * (canvas.height - 60);
        ctx.lineTo(x, y);
    });
    ctx.lineTo(canvas.width - 20, canvas.height - 30);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 40, 0, canvas.height - 30);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.8)');
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = 40 + (i / (maxPoints - 1)) * (canvas.width - 60);
        const y = canvas.height - 30 - (val / 100) * (canvas.height - 60);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current value marker
    const lastVal = data[data.length - 1];
    const lastX = canvas.width - 20;
    const lastY = canvas.height - 30 - (lastVal / 100) * (canvas.height - 60);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // Y-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('100', 35, 45);
    ctx.fillText('50', 35, canvas.height / 2);
    ctx.fillText('0', 35, canvas.height - 25);

    // Current value
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`目前: ${lastVal.toFixed(1)}`, 50, 25);
}

function update() {
    if (running) {
        data.shift();
        data.push(generateValue());
    }
    draw();
    requestAnimationFrame(update);
}

document.getElementById('toggle').addEventListener('click', function() {
    running = !running;
    this.textContent = running ? '⏸️ 暫停' : '▶️ 繼續';
    infoEl.textContent = running ? '數據串流中...' : '已暫停';
});

document.getElementById('spike').addEventListener('click', () => {
    spike = true;
    infoEl.textContent = '已加入峰值!';
});

update();
