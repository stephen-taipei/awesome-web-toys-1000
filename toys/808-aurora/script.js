const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const waveInput = document.getElementById('wave');

canvas.width = 370;
canvas.height = 300;

let time = 0;

function drawStars() {
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 47) % (canvas.height * 0.6);
        const twinkle = 0.3 + Math.sin(time * 2 + i) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAurora() {
    const waveStrength = parseInt(waveInput.value);

    for (let layer = 0; layer < 5; layer++) {
        ctx.beginPath();

        const baseY = 80 + layer * 30;
        const hue = 120 + layer * 20 + Math.sin(time + layer) * 30;

        for (let x = 0; x <= canvas.width; x += 2) {
            const wave1 = Math.sin(x * 0.02 + time + layer) * (20 + waveStrength * 3);
            const wave2 = Math.sin(x * 0.01 - time * 0.5 + layer * 0.5) * (15 + waveStrength * 2);
            const wave3 = Math.sin(x * 0.03 + time * 0.7) * (10 + waveStrength);

            const y = baseY + wave1 + wave2 + wave3;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, baseY - 50, 0, canvas.height);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.3)`);
        gradient.addColorStop(0.3, `hsla(${hue + 20}, 70%, 50%, 0.2)`);
        gradient.addColorStop(0.6, `hsla(${hue + 40}, 60%, 40%, 0.1)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    for (let i = 0; i < 30; i++) {
        const x = (i * 37 + time * 20) % canvas.width;
        const baseY = 100 + Math.sin(x * 0.02 + time) * 30;
        const height = 50 + Math.random() * 80;
        const hue = 100 + Math.sin(time + i * 0.1) * 40;

        const gradient = ctx.createLinearGradient(x, baseY, x, baseY + height);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${0.1 + Math.random() * 0.2})`);
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + (Math.random() - 0.5) * 10, baseY + height);
        ctx.stroke();
    }
}

function drawGround() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    for (let i = 0; i < 15; i++) {
        const x = i * 30 - 10;
        const height = 15 + Math.random() * 20;
        ctx.fillStyle = '#0f0f1a';
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x + 15, canvas.height - height);
        ctx.lineTo(x + 30, canvas.height);
        ctx.fill();
    }
}

function animate() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawAurora();
    drawGround();

    time += 0.02;
    requestAnimationFrame(animate);
}

animate();
