const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let debris = [];
let dust = [];
let mountainProfile = [];
let isSliding = false;

function initMountain() {
    mountainProfile = [];
    debris = [];
    dust = [];

    for (let x = 0; x <= canvas.width; x += 5) {
        let y;
        if (x < 50) {
            y = canvas.height - 30;
        } else if (x < 200) {
            y = canvas.height - 30 - (x - 50) * 1.2;
        } else if (x < 250) {
            y = canvas.height - 30 - 180 + (x - 200) * 0.5;
        } else {
            y = canvas.height - 30 - 155 + (x - 250) * 1.1;
        }
        mountainProfile.push({ x, y: Math.max(y, 50) });
    }
}

function triggerLandslide() {
    if (isSliding) return;
    isSliding = true;

    for (let i = 0; i < 100; i++) {
        const startX = 100 + Math.random() * 100;
        const profileIdx = Math.floor(startX / 5);
        const startY = mountainProfile[profileIdx]?.y || 100;

        debris.push({
            x: startX,
            y: startY + Math.random() * 20,
            vx: 2 + Math.random() * 3,
            vy: 0,
            size: 5 + Math.random() * 15,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2,
            type: Math.random() > 0.3 ? 'rock' : 'dirt'
        });
    }
}

function updateDebris() {
    for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];

        d.vy += 0.3;
        d.x += d.vx;
        d.y += d.vy;
        d.rotation += d.rotSpeed;

        const profileIdx = Math.floor(d.x / 5);
        const groundY = mountainProfile[profileIdx]?.y || canvas.height - 30;

        if (d.y > groundY - d.size / 2) {
            d.y = groundY - d.size / 2;
            d.vy *= -0.3;
            d.vx *= 0.8;

            if (Math.random() < 0.3) {
                dust.push({
                    x: d.x,
                    y: d.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 2,
                    size: 5 + Math.random() * 10,
                    alpha: 0.8
                });
            }
        }

        if (Math.abs(d.vx) < 0.1 && Math.abs(d.vy) < 0.5) {
            d.vx = 0;
            d.vy = 0;
        }

        if (d.x > canvas.width + 50) {
            debris.splice(i, 1);
        }
    }

    for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.alpha -= 0.01;
        p.size += 0.5;

        if (p.alpha <= 0) {
            dust.splice(i, 1);
        }
    }

    if (debris.every(d => d.vx === 0 && d.vy === 0)) {
        isSliding = false;
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#B0C4DE');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMountain() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    mountainProfile.forEach(p => {
        ctx.lineTo(p.x, p.y);
    });

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 50, 0, canvas.height);
    gradient.addColorStop(0, '#696969');
    gradient.addColorStop(0.3, '#8B7355');
    gradient.addColorStop(0.7, '#A0522D');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fill();

    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        const x = 20 + i * 30;
        const profileIdx = Math.floor(x / 5);
        const y = mountainProfile[profileIdx]?.y || 200;
        ctx.arc(x, y - 5, 8 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawDebris() {
    debris.forEach(d => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);

        if (d.type === 'rock') {
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.moveTo(-d.size / 2, d.size / 3);
            ctx.lineTo(-d.size / 3, -d.size / 2);
            ctx.lineTo(d.size / 3, -d.size / 3);
            ctx.lineTo(d.size / 2, d.size / 4);
            ctx.lineTo(0, d.size / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(0, 0, d.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}

function drawDust() {
    dust.forEach(p => {
        ctx.fillStyle = `rgba(139, 119, 101, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function animate() {
    drawBackground();
    drawMountain();
    drawDust();
    drawDebris();
    updateDebris();
    requestAnimationFrame(animate);
}

document.getElementById('triggerBtn').addEventListener('click', () => {
    initMountain();
    setTimeout(triggerLandslide, 100);
});

initMountain();
animate();
