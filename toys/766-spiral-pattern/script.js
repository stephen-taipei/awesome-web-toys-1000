const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const turnsInput = document.getElementById('turns');
const densityInput = document.getElementById('density');

canvas.width = 370;
canvas.height = 280;

function generate() {
    ctx.fillStyle = '#1a0a20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const turns = parseInt(turnsInput.value);
    const density = parseInt(densityInput.value);
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 10;

    for (let arm = 0; arm < density; arm++) {
        const baseAngle = (arm / density) * Math.PI * 2;

        ctx.beginPath();
        ctx.strokeStyle = `hsl(${(arm / density) * 360 + 270}, 70%, 60%)`;
        ctx.lineWidth = 2;

        for (let i = 0; i <= 360 * turns; i++) {
            const angle = (i * Math.PI / 180) + baseAngle;
            const radius = (i / (360 * turns)) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
turnsInput.addEventListener('input', generate);
densityInput.addEventListener('input', generate);

generate();
