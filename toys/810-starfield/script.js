const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const speedInput = document.getElementById('speed');

canvas.width = 370;
canvas.height = 300;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.z = Math.random() * canvas.width;
        this.pz = this.z;
    }

    update(speed) {
        this.pz = this.z;
        this.z -= speed;

        if (this.z < 1) {
            this.reset();
            this.z = canvas.width;
            this.pz = this.z;
        }
    }

    draw() {
        const sx = (this.x / this.z) * canvas.width + centerX;
        const sy = (this.y / this.z) * canvas.height + centerY;

        const px = (this.x / this.pz) * canvas.width + centerX;
        const py = (this.y / this.pz) * canvas.height + centerY;

        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) return;

        const size = Math.max(0, (1 - this.z / canvas.width) * 3);
        const brightness = 1 - this.z / canvas.width;

        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

const stars = [];
for (let i = 0; i < 300; i++) {
    stars.push(new Star());
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const speed = parseInt(speedInput.value) * 2;

    stars.forEach(star => {
        star.update(speed);
        star.draw();
    });

    requestAnimationFrame(animate);
}

animate();
