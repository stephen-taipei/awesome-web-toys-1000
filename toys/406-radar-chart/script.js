const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const labels = ['攻擊', '防禦', '速度', '智力', '體力', '技巧'];
const AXES = labels.length;

let playerA = [80, 65, 90, 70, 75, 85];
let playerB = [70, 85, 60, 90, 80, 65];
let currentA = [...playerA];
let currentB = [...playerB];
let animating = false;

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const maxRadius = 120;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw web
    for (let level = 1; level <= 5; level++) {
        const r = (maxRadius / 5) * level;
        ctx.beginPath();
        for (let i = 0; i < AXES; i++) {
            const angle = (Math.PI * 2 / AXES) * i - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < AXES; i++) {
        const angle = (Math.PI * 2 / AXES) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * maxRadius;
        const y = cy + Math.sin(angle) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();

        // Label
        const lx = cx + Math.cos(angle) * (maxRadius + 20);
        const ly = cy + Math.sin(angle) * (maxRadius + 20);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], lx, ly);
    }

    // Draw player A
    drawData(currentA, '#e74c3c');

    // Draw player B
    drawData(currentB, '#3498db');
}

function drawData(data, color) {
    ctx.beginPath();
    data.forEach((value, i) => {
        const angle = (Math.PI * 2 / AXES) * i - Math.PI / 2;
        const r = (value / 100) * maxRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = color + '40';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    data.forEach((value, i) => {
        const angle = (Math.PI * 2 / AXES) * i - Math.PI / 2;
        const r = (value / 100) * maxRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });
}

function animate() {
    let stillAnimating = false;

    for (let i = 0; i < AXES; i++) {
        if (Math.abs(playerA[i] - currentA[i]) > 0.5) {
            currentA[i] += (playerA[i] - currentA[i]) * 0.15;
            stillAnimating = true;
        } else {
            currentA[i] = playerA[i];
        }
        if (Math.abs(playerB[i] - currentB[i]) > 0.5) {
            currentB[i] += (playerB[i] - currentB[i]) * 0.15;
            stillAnimating = true;
        } else {
            currentB[i] = playerB[i];
        }
    }

    draw();

    if (stillAnimating) {
        requestAnimationFrame(animate);
    } else {
        animating = false;
    }
}

document.getElementById('randomize').addEventListener('click', () => {
    playerA = labels.map(() => Math.random() * 60 + 40);
    playerB = labels.map(() => Math.random() * 60 + 40);
    if (!animating) {
        animating = true;
        animate();
    }
});

draw();
