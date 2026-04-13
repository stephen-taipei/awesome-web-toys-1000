const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let style = 0;
let time = 0;
let beat = 0;

const styles = ['bars', 'circles', 'waves', 'particles'];
const numBars = 32;

function changeStyle() {
    style = (style + 1) % styles.length;
}

function generateBeat() {
    const values = [];
    for (let i = 0; i < numBars; i++) {
        const freq = i / numBars;
        const bass = Math.sin(time * 0.1 + i * 0.1) * 0.5 + 0.5;
        const mid = Math.sin(time * 0.15 + i * 0.2) * 0.3 + 0.3;
        const high = Math.sin(time * 0.2 + i * 0.3) * 0.2 + 0.2;

        let value;
        if (freq < 0.3) {
            value = bass * (1 + Math.sin(time * 0.05) * 0.5);
        } else if (freq < 0.7) {
            value = mid * (1 + Math.sin(time * 0.08) * 0.3);
        } else {
            value = high * (1 + Math.sin(time * 0.12) * 0.2);
        }

        values.push(Math.max(0.1, Math.min(1, value)));
    }
    return values;
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBars(values) {
    const barWidth = canvas.width / numBars;

    values.forEach((value, i) => {
        const height = value * (canvas.height - 60);
        const x = i * barWidth;
        const y = canvas.height - 30 - height;

        const hue = (i / numBars) * 360;
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 30);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.5)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);

        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x + 1, y, barWidth - 2, 3);
        ctx.shadowBlur = 0;
    });
}

function drawCircles(values) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    values.forEach((value, i) => {
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        const radius = 50 + value * 80;
        const hue = (i / numBars) * 360;

        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${value})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(angle) * radius,
            cy + Math.sin(angle) * radius
        );
        ctx.stroke();

        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${value})`;
        ctx.beginPath();
        ctx.arc(
            cx + Math.cos(angle) * radius,
            cy + Math.sin(angle) * radius,
            value * 5,
            0, Math.PI * 2
        );
        ctx.fill();
    });
}

function drawWaves(values) {
    const midY = canvas.height / 2;

    ctx.beginPath();
    values.forEach((value, i) => {
        const x = (i / numBars) * canvas.width;
        const y = midY + Math.sin(i * 0.5 + time * 0.1) * value * 80;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    const hue = (time * 2) % 360;
    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    values.forEach((value, i) => {
        const x = (i / numBars) * canvas.width;
        const y = midY - Math.sin(i * 0.5 + time * 0.1) * value * 80;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = `hsl(${(hue + 180) % 360}, 100%, 60%)`;
    ctx.stroke();
}

function drawParticles(values) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    values.forEach((value, i) => {
        const angle = (i / numBars) * Math.PI * 2 + time * 0.02;
        const distance = 30 + value * 100;
        const hue = (i / numBars) * 360 + time * 2;

        for (let j = 0; j < 3; j++) {
            const jitter = (j - 1) * 0.1;
            const x = cx + Math.cos(angle + jitter) * distance;
            const y = cy + Math.sin(angle + jitter) * distance;

            ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${value * (1 - j * 0.3)})`;
            ctx.beginPath();
            ctx.arc(x, y, value * 8 - j * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`樣式: ${styles[style]}`, 20, 28);
}

function animate() {
    time++;
    const values = generateBeat();

    drawBackground();

    switch (styles[style]) {
        case 'bars': drawBars(values); break;
        case 'circles': drawCircles(values); break;
        case 'waves': drawWaves(values); break;
        case 'particles': drawParticles(values); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('styleBtn').addEventListener('click', changeStyle);

ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
animate();
