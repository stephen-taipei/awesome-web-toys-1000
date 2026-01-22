const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let colorScheme = 0;
let time = 0;
let stars = [];

const colorSchemes = [
    ['#00FF7F', '#00CED1', '#7FFFD4'],
    ['#FF69B4', '#DA70D6', '#BA55D3'],
    ['#FFD700', '#FFA500', '#FF6347'],
    ['#00BFFF', '#1E90FF', '#4169E1']
];

function init() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function changeColor() {
    colorScheme = (colorScheme + 1) % colorSchemes.length;
}

function drawStars() {
    stars.forEach(star => {
        const brightness = 0.4 + Math.sin(time * 0.003 + star.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAurora() {
    const colors = colorSchemes[colorScheme];

    for (let layer = 0; layer < 5; layer++) {
        const yOffset = layer * 15;
        const amplitude = 30 + layer * 10;
        const frequency = 0.008 + layer * 0.002;
        const speed = 0.02 + layer * 0.005;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 2) {
            const y = 80 + yOffset +
                Math.sin(x * frequency + time * speed) * amplitude +
                Math.sin(x * frequency * 2 + time * speed * 1.5) * (amplitude * 0.5);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 50, 0, 200);
        const color = colors[layer % colors.length];
        gradient.addColorStop(0, `${color}00`);
        gradient.addColorStop(0.3, `${color}40`);
        gradient.addColorStop(0.6, `${color}20`);
        gradient.addColorStop(1, `${color}00`);

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    for (let i = 0; i < 20; i++) {
        const x = (i * 50 + time * 2) % (canvas.width + 100) - 50;
        const baseY = 100 + Math.sin(x * 0.01 + time * 0.02) * 30;
        const height = 50 + Math.sin(time * 0.03 + i) * 30;

        const rayGradient = ctx.createLinearGradient(x, baseY, x, baseY + height);
        const color = colors[i % colors.length];
        rayGradient.addColorStop(0, `${color}60`);
        rayGradient.addColorStop(1, `${color}00`);

        ctx.fillStyle = rayGradient;
        ctx.fillRect(x - 2, baseY, 4, height);
    }
}

function drawMountains() {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 50);
    ctx.lineTo(60, canvas.height - 90);
    ctx.lineTo(120, canvas.height - 60);
    ctx.lineTo(180, canvas.height - 100);
    ctx.lineTo(240, canvas.height - 70);
    ctx.lineTo(300, canvas.height - 85);
    ctx.lineTo(canvas.width, canvas.height - 55);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#252540';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 30);
    ctx.lineTo(100, canvas.height - 50);
    ctx.lineTo(200, canvas.height - 35);
    ctx.lineTo(canvas.width, canvas.height - 45);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
}

function drawReflection() {
    ctx.fillStyle = '#0a1428';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    const colors = colorSchemes[colorScheme];
    for (let i = 0; i < 10; i++) {
        const x = i * 40 + Math.sin(time * 0.02 + i) * 10;
        const gradient = ctx.createLinearGradient(x, canvas.height - 30, x, canvas.height);
        const color = colors[i % colors.length];
        gradient.addColorStop(0, `${color}30`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, canvas.height - 30, 30, 30);
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const names = ['綠色', '紫紅', '金橙', '藍色'];
    ctx.fillText(`配色: ${names[colorScheme]}`, 20, 28);
}

function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawAurora();
    drawMountains();
    drawReflection();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('colorBtn').addEventListener('click', changeColor);

init();
animate();
