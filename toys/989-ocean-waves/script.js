const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let waveIntensity = 1;
const intensities = ['平靜', '輕浪', '中浪', '大浪'];
let foamParticles = [];

class FoamParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.alpha = 1;
        this.speedX = Math.random() * 2 - 1;
    }

    update() {
        this.x += this.speedX;
        this.alpha -= 0.02;
    }

    draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
        ctx.fill();
    }
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    gradient.addColorStop(0, '#1a3a5c');
    gradient.addColorStop(1, '#3a5a7c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

    ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 40, 20, 0, Math.PI * 2);
    ctx.fill();

    const moonGlow = ctx.createRadialGradient(canvas.width - 50, 40, 0, canvas.width - 50, 40, 60);
    moonGlow.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 40, 60, 0, Math.PI * 2);
    ctx.fill();
}

function drawWave(baseY, amplitude, frequency, speed, color, alpha) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x += 5) {
        const y = baseY +
            Math.sin(x * frequency + time * speed) * amplitude +
            Math.sin(x * frequency * 0.5 + time * speed * 0.7) * amplitude * 0.5;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.fill();

    return (x) => baseY +
        Math.sin(x * frequency + time * speed) * amplitude +
        Math.sin(x * frequency * 0.5 + time * speed * 0.7) * amplitude * 0.5;
}

function draw() {
    ctx.fillStyle = '#0a2a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSky();

    const baseAmplitude = 10 + waveIntensity * 8;
    const baseSpeed = 0.02 + waveIntensity * 0.01;

    drawWave(canvas.height * 0.4, baseAmplitude * 0.5, 0.02, baseSpeed * 0.5, 'rgb(20, 60, 80)', 0.5);
    drawWave(canvas.height * 0.5, baseAmplitude * 0.7, 0.025, baseSpeed * 0.7, 'rgb(30, 80, 100)', 0.6);
    drawWave(canvas.height * 0.55, baseAmplitude * 0.8, 0.03, baseSpeed * 0.8, 'rgb(40, 100, 120)', 0.7);

    const mainWaveY = drawWave(canvas.height * 0.6, baseAmplitude, 0.035, baseSpeed, 'rgb(50, 120, 140)', 0.8);

    if (Math.random() < 0.1 * waveIntensity) {
        const x = Math.random() * canvas.width;
        const y = mainWaveY(x);
        foamParticles.push(new FoamParticle(x, y));
    }

    foamParticles = foamParticles.filter(p => p.alpha > 0);
    foamParticles.forEach(p => {
        p.update();
        p.draw();
    });

    drawWave(canvas.height * 0.65, baseAmplitude * 1.1, 0.04, baseSpeed * 1.1, 'rgb(60, 140, 160)', 0.9);
    drawWave(canvas.height * 0.7, baseAmplitude * 1.2, 0.045, baseSpeed * 1.2, 'rgb(70, 160, 180)', 1);

    ctx.fillStyle = '#1a3a4a';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    const reflectionGradient = ctx.createLinearGradient(canvas.width - 70, canvas.height * 0.4, canvas.width - 30, canvas.height * 0.7);
    reflectionGradient.addColorStop(0, 'rgba(255, 255, 200, 0.1)');
    reflectionGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = reflectionGradient;
    ctx.fillRect(canvas.width - 70, canvas.height * 0.4, 40, canvas.height * 0.3);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(intensities[waveIntensity], canvas.width / 2, 20);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('waveBtn').addEventListener('click', () => {
    waveIntensity = (waveIntensity + 1) % intensities.length;
});

animate();
