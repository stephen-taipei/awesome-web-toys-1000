const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let bullets = [];
let walls = [];
let speed = 20;
let bulletCount = 5;
let collisionMode = 'ccd';
let collisionCounter = 0;
let tunnelCounter = 0;

class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 8;
        this.color = `hsl(${Math.random() * 60 + 20}, 100%, 60%)`;
        this.trail = [];
        this.active = true;
        this.bounceCount = 0;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) this.trail.shift();

        if (collisionMode === 'ccd') {
            this.updateCCD();
        } else {
            this.updateDiscrete();
        }
    }

    updateCCD() {
        // Continuous collision detection
        let remainingTime = 1.0;
        let iterations = 0;
        const maxIterations = 10;

        while (remainingTime > 0.001 && iterations < maxIterations) {
            let earliestTime = remainingTime;
            let collisionWall = null;
            let collisionNormal = null;

            // Check walls
            for (const wall of walls) {
                const collision = this.checkWallCollisionTime(wall, remainingTime);
                if (collision && collision.time < earliestTime) {
                    earliestTime = collision.time;
                    collisionWall = wall;
                    collisionNormal = collision.normal;
                }
            }

            // Check canvas boundaries
            const boundaryCollision = this.checkBoundaryCollisionTime(remainingTime);
            if (boundaryCollision && boundaryCollision.time < earliestTime) {
                earliestTime = boundaryCollision.time;
                collisionWall = null;
                collisionNormal = boundaryCollision.normal;
            }

            // Move to collision point
            this.x += this.vx * earliestTime;
            this.y += this.vy * earliestTime;
            remainingTime -= earliestTime;

            // Handle collision
            if (collisionNormal) {
                // Reflect velocity
                const dot = this.vx * collisionNormal.x + this.vy * collisionNormal.y;
                this.vx -= 2 * dot * collisionNormal.x;
                this.vy -= 2 * dot * collisionNormal.y;

                // Damping
                this.vx *= 0.95;
                this.vy *= 0.95;

                this.bounceCount++;
                collisionCounter++;
                updateStats();
            }

            iterations++;
        }

        // Move remaining distance
        this.x += this.vx * remainingTime;
        this.y += this.vy * remainingTime;
    }

    updateDiscrete() {
        // Simple discrete collision (can tunnel through thin walls)
        this.x += this.vx;
        this.y += this.vy;

        // Check walls (may miss thin walls at high speeds)
        for (const wall of walls) {
            if (this.checkWallOverlap(wall)) {
                // Simple bounce
                if (wall.isVertical) {
                    this.vx *= -0.95;
                    this.x = wall.x + (this.vx > 0 ? -this.radius : wall.width + this.radius);
                } else {
                    this.vy *= -0.95;
                    this.y = wall.y + (this.vy > 0 ? -this.radius : wall.height + this.radius);
                }
                this.bounceCount++;
                collisionCounter++;
                updateStats();
            }
        }

        // Check if tunneled through
        for (const wall of walls) {
            if (this.checkTunnel(wall)) {
                tunnelCounter++;
                updateStats();
            }
        }

        // Boundary collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.95;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -0.95;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.95;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -0.95;
        }
    }

    checkWallCollisionTime(wall, maxTime) {
        // Ray-box intersection
        const dx = this.vx * maxTime;
        const dy = this.vy * maxTime;

        // Expanded wall bounds by ball radius
        const left = wall.x - this.radius;
        const right = wall.x + wall.width + this.radius;
        const top = wall.y - this.radius;
        const bottom = wall.y + wall.height + this.radius;

        let tmin = 0;
        let tmax = maxTime;
        let normalX = 0, normalY = 0;

        // X axis
        if (Math.abs(dx) > 0.0001) {
            const t1 = (left - this.x) / this.vx;
            const t2 = (right - this.x) / this.vx;

            const tEnter = Math.min(t1, t2);
            const tExit = Math.max(t1, t2);

            if (tEnter > tmin) {
                tmin = tEnter;
                normalX = t1 < t2 ? -1 : 1;
                normalY = 0;
            }
            tmax = Math.min(tmax, tExit);
        } else if (this.x < left || this.x > right) {
            return null;
        }

        // Y axis
        if (Math.abs(dy) > 0.0001) {
            const t1 = (top - this.y) / this.vy;
            const t2 = (bottom - this.y) / this.vy;

            const tEnter = Math.min(t1, t2);
            const tExit = Math.max(t1, t2);

            if (tEnter > tmin) {
                tmin = tEnter;
                normalX = 0;
                normalY = t1 < t2 ? -1 : 1;
            }
            tmax = Math.min(tmax, tExit);
        } else if (this.y < top || this.y > bottom) {
            return null;
        }

        if (tmin > tmax || tmin < 0 || tmin > maxTime) {
            return null;
        }

        return {
            time: tmin,
            normal: { x: normalX, y: normalY }
        };
    }

    checkBoundaryCollisionTime(maxTime) {
        let earliestTime = maxTime + 1;
        let normal = null;

        // Left
        if (this.vx < 0) {
            const t = (this.radius - this.x) / this.vx;
            if (t > 0 && t < earliestTime) {
                earliestTime = t;
                normal = { x: 1, y: 0 };
            }
        }
        // Right
        if (this.vx > 0) {
            const t = (width - this.radius - this.x) / this.vx;
            if (t > 0 && t < earliestTime) {
                earliestTime = t;
                normal = { x: -1, y: 0 };
            }
        }
        // Top
        if (this.vy < 0) {
            const t = (this.radius - this.y) / this.vy;
            if (t > 0 && t < earliestTime) {
                earliestTime = t;
                normal = { x: 0, y: 1 };
            }
        }
        // Bottom
        if (this.vy > 0) {
            const t = (height - this.radius - this.y) / this.vy;
            if (t > 0 && t < earliestTime) {
                earliestTime = t;
                normal = { x: 0, y: -1 };
            }
        }

        if (normal) {
            return { time: earliestTime, normal };
        }
        return null;
    }

    checkWallOverlap(wall) {
        return this.x + this.radius > wall.x &&
               this.x - this.radius < wall.x + wall.width &&
               this.y + this.radius > wall.y &&
               this.y - this.radius < wall.y + wall.height;
    }

    checkTunnel(wall) {
        // Check if line from prev to current intersects wall
        // but bullet is now on the other side
        const crossed = this.lineIntersectsRect(
            this.prevX, this.prevY, this.x, this.y,
            wall.x, wall.y, wall.width, wall.height
        );

        return crossed && !this.checkWallOverlap(wall);
    }

    lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        // Check if line segment intersects rectangle
        return this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
               this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
               this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh) ||
               this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    }

    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (Math.abs(denom) < 0.0001) return false;

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    draw() {
        // Trail
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = i / this.trail.length;
            ctx.strokeStyle = this.color.replace('60%)', `${60 * alpha}%)`);
            ctx.lineWidth = this.radius * 2 * alpha;
            ctx.beginPath();
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            ctx.stroke();
        }

        // Glow
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        glow.addColorStop(0, this.color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isVertical = height > width;
    }

    draw() {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);

        // Wall
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(0.5, '#777');
        gradient.addColorStop(1, '#444');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Label showing wall thickness
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const minDim = Math.min(this.width, this.height);
        ctx.fillText(`${minDim}px`, this.x + this.width / 2, this.y + this.height / 2);
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createWalls();
}

function createWalls() {
    walls = [];

    // Create thin walls (to demonstrate tunneling problem)
    const wallThickness = 5; // Very thin walls

    // Vertical walls
    walls.push(new Wall(width * 0.3, height * 0.2, wallThickness, height * 0.3));
    walls.push(new Wall(width * 0.7, height * 0.2, wallThickness, height * 0.3));
    walls.push(new Wall(width * 0.5, height * 0.5, wallThickness, height * 0.3));

    // Horizontal walls
    walls.push(new Wall(width * 0.2, height * 0.6, width * 0.2, wallThickness));
    walls.push(new Wall(width * 0.6, height * 0.4, width * 0.2, wallThickness));

    // Thicker reference wall
    walls.push(new Wall(width * 0.4, height * 0.8, 30, height * 0.1));
}

function fireBullets() {
    bullets = [];

    for (let i = 0; i < bulletCount; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.5 - Math.PI / 2;
        const spawnX = 50 + Math.random() * 100;
        const spawnY = height - 100 + Math.random() * 50;

        bullets.push(new Bullet(
            spawnX,
            spawnY,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        ));
    }
}

function updateStats() {
    document.getElementById('collisionCount').textContent = collisionCounter;
    document.getElementById('tunnelCount').textContent = tunnelCounter;
}

function animate() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw walls
    for (const wall of walls) {
        wall.draw();
    }

    // Update and draw bullets
    for (const bullet of bullets) {
        bullet.update();
        bullet.draw();
    }

    // Remove slow bullets
    bullets = bullets.filter(b => {
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        return speed > 0.5;
    });

    // Mode indicator
    ctx.fillStyle = collisionMode === 'ccd' ? '#4ade80' : '#f87171';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(
        collisionMode === 'ccd' ? '✓ CCD 連續碰撞偵測' : '✗ 離散偵測（可能穿透）',
        width - 20, 30
    );

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('speedSlider').addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = speed;
});

document.getElementById('countSlider').addEventListener('input', (e) => {
    bulletCount = parseInt(e.target.value);
    document.getElementById('countValue').textContent = bulletCount;
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        collisionMode = btn.dataset.mode;
    });
});

document.getElementById('fireBtn').addEventListener('click', fireBullets);

document.getElementById('resetBtn').addEventListener('click', () => {
    bullets = [];
    collisionCounter = 0;
    tunnelCounter = 0;
    updateStats();
});

window.addEventListener('resize', resize);

// Initialize
resize();
updateStats();
animate();
