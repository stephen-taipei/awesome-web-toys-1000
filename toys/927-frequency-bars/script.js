const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let style = 0;
let time = 0;
let values = [];
let peaks = [];

const numBars = 32;
const styles = ['classic', 'mirror', 'circular', 'blocks'];

function init() {
    for (let i = 0; i < numBars; i++) {
        values[i] = 0;
        peaks[i] = 0;
    }
}

function changeStyle() {
    style = (style + 1) % styles.length;
}

function updateValues() {
    for (let i = 0; i < numBars; i++) {
        const freq = i / numBars;
        let target;

        if (freq < 0.2) {
            target = 0.5 + Math.sin(time * 0.08) * 0.4;
        } else if (freq < 0.5) {
            target = 0.4 + Math.sin(time * 0.1 + i * 0.2) * 0.3;
        } else {
            target = 0.3 + Math.sin(time * 0.15 + i * 0.3) * 0.2;
        }

        target += Math.random() * 0.1;
        values[i] += (target - values[i]) * 0.2;

        if (values[i] > peaks[i]) {
            peaks[i] = values[i];
        } else {
            peaks[i] -= 0.01;
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClassic() {
    const barWidth = canvas.width / numBars;

    values.forEach((value, i) => {
        const height = value * (canvas.height - 40);
        const x = i * barWidth;
        const y = canvas.height - 20 - height;

        const gradient = ctx.createLinearGradient(x, canvas.height - 20, x, y);
        gradient.addColorStop(0, '#2ECC71');
        gradient.addColorStop(0.5, '#F1C40F');
        gradient.addColorStop(1, '#E74C3C');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);

        const peakY = canvas.height - 20 - peaks[i] * (canvas.height - 40);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 1, peakY - 3, barWidth - 2, 3);
    });
}

function drawMirror() {
    const barWidth = canvas.width / numBars;
    const midY = canvas.height / 2;

    values.forEach((value, i) => {
        const height = value * (canvas.height / 2 - 20);
        const x = i * barWidth;

        const hue = (i / numBars) * 120;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

        ctx.fillRect(x + 1, midY - height, barWidth - 2, height);
        ctx.fillRect(x + 1, midY, barWidth - 2, height);
    });
}

function drawCircular() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const innerRadius = 40;
    const maxRadius = 100;

    values.forEach((value, i) => {
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        const nextAngle = ((i + 1) / numBars) * Math.PI * 2 - Math.PI / 2;
        const radius = innerRadius + value * maxRadius;

        const hue = (i / numBars) * 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.lineTo(cx + Math.cos(nextAngle) * radius, cy + Math.sin(nextAngle) * radius);
        ctx.lineTo(cx + Math.cos(nextAngle) * innerRadius, cy + Math.sin(nextAngle) * innerRadius);
        ctx.closePath();
        ctx.fill();
    });
}

function drawBlocks() {
    const cols = 16;
    const rows = 10;
    const blockWidth = canvas.width / cols;
    const blockHeight = (canvas.height - 40) / rows;

    for (let col = 0; col < cols; col++) {
        const barIndex = Math.floor((col / cols) * numBars);
        const level = Math.floor(values[barIndex] * rows);

        for (let row = 0; row < rows; row++) {
            const x = col * blockWidth;
            const y = canvas.height - 20 - (row + 1) * blockHeight;

            if (row < level) {
                const hue = 120 - (row / rows) * 120;
                ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            }

            ctx.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#2ECC71';
    ctx.font = '11px Arial';
    ctx.fillText(`樣式: ${styles[style]}`, 20, 28);
}

function animate() {
    time++;
    updateValues();
    drawBackground();

    switch (styles[style]) {
        case 'classic': drawClassic(); break;
        case 'mirror': drawMirror(); break;
        case 'circular': drawCircular(); break;
        case 'blocks': drawBlocks(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('styleBtn').addEventListener('click', changeStyle);

init();
animate();
