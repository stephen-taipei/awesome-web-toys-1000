const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('slider');
const valueEl = document.getElementById('value');

let currentValue = 75;
let targetValue = 75;

const cx = canvas.width / 2;
const cy = 180;
const radius = 120;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const totalAngle = endAngle - startAngle;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc with gradient
    const valueAngle = startAngle + (currentValue / 100) * totalAngle;
    const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);

    if (currentValue < 30) {
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(1, '#e74c3c');
    } else if (currentValue < 70) {
        gradient.addColorStop(0, '#f39c12');
        gradient.addColorStop(1, '#f1c40f');
    } else {
        gradient.addColorStop(0, '#27ae60');
        gradient.addColorStop(1, '#2ecc71');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, valueAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tick marks
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (i / 10) * totalAngle;
        const innerR = radius - 35;
        const outerR = radius - 25;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelR = radius - 50;
        ctx.fillText(i * 10, cx + Math.cos(angle) * labelR, cy + Math.sin(angle) * labelR);
    }

    // Needle
    const needleAngle = startAngle + (currentValue / 100) * totalAngle;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);

    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(0, -radius + 40);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.restore();

    valueEl.textContent = Math.round(currentValue) + '%';
}

function animate() {
    const diff = targetValue - currentValue;
    if (Math.abs(diff) > 0.1) {
        currentValue += diff * 0.1;
        draw();
        requestAnimationFrame(animate);
    } else {
        currentValue = targetValue;
        draw();
    }
}

slider.addEventListener('input', () => {
    targetValue = parseInt(slider.value);
    animate();
});

draw();
