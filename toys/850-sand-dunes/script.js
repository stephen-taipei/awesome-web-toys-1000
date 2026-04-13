const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let sandHeights = [];
let windDirection = 1;
let windStrength = 2;
let sandParticles = [];
let time = 0;

function init() {
    sandHeights = [];
    for (let x = 0; x < canvas.width; x++) {
        sandHeights.push(canvas.height - 80 + Math.sin(x * 0.02) * 20 + Math.sin(x * 0.05) * 10);
    }
}

function updateSand() {
    for (let i = 0; i < canvas.width; i++) {
        const windEffect = windDirection * windStrength * 0.01;

        if (windDirection > 0) {
            if (i < canvas.width - 1) {
                const diff = sandHeights[i] - sandHeights[i + 1];
                if (diff < -5) {
                    sandHeights[i] += 0.1;
                    sandHeights[i + 1] -= 0.1;
                }
            }
        } else {
            if (i > 0) {
                const diff = sandHeights[i] - sandHeights[i - 1];
                if (diff < -5) {
                    sandHeights[i] += 0.1;
                    sandHeights[i - 1] -= 0.1;
                }
            }
        }
    }

    if (Math.random() < 0.3) {
        const startX = windDirection > 0 ? 0 : canvas.width;
        sandParticles.push({
            x: startX,
            y: canvas.height - 100 - Math.random() * 50,
            vx: windDirection * (2 + Math.random() * 2),
            vy: 0,
            size: 1 + Math.random() * 2
        });
    }

    for (let i = sandParticles.length - 1; i >= 0; i--) {
        const p = sandParticles[i];
        p.vy += 0.05;
        p.x += p.vx;
        p.y += p.vy;

        const groundX = Math.floor(p.x);
        if (groundX >= 0 && groundX < canvas.width) {
            if (p.y > sandHeights[groundX]) {
                sandHeights[groundX] -= 0.5;
                sandParticles.splice(i, 1);
                continue;
            }
        }

        if (p.x < 0 || p.x > canvas.width) {
            sandParticles.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FF7F50');
    gradient.addColorStop(0.3, '#FFD700');
    gradient.addColorStop(0.5, '#87CEEB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(windDirection > 0 ? canvas.width - 50 : 50, 50, 25, 0, Math.PI * 2);
    ctx.fill();
}

function drawSand() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        ctx.lineTo(x, sandHeights[x]);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
    gradient.addColorStop(0, '#F4A460');
    gradient.addColorStop(0.5, '#DEB887');
    gradient.addColorStop(1, '#D2B48C');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#CD853F';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 3) {
        const y = sandHeights[x];
        const nextY = sandHeights[x + 3] || y;
        if (Math.abs(y - nextY) > 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 3, y + (windDirection > 0 ? 2 : -2));
            ctx.stroke();
        }
    }
}

function drawSandParticles() {
    ctx.fillStyle = 'rgba(244, 164, 96, 0.8)';
    sandParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawWind() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 5; i++) {
        const y = 50 + i * 30;
        const offset = (time * 5 * windDirection) % 100;

        ctx.beginPath();
        if (windDirection > 0) {
            ctx.moveTo(offset + i * 20, y);
            ctx.lineTo(offset + i * 20 + 30, y);
            ctx.lineTo(offset + i * 20 + 25, y - 5);
            ctx.moveTo(offset + i * 20 + 30, y);
            ctx.lineTo(offset + i * 20 + 25, y + 5);
        } else {
            ctx.moveTo(canvas.width - offset - i * 20, y);
            ctx.lineTo(canvas.width - offset - i * 20 - 30, y);
            ctx.lineTo(canvas.width - offset - i * 20 - 25, y - 5);
            ctx.moveTo(canvas.width - offset - i * 20 - 30, y);
            ctx.lineTo(canvas.width - offset - i * 20 - 25, y + 5);
        }
        ctx.stroke();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 25);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`風向: ${windDirection > 0 ? '→' : '←'}`, 15, 27);
}

function animate() {
    time++;
    drawBackground();
    drawWind();
    drawSand();
    drawSandParticles();
    drawInfo();
    updateSand();
    requestAnimationFrame(animate);
}

document.getElementById('windBtn').addEventListener('click', () => {
    windDirection *= -1;
});

init();
animate();
