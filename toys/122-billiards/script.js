const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Table dimensions
const tableWidth = 800;
const tableHeight = 400;
const pocketRadius = 20;
const ballRadius = 12;
const cushionWidth = 15;

canvas.width = tableWidth;
canvas.height = tableHeight;

let balls = [];
let cueBall = null;
let friction = 0.99;
let pocketedCount = 0;

// Aiming
let isAiming = false;
let aimStartX, aimStartY;
let power = 0;

// Pocket positions
const pockets = [
    { x: pocketRadius, y: pocketRadius },
    { x: tableWidth / 2, y: 0 },
    { x: tableWidth - pocketRadius, y: pocketRadius },
    { x: pocketRadius, y: tableHeight - pocketRadius },
    { x: tableWidth / 2, y: tableHeight },
    { x: tableWidth - pocketRadius, y: tableHeight - pocketRadius }
];

// Ball colors
const ballColors = [
    '#ffff00', // 1 - yellow
    '#0000ff', // 2 - blue
    '#ff0000', // 3 - red
    '#800080', // 4 - purple
    '#ff8c00', // 5 - orange
    '#008000', // 6 - green
    '#8b0000', // 7 - maroon
    '#000000', // 8 - black
    '#ffff00', // 9 - yellow stripe
    '#0000ff', // 10 - blue stripe
    '#ff0000', // 11 - red stripe
    '#800080', // 12 - purple stripe
    '#ff8c00', // 13 - orange stripe
    '#008000', // 14 - green stripe
    '#8b0000'  // 15 - maroon stripe
];

class Ball {
    constructor(x, y, number) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = ballRadius;
        this.number = number;
        this.color = number === 0 ? '#ffffff' : ballColors[(number - 1) % ballColors.length];
        this.isStriped = number > 8;
        this.isPocketed = false;
    }

    update() {
        if (this.isPocketed) return;

        this.x += this.vx;
        this.y += this.vy;

        // Cushion collision
        if (this.x - this.radius < cushionWidth) {
            this.x = cushionWidth + this.radius;
            this.vx *= -0.9;
        }
        if (this.x + this.radius > tableWidth - cushionWidth) {
            this.x = tableWidth - cushionWidth - this.radius;
            this.vx *= -0.9;
        }
        if (this.y - this.radius < cushionWidth) {
            this.y = cushionWidth + this.radius;
            this.vy *= -0.9;
        }
        if (this.y + this.radius > tableHeight - cushionWidth) {
            this.y = tableHeight - cushionWidth - this.radius;
            this.vy *= -0.9;
        }

        // Friction
        this.vx *= friction;
        this.vy *= friction;

        // Stop if very slow
        if (Math.abs(this.vx) < 0.01) this.vx = 0;
        if (Math.abs(this.vy) < 0.01) this.vy = 0;

        // Check pockets
        for (const pocket of pockets) {
            const dx = this.x - pocket.x;
            const dy = this.y - pocket.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < pocketRadius) {
                this.isPocketed = true;
                if (this.number !== 0) {
                    pocketedCount++;
                    document.getElementById('pocketedCount').textContent = pocketedCount;
                }
            }
        }
    }

    draw() {
        if (this.isPocketed) return;

        // Ball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + 2, this.y + 2, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball body
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );

        if (this.number === 0) {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#cccccc');
        } else {
            gradient.addColorStop(0, this.lightenColor(this.color, 30));
            gradient.addColorStop(1, this.color);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Stripe for balls 9-15
        if (this.isStriped) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Number circle (except cue ball)
        if (this.number > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Number
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${this.radius * 0.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.number.toString(), this.x, this.y);
        }

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.25,
            this.radius * 0.15,
            -0.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    isMoving() {
        return Math.abs(this.vx) > 0.01 || Math.abs(this.vy) > 0.01;
    }
}

function initBalls() {
    balls = [];
    pocketedCount = 0;
    document.getElementById('pocketedCount').textContent = '0';

    // Cue ball
    cueBall = new Ball(tableWidth * 0.25, tableHeight / 2, 0);
    balls.push(cueBall);

    // Rack position
    const rackX = tableWidth * 0.7;
    const rackY = tableHeight / 2;
    const spacing = ballRadius * 2.1;

    // Triangle rack
    const rackOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let ballIndex = 0;

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            if (ballIndex < rackOrder.length) {
                const x = rackX + row * spacing * 0.866;
                const y = rackY + (col - row / 2) * spacing;
                balls.push(new Ball(x, y, rackOrder[ballIndex]));
                ballIndex++;
            }
        }
    }
}

function checkBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (balls[i].isPocketed || balls[j].isPocketed) continue;

            const dx = balls[j].x - balls[i].x;
            const dy = balls[j].y - balls[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = balls[i].radius + balls[j].radius;

            if (dist < minDist && dist > 0) {
                // Collision response
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate velocities
                const vx1 = balls[i].vx * cos + balls[i].vy * sin;
                const vy1 = balls[i].vy * cos - balls[i].vx * sin;
                const vx2 = balls[j].vx * cos + balls[j].vy * sin;
                const vy2 = balls[j].vy * cos - balls[j].vx * sin;

                // Elastic collision (equal mass)
                const newVx1 = vx2;
                const newVx2 = vx1;

                // Rotate back
                balls[i].vx = newVx1 * cos - vy1 * sin;
                balls[i].vy = vy1 * cos + newVx1 * sin;
                balls[j].vx = newVx2 * cos - vy2 * sin;
                balls[j].vy = vy2 * cos + newVx2 * sin;

                // Separate balls
                const overlap = minDist - dist;
                balls[i].x -= (overlap / 2) * cos;
                balls[i].y -= (overlap / 2) * sin;
                balls[j].x += (overlap / 2) * cos;
                balls[j].y += (overlap / 2) * sin;
            }
        }
    }
}

function drawTable() {
    // Green felt
    ctx.fillStyle = '#0a5c36';
    ctx.fillRect(0, 0, tableWidth, tableHeight);

    // Felt texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < 500; i++) {
        ctx.fillRect(
            Math.random() * tableWidth,
            Math.random() * tableHeight,
            1, 1
        );
    }

    // Cushions
    ctx.fillStyle = '#2d8b4e';
    ctx.fillRect(0, 0, tableWidth, cushionWidth);
    ctx.fillRect(0, tableHeight - cushionWidth, tableWidth, cushionWidth);
    ctx.fillRect(0, 0, cushionWidth, tableHeight);
    ctx.fillRect(tableWidth - cushionWidth, 0, cushionWidth, tableHeight);

    // Pockets
    ctx.fillStyle = '#000000';
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pocket inner shadow
    for (const pocket of pockets) {
        const gradient = ctx.createRadialGradient(
            pocket.x, pocket.y, pocketRadius * 0.5,
            pocket.x, pocket.y, pocketRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAimLine() {
    if (!isAiming || !cueBall || cueBall.isPocketed) return;

    const dx = aimStartX - cueBall.x;
    const dy = aimStartY - cueBall.y;

    // Cue stick
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cueBall.x + dx * 0.3, cueBall.y + dy * 0.3);
    ctx.lineTo(cueBall.x + dx * 2, cueBall.y + dy * 2);
    ctx.stroke();

    // Cue tip
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cueBall.x + dx * 0.2, cueBall.y + dy * 0.2);
    ctx.lineTo(cueBall.x + dx * 0.3, cueBall.y + dy * 0.3);
    ctx.stroke();

    // Aim line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cueBall.x, cueBall.y);
    ctx.lineTo(cueBall.x - dx * 5, cueBall.y - dy * 5);
    ctx.stroke();
    ctx.setLineDash([]);
}

function allBallsStopped() {
    return balls.every(ball => !ball.isMoving());
}

function animate() {
    drawTable();

    checkBallCollisions();

    for (const ball of balls) {
        ball.update();
        ball.draw();
    }

    drawAimLine();

    // Reset cue ball if pocketed
    if (cueBall && cueBall.isPocketed) {
        setTimeout(() => {
            cueBall.isPocketed = false;
            cueBall.x = tableWidth * 0.25;
            cueBall.y = tableHeight / 2;
            cueBall.vx = 0;
            cueBall.vy = 0;
        }, 500);
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    if (!allBallsStopped()) return;
    if (!cueBall || cueBall.isPocketed) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - cueBall.x;
    const dy = y - cueBall.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < cueBall.radius * 3) {
        isAiming = true;
        aimStartX = cueBall.x;
        aimStartY = cueBall.y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isAiming) return;

    const rect = canvas.getBoundingClientRect();
    aimStartX = e.clientX - rect.left;
    aimStartY = e.clientY - rect.top;

    const dx = aimStartX - cueBall.x;
    const dy = aimStartY - cueBall.y;
    power = Math.min(100, Math.sqrt(dx * dx + dy * dy) / 2);

    document.getElementById('powerValue').textContent = Math.round(power);
    document.getElementById('powerFill').style.width = power + '%';
});

canvas.addEventListener('mouseup', () => {
    if (!isAiming) return;

    const dx = aimStartX - cueBall.x;
    const dy = aimStartY - cueBall.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
        const force = power * 0.15;
        cueBall.vx = -dx / dist * force;
        cueBall.vy = -dy / dist * force;
    }

    isAiming = false;
    power = 0;
    document.getElementById('powerValue').textContent = '0';
    document.getElementById('powerFill').style.width = '0%';
});

document.getElementById('frictionSlider').addEventListener('input', (e) => {
    friction = parseFloat(e.target.value);
});

document.getElementById('resetBtn').addEventListener('click', initBalls);

// Initialize
initBalls();
animate();
