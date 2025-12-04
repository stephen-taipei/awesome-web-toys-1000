const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let balls = [];
let trampolineNodes = [];
let bounceMultiplier = 0.95;
let surfaceElasticity = 0.15;
let gravity = 0.4;
let maxHeight = 0;

const trampolineY = 0.7;
const numNodes = 30;
const nodeRestLength = 0;

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = 0;
        this.radius = 15 + Math.random() * 10;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.squash = 1;
        this.maxHeightReached = 0;
    }

    update() {
        // Gravity
        this.vy += gravity;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Track max height
        const currentHeight = height * trampolineY - this.y;
        if (currentHeight > this.maxHeightReached) {
            this.maxHeightReached = currentHeight;
            if (currentHeight > maxHeight) {
                maxHeight = currentHeight;
            }
        }

        // Wall collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.8;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -0.8;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.8;
        }

        // Recover squash
        this.squash += (1 - this.squash) * 0.2;

        // Air resistance
        this.vx *= 0.999;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1 / this.squash, this.squash);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(3, 3, this.radius, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball gradient
        const gradient = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.3, 0,
            0, 0, this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(
            -this.radius * 0.3, -this.radius * 0.3,
            this.radius * 0.25, this.radius * 0.15,
            -0.5, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }

    darkenColor(color, percent) {
        // Parse HSL
        const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            const h = parseInt(match[1]);
            const s = parseInt(match[2]);
            const l = Math.max(0, parseInt(match[3]) - percent);
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        return color;
    }
}

class TrampolineNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.restY = y;
        this.vy = 0;
    }

    update() {
        // Spring force back to rest position
        const displacement = this.y - this.restY;
        const springForce = -surfaceElasticity * displacement;

        this.vy += springForce;
        this.vy *= 0.95; // Damping

        this.y += this.vy;
    }
}

function createTrampoline() {
    trampolineNodes = [];
    const y = height * trampolineY;
    const startX = width * 0.15;
    const endX = width * 0.85;
    const spacing = (endX - startX) / (numNodes - 1);

    for (let i = 0; i < numNodes; i++) {
        trampolineNodes.push(new TrampolineNode(startX + i * spacing, y));
    }
}

function drawTrampoline() {
    // Frame
    const frameY = height * trampolineY + 50;
    const frameWidth = width * 0.75;
    const frameX = (width - frameWidth) / 2;

    // Legs
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(frameX + 20, frameY);
    ctx.lineTo(frameX, height - 20);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(frameX + frameWidth - 20, frameY);
    ctx.lineTo(frameX + frameWidth, height - 20);
    ctx.stroke();

    // Frame bar
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(frameX, frameY);
    ctx.lineTo(frameX + frameWidth, frameY);
    ctx.stroke();

    // Springs connecting frame to surface
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;

    for (let i = 0; i < trampolineNodes.length; i += 3) {
        const node = trampolineNodes[i];
        ctx.beginPath();
        ctx.moveTo(node.x, frameY - 5);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
    }

    // Trampoline surface
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;

    // Draw surface as smooth curve
    ctx.beginPath();
    ctx.moveTo(trampolineNodes[0].x, trampolineNodes[0].y);

    for (let i = 1; i < trampolineNodes.length - 1; i++) {
        const xc = (trampolineNodes[i].x + trampolineNodes[i + 1].x) / 2;
        const yc = (trampolineNodes[i].y + trampolineNodes[i + 1].y) / 2;
        ctx.quadraticCurveTo(trampolineNodes[i].x, trampolineNodes[i].y, xc, yc);
    }
    ctx.lineTo(trampolineNodes[trampolineNodes.length - 1].x, trampolineNodes[trampolineNodes.length - 1].y);
    ctx.stroke();

    // Surface color
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.moveTo(trampolineNodes[0].x, trampolineNodes[0].y);

    for (let i = 1; i < trampolineNodes.length - 1; i++) {
        const xc = (trampolineNodes[i].x + trampolineNodes[i + 1].x) / 2;
        const yc = (trampolineNodes[i].y + trampolineNodes[i + 1].y) / 2;
        ctx.quadraticCurveTo(trampolineNodes[i].x, trampolineNodes[i].y, xc, yc);
    }
    ctx.lineTo(trampolineNodes[trampolineNodes.length - 1].x, trampolineNodes[trampolineNodes.length - 1].y);
    ctx.lineTo(trampolineNodes[trampolineNodes.length - 1].x, trampolineNodes[trampolineNodes.length - 1].y + 10);
    ctx.lineTo(trampolineNodes[0].x, trampolineNodes[0].y + 10);
    ctx.closePath();
    ctx.fill();
}

function checkTrampolineCollision(ball) {
    // Find nodes near ball
    for (let i = 0; i < trampolineNodes.length - 1; i++) {
        const n1 = trampolineNodes[i];
        const n2 = trampolineNodes[i + 1];

        // Check if ball is above this segment
        if (ball.x >= n1.x && ball.x <= n2.x) {
            // Interpolate surface height
            const t = (ball.x - n1.x) / (n2.x - n1.x);
            const surfaceY = n1.y + (n2.y - n1.y) * t;

            if (ball.y + ball.radius > surfaceY) {
                // Collision!
                ball.y = surfaceY - ball.radius;

                // Transfer momentum to trampoline
                const impactForce = Math.abs(ball.vy) * 0.5;

                // Affect nearby nodes
                for (let j = Math.max(0, i - 3); j < Math.min(trampolineNodes.length, i + 4); j++) {
                    const dist = Math.abs(j - i);
                    const influence = 1 - dist / 4;
                    trampolineNodes[j].vy += impactForce * influence;
                }

                // Bounce ball
                ball.vy = -Math.abs(ball.vy) * bounceMultiplier;

                // Squash effect
                ball.squash = 1.3;

                // Add some of trampoline's velocity
                const avgNodeVy = (n1.vy + n2.vy) / 2;
                ball.vy -= avgNodeVy * 2;
            }
        }
    }
}

function propagateWaves() {
    // Wave propagation between nodes
    for (let i = 1; i < trampolineNodes.length - 1; i++) {
        const prev = trampolineNodes[i - 1];
        const curr = trampolineNodes[i];
        const next = trampolineNodes[i + 1];

        const avgY = (prev.y + next.y) / 2;
        curr.vy += (avgY - curr.y) * 0.1;
    }
}

function dropBall() {
    if (balls.length < 20) {
        const x = width * 0.3 + Math.random() * width * 0.4;
        balls.push(new Ball(x, 50));
        updateStats();
    }
}

function updateStats() {
    document.getElementById('ballCount').textContent = balls.length;
    document.getElementById('maxHeight').textContent = Math.round(maxHeight) + ' px';
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createTrampoline();
}

function animate() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a3a2a');
    bgGradient.addColorStop(1, '#0f1f17');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Update trampoline
    for (const node of trampolineNodes) {
        node.update();
    }
    propagateWaves();

    // Update balls
    for (const ball of balls) {
        ball.update();
        checkTrampolineCollision(ball);
    }

    // Ball-ball collision
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0) {
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Simple elastic collision
                const vx1 = b1.vx * cos + b1.vy * sin;
                const vy1 = b1.vy * cos - b1.vx * sin;
                const vx2 = b2.vx * cos + b2.vy * sin;
                const vy2 = b2.vy * cos - b2.vx * sin;

                b1.vx = vx2 * cos - vy1 * sin;
                b1.vy = vy1 * cos + vx2 * sin;
                b2.vx = vx1 * cos - vy2 * sin;
                b2.vy = vy2 * cos + vx1 * sin;

                // Separate
                const overlap = minDist - dist;
                b1.x -= (overlap / 2) * cos;
                b1.y -= (overlap / 2) * sin;
                b2.x += (overlap / 2) * cos;
                b2.y += (overlap / 2) * sin;
            }
        }
    }

    // Draw trampoline
    drawTrampoline();

    // Draw balls (sorted by y for layering)
    balls.sort((a, b) => a.y - b.y);
    for (const ball of balls) {
        ball.draw();
    }

    // Remove balls that fell off
    balls = balls.filter(b => b.y < height + 100);
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (balls.length < 20 && y < height * trampolineY - 50) {
        balls.push(new Ball(x, y));
        updateStats();
    }
});

document.getElementById('bounceSlider').addEventListener('input', (e) => {
    bounceMultiplier = parseFloat(e.target.value);
    document.getElementById('bounceValue').textContent = bounceMultiplier.toFixed(2);
});

document.getElementById('surfaceSlider').addEventListener('input', (e) => {
    surfaceElasticity = parseFloat(e.target.value);
    document.getElementById('surfaceValue').textContent = surfaceElasticity.toFixed(2);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

document.getElementById('dropBtn').addEventListener('click', dropBall);

document.getElementById('resetBtn').addEventListener('click', () => {
    balls = [];
    maxHeight = 0;
    createTrampoline();
    updateStats();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
