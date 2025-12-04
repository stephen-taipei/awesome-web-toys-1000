const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let ball, paddle, bricks;
let score = 0;
let lives = 3;
let gameOver = false;
let baseSpeed = 5;

const brickRows = 5;
const brickCols = 10;
const brickColors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'
];

class Ball {
    constructor() {
        this.reset();
        this.radius = 10;
    }

    reset() {
        this.x = width / 2;
        this.y = height - 100;
        const angle = -Math.PI / 4 + Math.random() * Math.PI / 2;
        this.vx = Math.sin(angle) * baseSpeed;
        this.vy = -Math.cos(angle) * baseSpeed;
        this.trail = [];
    }

    update() {
        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wall collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -1;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        }

        // Bottom - lose life
        if (this.y + this.radius > height) {
            lives--;
            document.getElementById('lives').textContent = lives;
            if (lives <= 0) {
                gameOver = true;
            } else {
                this.reset();
            }
        }
    }

    draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.5;
            ctx.fillStyle = `rgba(100, 181, 246, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * (i / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        }

        // Ball glow
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        glow.addColorStop(0, 'rgba(100, 181, 246, 0.5)');
        glow.addColorStop(1, 'rgba(100, 181, 246, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
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
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#64b5f6');
        gradient.addColorStop(1, '#1976d2');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Paddle {
    constructor() {
        this.width = 120;
        this.height = 15;
        this.x = width / 2;
        this.y = height - 40;
    }

    draw() {
        // Glow effect
        ctx.shadowColor = '#64b5f6';
        ctx.shadowBlur = 20;

        const gradient = ctx.createLinearGradient(
            this.x - this.width / 2, 0,
            this.x + this.width / 2, 0
        );
        gradient.addColorStop(0, '#1976d2');
        gradient.addColorStop(0.5, '#64b5f6');
        gradient.addColorStop(1, '#1976d2');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            this.height / 2
        );
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    checkCollision(ball) {
        if (ball.y + ball.radius > this.y - this.height / 2 &&
            ball.y - ball.radius < this.y + this.height / 2 &&
            ball.x > this.x - this.width / 2 &&
            ball.x < this.x + this.width / 2) {

            // Calculate bounce angle based on hit position
            const hitPos = (ball.x - this.x) / (this.width / 2);
            const maxAngle = Math.PI / 3;
            const angle = hitPos * maxAngle;

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ball.vx = Math.sin(angle) * speed;
            ball.vy = -Math.abs(Math.cos(angle) * speed);

            ball.y = this.y - this.height / 2 - ball.radius;
        }
    }
}

class Brick {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 25;
        this.color = brickColors[row % brickColors.length];
        this.alive = true;
        this.breakAnimation = 0;
    }

    draw() {
        if (!this.alive) {
            if (this.breakAnimation > 0) {
                ctx.globalAlpha = this.breakAnimation;
                this.drawBrick();
                ctx.globalAlpha = 1;
                this.breakAnimation -= 0.1;
            }
            return;
        }

        this.drawBrick();
    }

    drawBrick() {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);

        // Main brick
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.lightenColor(this.color, 20));
        gradient.addColorStop(1, this.color);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();

        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 3);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    checkCollision(ball) {
        if (!this.alive) return false;

        if (ball.x + ball.radius > this.x &&
            ball.x - ball.radius < this.x + this.width &&
            ball.y + ball.radius > this.y &&
            ball.y - ball.radius < this.y + this.height) {

            // Determine collision side
            const overlapLeft = ball.x + ball.radius - this.x;
            const overlapRight = this.x + this.width - (ball.x - ball.radius);
            const overlapTop = ball.y + ball.radius - this.y;
            const overlapBottom = this.y + this.height - (ball.y - ball.radius);

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                ball.vx *= -1;
            } else {
                ball.vy *= -1;
            }

            this.alive = false;
            this.breakAnimation = 1;
            return true;
        }
        return false;
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (paddle) {
        paddle.y = height - 40;
    }
}

function initGame() {
    score = 0;
    lives = 3;
    gameOver = false;

    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;

    ball = new Ball();
    paddle = new Paddle();

    // Create bricks
    bricks = [];
    const brickWidth = 70;
    const brickHeight = 25;
    const brickPadding = 10;
    const startX = (width - (brickCols * (brickWidth + brickPadding))) / 2;
    const startY = 80;

    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            const x = startX + col * (brickWidth + brickPadding);
            const y = startY + row * (brickHeight + brickPadding);
            bricks.push(new Brick(x, y, row));
        }
    }

    updateBrickCount();
}

function updateBrickCount() {
    const count = bricks.filter(b => b.alive).length;
    document.getElementById('brickCount').textContent = count;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('遊戲結束', width / 2, height / 2 - 30);

    ctx.font = '24px Arial';
    ctx.fillText(`最終分數: ${score}`, width / 2, height / 2 + 20);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#64b5f6';
    ctx.fillText('點擊「重新開始」繼續', width / 2, height / 2 + 60);
}

function drawWin() {
    ctx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('恭喜過關！', width / 2, height / 2 - 30);

    ctx.font = '24px Arial';
    ctx.fillText(`最終分數: ${score}`, width / 2, height / 2 + 20);
}

function animate() {
    drawBackground();

    if (!gameOver) {
        ball.update();
        paddle.checkCollision(ball);

        // Check brick collisions
        for (const brick of bricks) {
            if (brick.checkCollision(ball)) {
                score += 10;
                document.getElementById('score').textContent = score;
                updateBrickCount();
            }
        }
    }

    // Draw elements
    for (const brick of bricks) {
        brick.draw();
    }
    paddle.draw();
    ball.draw();

    // Check win condition
    const remainingBricks = bricks.filter(b => b.alive).length;
    if (remainingBricks === 0) {
        drawWin();
    } else if (gameOver) {
        drawGameOver();
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left;

    // Keep paddle within bounds
    const halfWidth = paddle.width / 2;
    if (paddle.x < halfWidth) paddle.x = halfWidth;
    if (paddle.x > width - halfWidth) paddle.x = width - halfWidth;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.touches[0].clientX - rect.left;

    const halfWidth = paddle.width / 2;
    if (paddle.x < halfWidth) paddle.x = halfWidth;
    if (paddle.x > width - halfWidth) paddle.x = width - halfWidth;
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    baseSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = baseSpeed;

    // Update ball speed while maintaining direction
    const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (currentSpeed > 0) {
        const ratio = baseSpeed / currentSpeed;
        ball.vx *= ratio;
        ball.vy *= ratio;
    }
});

document.getElementById('resetBtn').addEventListener('click', initGame);

window.addEventListener('resize', resize);

// Initialize
resize();
initGame();
animate();
