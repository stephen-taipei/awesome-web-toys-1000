const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const stages = [
    { name: '訪客', color: '#3498db' },
    { name: '註冊', color: '#9b59b6' },
    { name: '試用', color: '#e74c3c' },
    { name: '付費', color: '#f39c12' },
    { name: '忠實用戶', color: '#2ecc71' }
];

let data = [10000, 6000, 3500, 1500, 800];
let currentData = [...data];
let animating = false;

function generateData() {
    let value = 10000;
    data = stages.map((_, i) => {
        if (i > 0) value = Math.floor(value * (Math.random() * 0.4 + 0.3));
        return value;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const startY = 30;
    const totalHeight = 260;
    const segmentHeight = totalHeight / stages.length;
    const maxWidth = 300;

    const maxValue = currentData[0];

    stages.forEach((stage, i) => {
        const y = startY + segmentHeight * i;
        const currentWidth = (currentData[i] / maxValue) * maxWidth;
        const nextWidth = i < stages.length - 1 ? (currentData[i + 1] / maxValue) * maxWidth : currentWidth * 0.6;

        // Draw trapezoid
        ctx.beginPath();
        ctx.moveTo(cx - currentWidth / 2, y);
        ctx.lineTo(cx + currentWidth / 2, y);
        ctx.lineTo(cx + nextWidth / 2, y + segmentHeight);
        ctx.lineTo(cx - nextWidth / 2, y + segmentHeight);
        ctx.closePath();
        ctx.fillStyle = stage.color;
        ctx.fill();

        // Draw text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stage.name, cx, y + segmentHeight / 2 - 5);
        ctx.font = '11px Arial';
        ctx.fillText(Math.round(currentData[i]).toLocaleString(), cx, y + segmentHeight / 2 + 10);

        // Conversion rate
        if (i > 0) {
            const rate = Math.round((currentData[i] / currentData[i - 1]) * 100);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(rate + '%', cx + maxWidth / 2 + 25, y + 5);
        }
    });
}

function animate() {
    let stillAnimating = false;

    currentData = currentData.map((val, i) => {
        const diff = data[i] - val;
        if (Math.abs(diff) > 1) {
            stillAnimating = true;
            return val + diff * 0.1;
        }
        return data[i];
    });

    draw();

    if (stillAnimating) {
        requestAnimationFrame(animate);
    } else {
        animating = false;
    }
}

document.getElementById('randomize').addEventListener('click', () => {
    generateData();
    if (!animating) {
        animating = true;
        animate();
    }
});

generateData();
currentData = [...data];
draw();
