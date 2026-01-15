const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const windInput = document.getElementById('wind');

canvas.width = 370;
canvas.height = 300;

let time = 0;
const grassBlades = [];

for (let x = 0; x < canvas.width; x += 3) {
    grassBlades.push({
        x: x + Math.random() * 3,
        height: 30 + Math.random() * 50,
        hue: 90 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#b8d4e8');
    gradient.addColorStop(1, '#4a7c59');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrass() {
    const wind = parseInt(windInput.value);
    const groundY = canvas.height * 0.6;

    ctx.fillStyle = '#3d5c3d';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    grassBlades.forEach(blade => {
        const wave = Math.sin(time * 2 + blade.x * 0.02 + blade.phase) * wind * 3;
        const wave2 = Math.sin(time * 3 + blade.x * 0.01) * wind;

        const baseX = blade.x;
        const baseY = groundY + Math.random() * 5;
        const tipX = baseX + wave + wave2;
        const tipY = baseY - blade.height;

        const gradient = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
        gradient.addColorStop(0, `hsl(${blade.hue - 20}, 50%, 25%)`);
        gradient.addColorStop(0.5, `hsl(${blade.hue}, 60%, 40%)`);
        gradient.addColorStop(1, `hsl(${blade.hue + 10}, 70%, 50%)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(
            baseX + wave * 0.5,
            baseY - blade.height * 0.6,
            tipX,
            tipY
        );
        ctx.stroke();
    });
}

function animate() {
    drawBackground();
    drawGrass();
    time += 0.02;
    requestAnimationFrame(animate);
}

animate();
