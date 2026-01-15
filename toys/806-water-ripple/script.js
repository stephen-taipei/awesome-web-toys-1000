const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = 80 + Math.random() * 40;
        this.lineWidth = 3;
        this.opacity = 1;
    }

    update() {
        this.radius += 2;
        this.opacity = 1 - (this.radius / this.maxRadius);
        this.lineWidth = 3 * this.opacity;
    }

    draw() {
        if (this.opacity <= 0) return;

        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(200, 230, 255, ${this.opacity * 0.3})`;
        ctx.lineWidth = this.lineWidth * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }

    isDead() {
        return this.radius >= this.maxRadius;
    }
}

let ripples = [];

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a5276');
    gradient.addColorStop(0.5, '#2980b9');
    gradient.addColorStop(1, '#1a5276');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 20; i++) {
        const x = (Date.now() * 0.02 + i * 50) % (canvas.width + 100) - 50;
        const y = 50 + i * 12;
        ctx.beginPath();
        ctx.ellipse(x, y, 30, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    drawBackground();

    ripples = ripples.filter(r => !r.isDead());
    ripples.forEach(r => {
        r.update();
        r.draw();
    });

    requestAnimationFrame(animate);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('click', (e) => {
    const pos = getPos(e);
    ripples.push(new Ripple(pos.x, pos.y));
    setTimeout(() => ripples.push(new Ripple(pos.x, pos.y)), 100);
    setTimeout(() => ripples.push(new Ripple(pos.x, pos.y)), 200);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getPos(e);
    ripples.push(new Ripple(pos.x, pos.y));
});

setInterval(() => {
    if (ripples.length < 3) {
        ripples.push(new Ripple(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}, 2000);

animate();
