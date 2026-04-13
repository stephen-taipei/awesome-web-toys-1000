const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let ripples = [];
let splashDrops = [];

const puddles = [
    { x: 100, y: 200, rx: 60, ry: 25 },
    { x: 270, y: 180, rx: 50, ry: 20 },
    { x: 180, y: 240, rx: 70, ry: 30 }
];

function createSplash(x, y) {
    for (let i = 0; i < 15; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 3 + Math.random() * 5;
        splashDrops.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: -3 - Math.random() * 6,
            size: 2 + Math.random() * 4,
            alpha: 1
        });
    }

    for (let i = 0; i < 4; i++) {
        ripples.push({
            x: x,
            y: y,
            radius: 5 + i * 10,
            alpha: 0.8 - i * 0.15
        });
    }
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    puddles.forEach(puddle => {
        const dx = (x - puddle.x) / puddle.rx;
        const dy = (y - puddle.y) / puddle.ry;
        if (dx * dx + dy * dy < 1) {
            createSplash(x, y);
        }
    });
}

function buttonSplash() {
    const puddle = puddles[Math.floor(Math.random() * puddles.length)];
    const x = puddle.x + (Math.random() - 0.5) * puddle.rx;
    const y = puddle.y + (Math.random() - 0.5) * puddle.ry * 0.5;
    createSplash(x, y);
}

function updateSplash() {
    for (let i = splashDrops.length - 1; i >= 0; i--) {
        const drop = splashDrops[i];
        drop.vy += 0.3;
        drop.x += drop.vx;
        drop.y += drop.vy;
        drop.alpha -= 0.02;

        if (drop.alpha <= 0 || drop.y > canvas.height) {
            splashDrops.splice(i, 1);
        }
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += 2;
        ripple.alpha -= 0.02;

        if (ripple.alpha <= 0) {
            ripples.splice(i, 1);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#5a5a5a';
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
            (i * 73) % canvas.width,
            (i * 47) % canvas.height,
            1 + Math.random() * 2,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawPuddles() {
    puddles.forEach(puddle => {
        const gradient = ctx.createRadialGradient(
            puddle.x, puddle.y, 0,
            puddle.x, puddle.y, puddle.rx
        );
        gradient.addColorStop(0, 'rgba(100, 150, 180, 0.8)');
        gradient.addColorStop(0.7, 'rgba(80, 130, 160, 0.6)');
        gradient.addColorStop(1, 'rgba(60, 110, 140, 0.4)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(puddle.x, puddle.y, puddle.rx, puddle.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(200, 220, 240, 0.3)';
        ctx.beginPath();
        ctx.ellipse(puddle.x - puddle.rx * 0.3, puddle.y - puddle.ry * 0.3,
                    puddle.rx * 0.3, puddle.ry * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawRipples() {
    ripples.forEach(ripple => {
        ctx.strokeStyle = `rgba(200, 230, 255, ${ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawSplashDrops() {
    splashDrops.forEach(drop => {
        ctx.fillStyle = `rgba(150, 200, 230, ${drop.alpha})`;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('點擊水窪踩水！', 20, 28);
}

function animate() {
    drawBackground();
    drawPuddles();
    updateSplash();
    drawRipples();
    drawSplashDrops();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', handleClick);
document.getElementById('splashBtn').addEventListener('click', buttonSplash);

animate();
