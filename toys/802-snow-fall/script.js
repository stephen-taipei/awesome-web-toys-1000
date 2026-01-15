const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const amountInput = document.getElementById('amount');

canvas.width = 370;
canvas.height = 300;

class Snowflake {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -50;
        this.radius = 1 + Math.random() * 4;
        this.speed = 0.5 + Math.random() * 2;
        this.wind = (Math.random() - 0.5) * 0.5;
        this.opacity = 0.5 + Math.random() * 0.5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.03;
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.wind + Math.sin(this.wobble) * 0.5;
        this.y += this.speed;

        if (this.y > canvas.height + 10) {
            this.reset();
        }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.radius > 2) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
            ctx.lineWidth = 0.5;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x + Math.cos(angle) * this.radius * 1.5,
                    this.y + Math.sin(angle) * this.radius * 1.5
                );
                ctx.stroke();
            }
        }
    }
}

let snowflakes = [];

function initSnowflakes() {
    const amount = parseInt(amountInput.value);
    snowflakes = [];
    for (let i = 0; i < amount; i++) {
        const flake = new Snowflake();
        flake.y = Math.random() * canvas.height;
        snowflakes.push(flake);
    }
}

function animate() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(26, 26, 46, 0.05)');
    gradient.addColorStop(1, 'rgba(44, 62, 80, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });

    requestAnimationFrame(animate);
}

amountInput.addEventListener('input', initSnowflakes);

initSnowflakes();
animate();
