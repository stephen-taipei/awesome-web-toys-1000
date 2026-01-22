const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let colorScheme = 0;
let waves = [];
let stars = [];
let time = 0;

const colorSchemes = [
    [{ h: 120, s: 100, l: 50 }, { h: 180, s: 100, l: 50 }],
    [{ h: 280, s: 100, l: 50 }, { h: 320, s: 100, l: 50 }],
    [{ h: 200, s: 100, l: 50 }, { h: 160, s: 100, l: 50 }],
    [{ h: 60, s: 100, l: 50 }, { h: 120, s: 100, l: 50 }]
];

function init() {
    for (let i = 0; i < 8; i++) {
        waves.push({
            offset: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            amplitude: 20 + Math.random() * 30,
            y: 50 + i * 20
        });
    }

    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.7,
            size: Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function changeColor() {
    colorScheme = (colorScheme + 1) % colorSchemes.length;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(0.7, '#1a1a3a');
    gradient.addColorStop(1, '#0a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
    stars.forEach(star => {
        star.twinkle += 0.05;
        const brightness = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAurora() {
    const colors = colorSchemes[colorScheme];

    waves.forEach((wave, index) => {
        wave.offset += wave.speed;

        const points = [];
        for (let x = 0; x <= canvas.width; x += 5) {
            const y = wave.y + Math.sin(x * 0.02 + wave.offset) * wave.amplitude +
                      Math.sin(x * 0.01 + time * 0.02) * 15;
            points.push({ x, y });
        }

        const colorIndex = index / waves.length;
        const color1 = colors[0];
        const color2 = colors[1];
        const h = color1.h + (color2.h - color1.h) * colorIndex;

        const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + 80);
        gradient.addColorStop(0, `hsla(${h}, 100%, 60%, 0)`);
        gradient.addColorStop(0.3, `hsla(${h}, 100%, 50%, 0.3)`);
        gradient.addColorStop(0.6, `hsla(${h}, 100%, 40%, 0.2)`);
        gradient.addColorStop(1, `hsla(${h}, 100%, 30%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        points.forEach(p => ctx.lineTo(p.x, p.y));

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    });
}

function drawMountains() {
    ctx.fillStyle = '#0a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 60);
    ctx.lineTo(60, canvas.height - 100);
    ctx.lineTo(120, canvas.height - 70);
    ctx.lineTo(180, canvas.height - 110);
    ctx.lineTo(240, canvas.height - 80);
    ctx.lineTo(300, canvas.height - 95);
    ctx.lineTo(canvas.width, canvas.height - 70);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#1a2a2a';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 40);
    ctx.lineTo(100, canvas.height - 60);
    ctx.lineTo(200, canvas.height - 45);
    ctx.lineTo(300, canvas.height - 55);
    ctx.lineTo(canvas.width, canvas.height - 35);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
}

function drawSnow() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    [[60, canvas.height - 100], [180, canvas.height - 110], [300, canvas.height - 95]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + 15);
        ctx.lineTo(x + 10, y + 15);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const colorNames = ['綠色', '紫色', '藍色', '黃綠'];
    ctx.fillText(`配色: ${colorNames[colorScheme]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawStars();
    drawAurora();
    drawMountains();
    drawSnow();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('colorBtn').addEventListener('click', changeColor);

init();
animate();
