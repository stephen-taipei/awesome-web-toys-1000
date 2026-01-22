const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let blobs = [];
let colorScheme = 0;
let time = 0;

const colorSchemes = [
    { blob: '#FF69B4', liquid: '#4B0082', glow: 'rgba(255, 105, 180, 0.3)' },
    { blob: '#00FF00', liquid: '#006400', glow: 'rgba(0, 255, 0, 0.3)' },
    { blob: '#FF4500', liquid: '#8B0000', glow: 'rgba(255, 69, 0, 0.3)' },
    { blob: '#00BFFF', liquid: '#00008B', glow: 'rgba(0, 191, 255, 0.3)' }
];

function init() {
    blobs = [];
    for (let i = 0; i < 6; i++) {
        blobs.push({
            x: 120 + Math.random() * 130,
            y: 50 + Math.random() * 180,
            radius: 15 + Math.random() * 25,
            vy: (Math.random() - 0.5) * 0.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.02
        });
    }
}

function changeColor() {
    colorScheme = (colorScheme + 1) % colorSchemes.length;
}

function updateBlobs() {
    blobs.forEach(blob => {
        blob.wobble += blob.wobbleSpeed;
        blob.x += Math.sin(blob.wobble) * 0.3;

        const heatFactor = (canvas.height - 50 - blob.y) / (canvas.height - 100);
        blob.vy += (heatFactor - 0.5) * 0.01;
        blob.vy *= 0.99;
        blob.y += blob.vy;

        if (blob.y < 60) {
            blob.y = 60;
            blob.vy = Math.abs(blob.vy) * 0.5;
        }
        if (blob.y > canvas.height - 70) {
            blob.y = canvas.height - 70;
            blob.vy = -Math.abs(blob.vy) * 0.5;
        }

        if (blob.x < 125) blob.x = 125;
        if (blob.x > 245) blob.x = 245;
    });
}

function drawLamp() {
    const colors = colorSchemes[colorScheme];

    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(130, canvas.height - 30);
    ctx.lineTo(240, canvas.height - 30);
    ctx.lineTo(250, canvas.height - 10);
    ctx.lineTo(120, canvas.height - 10);
    ctx.fill();

    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(140, 40);
    ctx.lineTo(230, 40);
    ctx.lineTo(240, 20);
    ctx.lineTo(130, 20);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(130, 40);
    ctx.lineTo(120, canvas.height - 30);
    ctx.lineTo(250, canvas.height - 30);
    ctx.lineTo(240, 40);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = colors.liquid;
    ctx.fillRect(120, 40, 130, canvas.height - 70);

    blobs.forEach(blob => {
        const gradient = ctx.createRadialGradient(
            blob.x - blob.radius * 0.3,
            blob.y - blob.radius * 0.3,
            0,
            blob.x,
            blob.y,
            blob.radius
        );
        gradient.addColorStop(0, colors.blob);
        gradient.addColorStop(0.7, colors.blob);
        gradient.addColorStop(1, colors.glow);

        ctx.fillStyle = gradient;
        ctx.beginPath();

        const points = 8;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wobbleAmount = Math.sin(blob.wobble + angle * 2) * 5;
            const r = blob.radius + wobbleAmount;
            const x = blob.x + Math.cos(angle) * r;
            const y = blob.y + Math.sin(angle) * r * 1.2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.fill();
    });

    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(135, 50);
    ctx.lineTo(125, canvas.height - 40);
    ctx.stroke();

    ctx.fillStyle = colors.glow;
    ctx.beginPath();
    ctx.ellipse(185, canvas.height - 35, 50, 10, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawGlow() {
    const colors = colorSchemes[colorScheme];
    const gradient = ctx.createRadialGradient(185, 150, 0, 185, 150, 150);
    gradient.addColorStop(0, colors.glow);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBackground() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const names = ['粉紅', '綠色', '橙紅', '藍色'];
    ctx.fillText(`顏色: ${names[colorScheme]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawGlow();
    updateBlobs();
    drawLamp();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('colorBtn').addEventListener('click', changeColor);

init();
animate();
