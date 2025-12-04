const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tableWidth = 400;
const tableHeight = 700;

canvas.width = tableWidth;
canvas.height = tableHeight;

let ball = null;
let score = 0;
let highScore = 0;
let ballsRemaining = 3;
let isLaunching = false;
let launchPower = 0;

const gravity = 0.15;
const ballRadius = 10;

// Flippers
const flippers = {
    left: {
        x: 120,
        y: tableHeight - 100,
        angle: 0.3,
        targetAngle: 0.3,
        length: 60,
        width: 12
    },
    right: {
        x: tableWidth - 120,
        y: tableHeight - 100,
        angle: Math.PI - 0.3,
        targetAngle: Math.PI - 0.3,
        length: 60,
        width: 12
    }
};

// Bumpers
const bumpers = [
    { x: tableWidth / 2, y: 180, radius: 25, score: 100, hit: 0 },
    { x: tableWidth / 2 - 70, y: 250, radius: 25, score: 100, hit: 0 },
    { x: tableWidth / 2 + 70, y: 250, radius: 25, score: 100, hit: 0 },
    { x: tableWidth / 2, y: 320, radius: 20, score: 150, hit: 0 }
];

// Targets
const targets = [
    { x: 50, y: 200, width: 10, height: 40, score: 50, hit: false },
    { x: tableWidth - 60, y: 200, width: 10, height: 40, score: 50, hit: false },
    { x: 50, y: 350, width: 10, height: 40, score: 50, hit: false },
    { x: tableWidth - 60, y: 350, width: 10, height: 40, score: 50, hit: false }
];

// Launch lane
const launchLane = {
    x: tableWidth - 30,
    width: 25,
    springY: tableHeight - 50
};

class Ball {
    constructor() {
        this.x = tableWidth - 30;
        this.y = tableHeight - 80;
        this.vx = 0;
        this.vy = 0;
        this.radius = ballRadius;
        this.inLauncher = true;
    }

    update() {
        if (this.inLauncher) return;

        // Gravity
        this.vy += gravity;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.8;
        }
        if (this.x + this.radius > tableWidth - launchLane.width - 5) {
            // Check if in launch lane area
            if (this.y > tableHeight - 200) {
                // Allow ball to enter launcher area from top
                if (this.x + this.radius > tableWidth) {
                    this.x = tableWidth - this.radius;
                    this.vx *= -0.8;
                }
            } else {
                this.x = tableWidth - launchLane.width - 5 - this.radius;
                this.vx *= -0.8;
            }
        }

        // Top wall
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.8;
        }

        // Check if ball is lost
        if (this.y > tableHeight + 50) {
            return true; // Ball lost
        }

        // Air resistance
        this.vx *= 0.999;
        this.vy *= 0.999;

        return false;
    }

    draw() {
        // Glow
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#c0c0c0');
        gradient.addColorStop(1, '#808080');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTable() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, tableHeight);
    bgGradient.addColorStop(0, '#1a1a3e');
    bgGradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, tableWidth, tableHeight);

    // Decorative lines
    ctx.strokeStyle = 'rgba(255, 100, 150, 0.2)';
    ctx.lineWidth = 2;

    // Arc at top
    ctx.beginPath();
    ctx.arc(tableWidth / 2, 0, 150, 0, Math.PI);
    ctx.stroke();

    // Side rails
    ctx.beginPath();
    ctx.moveTo(30, 100);
    ctx.lineTo(30, tableHeight - 150);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tableWidth - launchLane.width - 35, 100);
    ctx.lineTo(tableWidth - launchLane.width - 35, tableHeight - 150);
    ctx.stroke();

    // Launch lane
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(tableWidth - launchLane.width - 5, 100, launchLane.width + 5, tableHeight - 100);

    ctx.strokeStyle = '#4a4a6e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tableWidth - launchLane.width - 5, 100);
    ctx.lineTo(tableWidth - launchLane.width - 5, tableHeight);
    ctx.stroke();

    // Drain area
    ctx.fillStyle = '#0a0a1e';
    ctx.beginPath();
    ctx.moveTo(0, tableHeight);
    ctx.lineTo(flippers.left.x - 40, tableHeight - 80);
    ctx.lineTo(flippers.left.x - 20, tableHeight - 100);
    ctx.lineTo(0, tableHeight - 50);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(tableWidth - launchLane.width - 5, tableHeight);
    ctx.lineTo(flippers.right.x + 40, tableHeight - 80);
    ctx.lineTo(flippers.right.x + 20, tableHeight - 100);
    ctx.lineTo(tableWidth - launchLane.width - 5, tableHeight - 50);
    ctx.closePath();
    ctx.fill();
}

function drawBumpers() {
    for (const bumper of bumpers) {
        // Hit animation
        const scale = 1 + bumper.hit * 0.2;
        bumper.hit *= 0.9;

        // Glow
        const glow = ctx.createRadialGradient(
            bumper.x, bumper.y, bumper.radius * 0.5 * scale,
            bumper.x, bumper.y, bumper.radius * 1.5 * scale
        );
        glow.addColorStop(0, `rgba(255, 100, 150, ${0.3 + bumper.hit * 0.5})`);
        glow.addColorStop(1, 'rgba(255, 100, 150, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.radius * 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Bumper body
        const gradient = ctx.createRadialGradient(
            bumper.x - bumper.radius * 0.3,
            bumper.y - bumper.radius * 0.3,
            0,
            bumper.x,
            bumper.y,
            bumper.radius * scale
        );
        gradient.addColorStop(0, '#ff9fbd');
        gradient.addColorStop(0.7, '#ff6b9d');
        gradient.addColorStop(1, '#c44569');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.radius * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Score text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bumper.score.toString(), bumper.x, bumper.y);
    }
}

function drawTargets() {
    for (const target of targets) {
        if (target.hit) {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
        } else {
            const gradient = ctx.createLinearGradient(target.x, target.y, target.x + target.width, target.y);
            gradient.addColorStop(0, '#feca57');
            gradient.addColorStop(1, '#ff9f43');
            ctx.fillStyle = gradient;
        }

        ctx.fillRect(target.x, target.y, target.width, target.height);

        ctx.strokeStyle = target.hit ? '#4a4' : '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(target.x, target.y, target.width, target.height);
    }
}

function drawFlippers() {
    for (const key in flippers) {
        const flipper = flippers[key];

        // Animate flipper
        const angleDiff = flipper.targetAngle - flipper.angle;
        flipper.angle += angleDiff * 0.3;

        ctx.save();
        ctx.translate(flipper.x, flipper.y);
        ctx.rotate(flipper.angle);

        // Flipper shape
        const gradient = ctx.createLinearGradient(0, -flipper.width / 2, 0, flipper.width / 2);
        gradient.addColorStop(0, '#ff6b9d');
        gradient.addColorStop(0.5, '#ff9fbd');
        gradient.addColorStop(1, '#c44569');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -flipper.width / 2);
        ctx.lineTo(flipper.length, -flipper.width / 4);
        ctx.lineTo(flipper.length, flipper.width / 4);
        ctx.lineTo(0, flipper.width / 2);
        ctx.arc(0, 0, flipper.width / 2, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

function drawLauncher() {
    // Spring
    const springHeight = 40 + launchPower * 0.3;
    const springY = tableHeight - 20 - springHeight;

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    ctx.beginPath();

    for (let i = 0; i < 8; i++) {
        const y = springY + (i / 8) * springHeight;
        const x = tableWidth - 17 + (i % 2 === 0 ? -5 : 5);
        if (i === 0) {
            ctx.moveTo(tableWidth - 17, y);
        }
        ctx.lineTo(x, y);
    }
    ctx.lineTo(tableWidth - 17, tableHeight - 20);
    ctx.stroke();

    // Plunger
    ctx.fillStyle = '#c44569';
    ctx.fillRect(tableWidth - 25, springY - 15, 16, 20);

    // Power indicator
    if (isLaunching) {
        ctx.fillStyle = `rgba(255, ${255 - launchPower * 2}, 100, 0.8)`;
        ctx.fillRect(tableWidth - 22, springY - 50, 10, -launchPower * 0.5);
    }
}

function checkBumperCollision() {
    if (!ball || ball.inLauncher) return;

    for (const bumper of bumpers) {
        const dx = ball.x - bumper.x;
        const dy = ball.y - bumper.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + bumper.radius;

        if (dist < minDist) {
            // Bounce
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const newSpeed = Math.max(speed, 8);

            ball.vx = Math.cos(angle) * newSpeed;
            ball.vy = Math.sin(angle) * newSpeed;

            ball.x = bumper.x + Math.cos(angle) * minDist;
            ball.y = bumper.y + Math.sin(angle) * minDist;

            // Score and animation
            score += bumper.score;
            bumper.hit = 1;
            updateScore();
        }
    }
}

function checkTargetCollision() {
    if (!ball || ball.inLauncher) return;

    for (const target of targets) {
        if (target.hit) continue;

        if (ball.x + ball.radius > target.x &&
            ball.x - ball.radius < target.x + target.width &&
            ball.y + ball.radius > target.y &&
            ball.y - ball.radius < target.y + target.height) {

            target.hit = true;
            score += target.score;
            ball.vx *= -0.8;
            updateScore();
        }
    }
}

function checkFlipperCollision() {
    if (!ball || ball.inLauncher) return;

    for (const key in flippers) {
        const flipper = flippers[key];

        // Transform ball to flipper space
        const cos = Math.cos(-flipper.angle);
        const sin = Math.sin(-flipper.angle);
        const dx = ball.x - flipper.x;
        const dy = ball.y - flipper.y;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Check collision with flipper rectangle
        if (localX > -ball.radius && localX < flipper.length + ball.radius &&
            localY > -flipper.width / 2 - ball.radius && localY < flipper.width / 2 + ball.radius) {

            // Bounce
            const flipperSpeed = (flipper.targetAngle - flipper.angle) * 50;
            const bounceAngle = flipper.angle - Math.PI / 2;

            ball.vy = -Math.abs(ball.vy) * 0.8 + flipperSpeed;
            ball.vx += Math.cos(bounceAngle) * Math.abs(flipperSpeed) * 0.5;

            // Push out
            ball.y = flipper.y + Math.sin(flipper.angle) * (localX) - flipper.width / 2 - ball.radius - 2;
        }
    }
}

function launchBall() {
    if (ball && ball.inLauncher && launchPower > 20) {
        ball.inLauncher = false;
        ball.vy = -launchPower * 0.15;
        ball.vx = -2;
    }
    launchPower = 0;
    isLaunching = false;
}

function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function resetTargets() {
    for (const target of targets) {
        target.hit = false;
    }
}

function loseLife() {
    ballsRemaining--;
    document.getElementById('balls').textContent = ballsRemaining;

    if (ballsRemaining > 0) {
        ball = new Ball();
        resetTargets();
    } else {
        ball = null;
    }
}

function resetGame() {
    score = 0;
    ballsRemaining = 3;
    ball = new Ball();
    resetTargets();
    updateScore();
    document.getElementById('balls').textContent = ballsRemaining;
}

function animate() {
    drawTable();
    drawBumpers();
    drawTargets();
    drawFlippers();
    drawLauncher();

    if (ball) {
        const lost = ball.update();
        if (lost) {
            loseLife();
        } else {
            checkBumperCollision();
            checkTargetCollision();
            checkFlipperCollision();
            ball.draw();
        }
    }

    // Update launch power
    if (isLaunching) {
        launchPower = Math.min(100, launchPower + 2);
    }

    requestAnimationFrame(animate);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        flippers.left.targetAngle = -0.5;
    }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        flippers.right.targetAngle = Math.PI + 0.5;
    }
    if (e.code === 'Space') {
        e.preventDefault();
        if (ball && ball.inLauncher) {
            isLaunching = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        flippers.left.targetAngle = 0.3;
    }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        flippers.right.targetAngle = Math.PI - 0.3;
    }
    if (e.code === 'Space') {
        launchBall();
    }
});

document.getElementById('launchBtn').addEventListener('mousedown', () => {
    if (ball && ball.inLauncher) {
        isLaunching = true;
    }
});

document.getElementById('launchBtn').addEventListener('mouseup', launchBall);
document.getElementById('launchBtn').addEventListener('mouseleave', () => {
    if (isLaunching) launchBall();
});

document.getElementById('resetBtn').addEventListener('click', resetGame);

// Touch support for flippers
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const touch of e.touches) {
        if (touch.clientX < window.innerWidth / 2) {
            flippers.left.targetAngle = -0.5;
        } else {
            flippers.right.targetAngle = Math.PI + 0.5;
        }
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    flippers.left.targetAngle = 0.3;
    flippers.right.targetAngle = Math.PI - 0.3;
});

// Initialize
resetGame();
animate();
