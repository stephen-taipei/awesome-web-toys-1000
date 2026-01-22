const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

let mode = 0;
const modes = ['波形', '圓環', '柱狀'];
let time = 0;
let frequencies = [];

function init() {
    frequencies = [];
    for (let i = 0; i < 64; i++) {
        frequencies.push({
            value: Math.random() * 50 + 50,
            target: Math.random() * 50 + 50,
            speed: Math.random() * 0.1 + 0.05
        });
    }
}

function update() {
    frequencies.forEach(f => {
        f.value += (f.target - f.value) * f.speed;
        if (Math.abs(f.value - f.target) < 1) {
            f.target = Math.random() * 100 + 20;
        }
    });
}

function drawWaveform() {
    ctx.beginPath();
    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = 2;

    const sliceWidth = canvas.width / frequencies.length;

    for (let i = 0; i < frequencies.length; i++) {
        const x = i * sliceWidth;
        const y = canvas.height / 2 + Math.sin(time * 0.05 + i * 0.2) * frequencies[i].value * 0.5;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    for (let i = 0; i < frequencies.length; i++) {
        const x = i * sliceWidth;
        const y = canvas.height / 2 - Math.sin(time * 0.05 + i * 0.2) * frequencies[i].value * 0.5;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

function drawCircular() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 60;

    for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        const alpha = 1 - ring * 0.3;
        ctx.strokeStyle = `rgba(0, 188, 212, ${alpha})`;
        ctx.lineWidth = 2;

        for (let i = 0; i <= frequencies.length; i++) {
            const angle = (i / frequencies.length) * Math.PI * 2;
            const freq = frequencies[i % frequencies.length].value;
            const radius = baseRadius + ring * 30 + freq * 0.3 * (1 + ring * 0.2);

            const x = centerX + Math.cos(angle + time * 0.01) * radius;
            const y = centerY + Math.sin(angle + time * 0.01) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function drawBars() {
    const barWidth = canvas.width / frequencies.length;
    const centerY = canvas.height / 2;

    frequencies.forEach((f, i) => {
        const height = f.value * 1.2;
        const x = i * barWidth;

        const gradient = ctx.createLinearGradient(x, centerY - height / 2, x, centerY + height / 2);
        gradient.addColorStop(0, '#00BCD4');
        gradient.addColorStop(0.5, '#4DD0E1');
        gradient.addColorStop(1, '#00BCD4');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, centerY - height / 2, barWidth - 2, height);
    });
}

function draw() {
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (mode) {
        case 0: drawWaveform(); break;
        case 1: drawCircular(); break;
        case 2: drawBars(); break;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(modes[mode], canvas.width / 2, 20);

    time++;
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('modeBtn').addEventListener('click', () => {
    mode = (mode + 1) % modes.length;
});

init();
animate();
