const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const spawnBtn = document.getElementById('spawnBtn');

let balls = [];
let lines = [];
let currentLine = [];
let drawing = false;

const gravity = 0.3;
const bounce = 0.7;
const friction = 0.99;

function spawnBall() {
    balls.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: 30,
        vx: (Math.random() - 0.5) * 4,
        vy: 0,
        radius: 15,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
    });
}

function update() {
    balls.forEach(ball => {
        ball.vy += gravity;
        ball.vx *= friction;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall collision
        if (ball.x < ball.radius) { ball.x = ball.radius; ball.vx *= -bounce; }
        if (ball.x > canvas.width - ball.radius) { ball.x = canvas.width - ball.radius; ball.vx *= -bounce; }

        // Floor collision
        if (ball.y > canvas.height - ball.radius) {
            ball.y = canvas.height - ball.radius;
            ball.vy *= -bounce;
        }

        // Line collision
        lines.forEach(line => {
            for (let i = 1; i < line.length; i++) {
                const x1 = line[i-1].x, y1 = line[i-1].y;
                const x2 = line[i].x, y2 = line[i].y;

                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx*dx + dy*dy);
                if (len === 0) continue;

                const nx = -dy / len;
                const ny = dx / len;

                const px = ball.x - x1;
                const py = ball.y - y1;
                const proj = (px * dx + py * dy) / len;

                if (proj >= 0 && proj <= len) {
                    const dist = px * nx + py * ny;
                    if (Math.abs(dist) < ball.radius + 3) {
                        // Push ball out
                        ball.x += nx * (ball.radius + 3 - Math.abs(dist)) * Math.sign(dist);
                        ball.y += ny * (ball.radius + 3 - Math.abs(dist)) * Math.sign(dist);

                        // Reflect velocity
                        const dot = ball.vx * nx + ball.vy * ny;
                        ball.vx -= 2 * dot * nx * bounce;
                        ball.vy -= 2 * dot * ny * bounce;

                        // Add some slide
                        ball.vx += dx / len * 0.3;
                        ball.vy += dy / len * 0.3;
                    }
                }
            }
        });
    });

    // Remove balls that are off screen
    balls = balls.filter(b => b.y < canvas.height + 100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    lines.forEach(line => {
        if (line.length > 1) {
            ctx.beginPath();
            ctx.moveTo(line[0].x, line[0].y);
            line.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }
    });

    // Current drawing line
    if (currentLine.length > 1) {
        ctx.strokeStyle = '#00b894';
        ctx.beginPath();
        ctx.moveTo(currentLine[0].x, currentLine[0].y);
        currentLine.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }

    // Draw balls
    balls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(ball.x - 4, ball.y - 4, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

function simplifyLine(line) {
    if (line.length < 3) return line;
    const simplified = [line[0]];
    for (let i = 1; i < line.length - 1; i++) {
        if (i % 3 === 0) simplified.push(line[i]);
    }
    simplified.push(line[line.length - 1]);
    return simplified;
}

canvas.addEventListener('mousedown', (e) => { drawing = true; currentLine = [getPos(e)]; });
canvas.addEventListener('mousemove', (e) => { if (drawing) currentLine.push(getPos(e)); });
canvas.addEventListener('mouseup', () => {
    if (currentLine.length > 1) lines.push(simplifyLine(currentLine));
    drawing = false;
    currentLine = [];
});

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; currentLine = [getPos(e)]; });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) currentLine.push(getPos(e)); });
canvas.addEventListener('touchend', () => {
    if (currentLine.length > 1) lines.push(simplifyLine(currentLine));
    drawing = false;
    currentLine = [];
});

clearBtn.addEventListener('click', () => { lines = []; balls = []; });
spawnBtn.addEventListener('click', spawnBall);

// Start with a ball
spawnBall();

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
