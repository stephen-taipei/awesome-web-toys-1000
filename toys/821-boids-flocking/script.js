const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const boids = [];
const numBoids = 50;

class Boid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.maxSpeed = 3;
        this.maxForce = 0.05;
    }

    update() {
        const sep = this.separate();
        const ali = this.align();
        const coh = this.cohesion();

        this.vx += sep.x * 1.5 + ali.x + coh.x;
        this.vy += sep.y * 1.5 + ali.y + coh.y;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    separate() {
        const desiredSeparation = 25;
        let steerX = 0, steerY = 0, count = 0;

        boids.forEach(other => {
            const d = Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
            if (d > 0 && d < desiredSeparation) {
                steerX += (this.x - other.x) / d;
                steerY += (this.y - other.y) / d;
                count++;
            }
        });

        if (count > 0) {
            steerX /= count;
            steerY /= count;
        }
        return { x: steerX * this.maxForce, y: steerY * this.maxForce };
    }

    align() {
        const neighborDist = 50;
        let sumX = 0, sumY = 0, count = 0;

        boids.forEach(other => {
            const d = Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
            if (d > 0 && d < neighborDist) {
                sumX += other.vx;
                sumY += other.vy;
                count++;
            }
        });

        if (count > 0) {
            sumX /= count;
            sumY /= count;
            return { x: (sumX - this.vx) * this.maxForce, y: (sumY - this.vy) * this.maxForce };
        }
        return { x: 0, y: 0 };
    }

    cohesion() {
        const neighborDist = 50;
        let sumX = 0, sumY = 0, count = 0;

        boids.forEach(other => {
            const d = Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
            if (d > 0 && d < neighborDist) {
                sumX += other.x;
                sumY += other.y;
                count++;
            }
        });

        if (count > 0) {
            sumX /= count;
            sumY /= count;
            return { x: (sumX - this.x) * 0.01, y: (sumY - this.y) * 0.01 };
        }
        return { x: 0, y: 0 };
    }

    draw() {
        const angle = Math.atan2(this.vy, this.vx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function init() {
    boids.length = 0;
    for (let i = 0; i < numBoids; i++) {
        boids.push(new Boid());
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate() {
    drawBackground();
    boids.forEach(boid => {
        boid.update();
        boid.draw();
    });
    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
