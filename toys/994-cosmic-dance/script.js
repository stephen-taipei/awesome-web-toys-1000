const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let danceMode = 0;
const modes = ['華爾滋', '探戈', '狐步', '旋轉'];
let stars = [];
let dancers = [];

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.twinkle = Math.random() * 0.1 + 0.02;
        this.phase = Math.random() * Math.PI * 2;
    }

    draw() {
        const alpha = 0.3 + Math.sin(time * this.twinkle + this.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.fill();
    }
}

class CosmicDancer {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.baseAngle = (index / total) * Math.PI * 2;
        this.size = 8;
        this.trail = [];
        this.hue = (index / total) * 360;
    }

    update() {
        let x, y;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        switch (danceMode) {
            case 0:
                const waltzR = 80 + Math.sin(time * 0.03 + this.index) * 20;
                x = cx + Math.cos(this.baseAngle + time * 0.02) * waltzR;
                y = cy + Math.sin(this.baseAngle + time * 0.02) * waltzR * 0.6;
                break;
            case 1:
                const tangoT = time * 0.05 + this.index * 0.5;
                x = cx + Math.cos(tangoT) * 60 + Math.cos(tangoT * 3) * 30;
                y = cy + Math.sin(tangoT * 2) * 50;
                break;
            case 2:
                const foxR = 50 + this.index * 15;
                const foxSpeed = 0.03 - this.index * 0.005;
                x = cx + Math.cos(time * foxSpeed + this.baseAngle) * foxR;
                y = cy + Math.sin(time * foxSpeed + this.baseAngle) * foxR;
                break;
            case 3:
                const spinR = 60 + Math.sin(time * 0.1 + this.index) * 40;
                const spinAngle = this.baseAngle + time * 0.05 * (this.index % 2 ? 1 : -1);
                x = cx + Math.cos(spinAngle) * spinR;
                y = cy + Math.sin(spinAngle) * spinR;
                break;
        }

        this.trail.push({ x, y });
        if (this.trail.length > 50) this.trail.shift();

        this.x = x;
        this.y = y;
    }

    draw() {
        if (this.trail.length > 1) {
            ctx.beginPath();
            this.trail.forEach((pos, i) => {
                if (i === 0) ctx.moveTo(pos.x, pos.y);
                else ctx.lineTo(pos.x, pos.y);
            });
            ctx.strokeStyle = `hsla(${this.hue + time}, 80%, 60%, 0.3)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        glow.addColorStop(0, `hsla(${this.hue + time}, 80%, 70%, 1)`);
        glow.addColorStop(0.5, `hsla(${this.hue + time}, 80%, 50%, 0.5)`);
        glow.addColorStop(1, 'transparent');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
    }
}

function init() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    dancers = [];
    for (let i = 0; i < 8; i++) {
        dancers.push(new CosmicDancer(i, 8));
    }
}

function draw() {
    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => s.draw());

    const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 100
    );
    centerGlow.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    dancers.forEach(d => {
        d.update();
        d.draw();
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(modes[danceMode], canvas.width / 2, 20);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('danceBtn').addEventListener('click', () => {
    danceMode = (danceMode + 1) % modes.length;
    dancers.forEach(d => d.trail = []);
});

init();
animate();
