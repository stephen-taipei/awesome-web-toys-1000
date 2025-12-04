const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let balls = [];
let ballCount = 50;
let ballSize = 20;
let bounce = 0.7;
let gravity = 0.5;
let gravityX = 0;
let gravityY = gravity;

// Colors for balls
const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#ff6b9d', '#c44569', '#f368e0',
    '#ff9f43', '#ee5a24', '#10ac84', '#01a3a4', '#2e86de'
];

class Ball {
    constructor(x, y) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height * 0.3;
        this.radius = ballSize * (0.8 + Math.random() * 0.4);
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.mass = this.radius * this.radius;
    }

    update() {
        // Apply gravity
        this.vx += gravityX;
        this.vy += gravityY;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -bounce;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -bounce;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -bounce;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -bounce;

            // Friction on ground
            this.vx *= 0.98;
        }

        // Air resistance
        this.vx *= 0.999;
        this.vy *= 0.999;
    }

    draw() {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + 3, this.y + 3, this.radius, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, this.lightenColor(this.color, 40));
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.3,
            this.radius * 0.2,
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

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function initBalls() {
    balls = [];
    for (let i = 0; i < ballCount; i++) {
        balls.push(new Ball());
    }
    document.getElementById('ballCount').textContent = ballCount;
}

function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];

            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = ball1.radius + ball2.radius;

            if (dist < minDist) {
                // Collision detected
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate velocities
                const vx1 = ball1.vx * cos + ball1.vy * sin;
                const vy1 = ball1.vy * cos - ball1.vx * sin;
                const vx2 = ball2.vx * cos + ball2.vy * sin;
                const vy2 = ball2.vy * cos - ball2.vx * sin;

                // Elastic collision
                const totalMass = ball1.mass + ball2.mass;
                const newVx1 = ((ball1.mass - ball2.mass) * vx1 + 2 * ball2.mass * vx2) / totalMass;
                const newVx2 = ((ball2.mass - ball1.mass) * vx2 + 2 * ball1.mass * vx1) / totalMass;

                // Rotate back
                ball1.vx = (newVx1 * cos - vy1 * sin) * bounce;
                ball1.vy = (vy1 * cos + newVx1 * sin) * bounce;
                ball2.vx = (newVx2 * cos - vy2 * sin) * bounce;
                ball2.vy = (vy2 * cos + newVx2 * sin) * bounce;

                // Separate balls
                const overlap = minDist - dist;
                const separateX = (overlap / 2) * cos;
                const separateY = (overlap / 2) * sin;

                ball1.x -= separateX;
                ball1.y -= separateY;
                ball2.x += separateX;
                ball2.y += separateY;
            }
        }
    }
}

function shake() {
    for (const ball of balls) {
        ball.vx += (Math.random() - 0.5) * 30;
        ball.vy += (Math.random() - 0.5) * 30 - 15;
    }
}

function animate() {
    ctx.fillStyle = 'rgba(15, 15, 26, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw pit walls
    ctx.strokeStyle = 'rgba(255, 100, 150, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Update physics
    checkCollisions();

    for (const ball of balls) {
        ball.update();
    }

    // Draw balls (sorted by y for depth)
    balls.sort((a, b) => a.y - b.y);
    for (const ball of balls) {
        ball.draw();
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    if (balls.length < 300) {
        balls.push(new Ball(e.clientX, e.clientY));
        document.getElementById('ballCount').textContent = balls.length;
    }
});

// Drag to push balls
let isDragging = false;
let lastX, lastY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        for (const ball of balls) {
            const distX = e.clientX - ball.x;
            const distY = e.clientY - ball.y;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < 100) {
                const force = (100 - dist) / 100;
                ball.vx += dx * force * 0.3;
                ball.vy += dy * force * 0.3;
            }
        }

        lastX = e.clientX;
        lastY = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Device orientation for tilt
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
            gravityX = (e.gamma / 90) * gravity * 2;
            gravityY = (e.beta / 90) * gravity * 2;
        }
    });
}

document.getElementById('countSlider').addEventListener('input', (e) => {
    ballCount = parseInt(e.target.value);
    initBalls();
});

document.getElementById('sizeSlider').addEventListener('input', (e) => {
    ballSize = parseInt(e.target.value);
    for (const ball of balls) {
        ball.radius = ballSize * (0.8 + Math.random() * 0.4);
        ball.mass = ball.radius * ball.radius;
    }
});

document.getElementById('bounceSlider').addEventListener('input', (e) => {
    bounce = parseFloat(e.target.value);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    gravityY = gravity;
});

document.getElementById('shakeBtn').addEventListener('click', shake);

document.getElementById('resetBtn').addEventListener('click', initBalls);

window.addEventListener('resize', resize);

// Initialize
resize();
initBalls();
animate();
