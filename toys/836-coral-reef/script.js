const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let corals = [];
let fish = [];
let bubbles = [];
let time = 0;

function initCorals() {
    corals = [];
    const coralColors = ['#FF6B6B', '#FF8E72', '#FFB347', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2'];

    for (let i = 0; i < 8; i++) {
        corals.push({
            x: 30 + i * 45,
            y: canvas.height - 30,
            type: Math.floor(Math.random() * 4),
            color: coralColors[Math.floor(Math.random() * coralColors.length)],
            height: 30 + Math.random() * 50,
            width: 20 + Math.random() * 20,
            branches: Math.floor(3 + Math.random() * 4),
            swayPhase: Math.random() * Math.PI * 2
        });
    }
}

function initFish() {
    fish = [];
    for (let i = 0; i < 10; i++) {
        fish.push({
            x: Math.random() * canvas.width,
            y: 50 + Math.random() * 150,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            size: 8 + Math.random() * 8,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            tailPhase: Math.random() * Math.PI * 2
        });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006994');
    gradient.addColorStop(0.5, '#004d6d');
    gradient.addColorStop(1, '#003547');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(255, 255, 200, ${0.05 + Math.sin(time * 0.02 + i) * 0.03})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo((i + 1) * 80 + Math.sin(time * 0.01 + i) * 20, 0);
        ctx.lineTo((i + 1) * 100 + Math.sin(time * 0.01 + i) * 30, canvas.height);
        ctx.lineTo(i * 60, canvas.height);
        ctx.fill();
    }

    ctx.fillStyle = '#c2b280';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
}

function drawCoral(coral) {
    const sway = Math.sin(time * 0.02 + coral.swayPhase) * 3;

    ctx.save();
    ctx.translate(coral.x, coral.y);

    if (coral.type === 0) {
        for (let i = 0; i < coral.branches; i++) {
            const angle = -Math.PI / 2 + (i - coral.branches / 2) * 0.3;
            const branchSway = sway * (i % 2 === 0 ? 1 : -1);

            ctx.strokeStyle = coral.color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                Math.cos(angle) * coral.height * 0.5 + branchSway,
                Math.sin(angle) * coral.height * 0.5,
                Math.cos(angle) * coral.height + branchSway * 2,
                Math.sin(angle) * coral.height
            );
            ctx.stroke();

            ctx.fillStyle = coral.color;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * coral.height + branchSway * 2, Math.sin(angle) * coral.height, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (coral.type === 1) {
        ctx.fillStyle = coral.color;
        for (let i = 0; i < 5; i++) {
            const bx = (i - 2) * 10 + sway;
            const by = -Math.random() * coral.height;
            ctx.beginPath();
            ctx.arc(bx, by, 8 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (coral.type === 2) {
        ctx.fillStyle = coral.color;
        ctx.beginPath();
        ctx.moveTo(-coral.width / 2 + sway, 0);
        ctx.lineTo(sway * 1.5, -coral.height);
        ctx.lineTo(coral.width / 2 + sway, 0);
        ctx.fill();
    } else {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tentacleSway = Math.sin(time * 0.03 + i) * 5;
            ctx.strokeStyle = coral.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.quadraticCurveTo(
                Math.cos(angle) * 15 + tentacleSway,
                -10 + Math.sin(angle) * 15,
                Math.cos(angle) * 25 + tentacleSway * 2,
                -10 + Math.sin(angle) * 25
            );
            ctx.stroke();
        }

        ctx.fillStyle = coral.color;
        ctx.beginPath();
        ctx.arc(0, -10, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function updateFish() {
    fish.forEach(f => {
        f.tailPhase += 0.3;
        f.x += f.vx;
        f.y += Math.sin(time * 0.05 + f.tailPhase) * 0.3;

        if (f.x < -20) f.x = canvas.width + 20;
        if (f.x > canvas.width + 20) f.x = -20;
    });
}

function drawFish() {
    fish.forEach(f => {
        const dir = f.vx > 0 ? 1 : -1;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(dir, 1);

        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const tailWag = Math.sin(f.tailPhase) * 0.3;
        ctx.beginPath();
        ctx.moveTo(-f.size * 0.7, 0);
        ctx.lineTo(-f.size * 1.3, -f.size * 0.4 + tailWag * f.size);
        ctx.lineTo(-f.size * 1.3, f.size * 0.4 + tailWag * f.size);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(f.size * 0.3, -f.size * 0.1, f.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(f.size * 0.35, -f.size * 0.1, f.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function updateBubbles() {
    if (Math.random() < 0.05) {
        bubbles.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 30,
            size: 2 + Math.random() * 4,
            speed: 0.5 + Math.random()
        });
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y -= bubbles[i].speed;
        bubbles[i].x += Math.sin(time * 0.1 + i) * 0.3;
        if (bubbles[i].y < 0) bubbles.splice(i, 1);
    }
}

function drawBubbles() {
    bubbles.forEach(b => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function growCoral() {
    const x = 30 + Math.random() * (canvas.width - 60);
    const coralColors = ['#FF6B6B', '#FF8E72', '#FFB347', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2'];

    corals.push({
        x: x,
        y: canvas.height - 30,
        type: Math.floor(Math.random() * 4),
        color: coralColors[Math.floor(Math.random() * coralColors.length)],
        height: 30 + Math.random() * 50,
        width: 20 + Math.random() * 20,
        branches: Math.floor(3 + Math.random() * 4),
        swayPhase: Math.random() * Math.PI * 2
    });
}

function animate() {
    time++;
    drawBackground();
    corals.forEach(c => drawCoral(c));
    updateFish();
    drawFish();
    updateBubbles();
    drawBubbles();
    requestAnimationFrame(animate);
}

document.getElementById('growBtn').addEventListener('click', growCoral);

initCorals();
initFish();
animate();
