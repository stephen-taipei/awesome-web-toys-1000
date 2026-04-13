const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let isRaining = false;
let raindrops = [];
let time = 0;
let animals = [];

function initAnimals() {
    animals = [];

    for (let i = 0; i < 3; i++) {
        animals.push({
            type: 'bird',
            x: Math.random() * canvas.width,
            y: 30 + Math.random() * 40,
            vx: (Math.random() - 0.5) * 2,
            color: `hsl(${Math.random() * 60 + 180}, 70%, 50%)`,
            wingPhase: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 2; i++) {
        animals.push({
            type: 'monkey',
            x: 50 + Math.random() * 270,
            y: 80 + Math.random() * 40,
            swingPhase: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 5; i++) {
        animals.push({
            type: 'butterfly',
            x: Math.random() * canvas.width,
            y: 100 + Math.random() * 150,
            vx: (Math.random() - 0.5),
            vy: (Math.random() - 0.5),
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            wingPhase: Math.random() * Math.PI * 2
        });
    }
}

function drawLayers() {
    ctx.fillStyle = '#0a1f0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const emergentGradient = ctx.createLinearGradient(0, 0, 0, 50);
    emergentGradient.addColorStop(0, '#87CEEB');
    emergentGradient.addColorStop(1, '#2d5a2d');
    ctx.fillStyle = emergentGradient;
    ctx.fillRect(0, 0, canvas.width, 50);

    for (let i = 0; i < 5; i++) {
        const x = i * 80 + 20;
        ctx.fillStyle = '#1a4d1a';
        ctx.beginPath();
        ctx.arc(x, 50, 30 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#1a3d1a';
    ctx.fillRect(0, 50, canvas.width, 50);
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `hsl(120, 40%, ${20 + Math.random() * 10}%)`;
        ctx.beginPath();
        ctx.arc(i * 50 + 20, 70 + Math.random() * 20, 25 + Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#143314';
    ctx.fillRect(0, 100, canvas.width, 100);

    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `hsl(100, 50%, ${15 + Math.random() * 10}%)`;
        const x = Math.random() * canvas.width;
        const y = 100 + Math.random() * 100;
        ctx.beginPath();
        ctx.ellipse(x, y, 20 + Math.random() * 30, 15 + Math.random() * 20, Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#0f290f';
    ctx.fillRect(0, 200, canvas.width, 100);

    for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `hsl(${80 + Math.random() * 40}, 40%, ${10 + Math.random() * 10}%)`;
        const x = Math.random() * canvas.width;
        const y = 210 + Math.random() * 80;
        ctx.beginPath();
        ctx.ellipse(x, y, 10 + Math.random() * 20, 8 + Math.random() * 15, Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 8; i++) {
        const x = i * 50 + 20;
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(x - 3, 40, 6, canvas.height - 40);
    }

    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const x = Math.random() * canvas.width;
        ctx.moveTo(x, 50);
        let y = 50;
        while (y < canvas.height) {
            y += 20;
            ctx.lineTo(x + Math.sin(y * 0.1 + time * 0.02) * 10, y);
        }
        ctx.stroke();
    }
}

function updateAnimals() {
    animals.forEach(a => {
        if (a.type === 'bird') {
            a.wingPhase += 0.2;
            a.x += a.vx;
            if (a.x < -20) a.x = canvas.width + 20;
            if (a.x > canvas.width + 20) a.x = -20;
        } else if (a.type === 'monkey') {
            a.swingPhase += 0.05;
            a.x += Math.sin(a.swingPhase) * 0.5;
        } else if (a.type === 'butterfly') {
            a.wingPhase += 0.3;
            a.x += a.vx + Math.sin(time * 0.1) * 0.3;
            a.y += a.vy + Math.cos(time * 0.1) * 0.3;

            if (a.x < 0) a.x = canvas.width;
            if (a.x > canvas.width) a.x = 0;
            if (a.y < 100) a.y = 100;
            if (a.y > 280) a.y = 280;
        }
    });
}

function drawAnimals() {
    animals.forEach(a => {
        if (a.type === 'bird') {
            const wingY = Math.sin(a.wingPhase) * 5;
            ctx.fillStyle = a.color;
            ctx.beginPath();
            ctx.ellipse(a.x, a.y, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(a.x - 3, a.y);
            ctx.lineTo(a.x - 10, a.y - 5 + wingY);
            ctx.lineTo(a.x - 3, a.y);
            ctx.lineTo(a.x + 3, a.y);
            ctx.lineTo(a.x + 10, a.y - 5 + wingY);
            ctx.fill();
        } else if (a.type === 'monkey') {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(a.x, a.y + 12, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(a.x + 20, a.y - 20, a.x + 15, a.y - 40);
            ctx.stroke();
        } else if (a.type === 'butterfly') {
            const wingAngle = Math.sin(a.wingPhase) * 0.5;
            ctx.fillStyle = a.color;

            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(wingAngle);
            ctx.beginPath();
            ctx.ellipse(-5, 0, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(-wingAngle);
            ctx.beginPath();
            ctx.ellipse(5, 0, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(a.x, a.y, 2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function updateRain() {
    if (isRaining) {
        for (let i = 0; i < 5; i++) {
            raindrops.push({
                x: Math.random() * canvas.width,
                y: 0,
                speed: 5 + Math.random() * 5,
                length: 10 + Math.random() * 10
            });
        }
    }

    for (let i = raindrops.length - 1; i >= 0; i--) {
        raindrops[i].y += raindrops[i].speed;
        if (raindrops[i].y > canvas.height) {
            raindrops.splice(i, 1);
        }
    }
}

function drawRain() {
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.lineWidth = 1;
    raindrops.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.length);
        ctx.stroke();
    });
}

function animate() {
    time++;
    drawLayers();
    updateAnimals();
    drawAnimals();
    updateRain();
    drawRain();
    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', () => {
    isRaining = !isRaining;
    document.getElementById('rainBtn').textContent = isRaining ? '停止下雨' : '下雨';
});

initAnimals();
animate();
