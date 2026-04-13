const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let birds = [];
let leader = null;
let formationOffset = { x: 0, y: 0 };
let time = 0;

class Bird {
    constructor(isLeader, index) {
        this.isLeader = isLeader;
        this.index = index;
        this.wingPhase = Math.random() * Math.PI * 2;

        if (isLeader) {
            this.x = -50;
            this.y = canvas.height / 2;
            this.targetX = canvas.width + 50;
            this.targetY = canvas.height / 2;
        } else {
            this.x = -50 - Math.abs(index) * 25;
            this.y = canvas.height / 2 + index * 20;
        }
    }

    update() {
        this.wingPhase += 0.15;

        if (this.isLeader) {
            const wave = Math.sin(time * 0.02) * 30;
            this.targetY = canvas.height / 2 + wave;

            this.x += 1.5;
            this.y += (this.targetY - this.y) * 0.05;

            if (this.x > canvas.width + 100) {
                this.x = -50;
            }
        } else {
            const offsetX = -Math.abs(this.index) * 25;
            const offsetY = this.index * 20;

            const targetX = leader.x + offsetX;
            const targetY = leader.y + offsetY;

            this.x += (targetX - this.x) * 0.08;
            this.y += (targetY - this.y) * 0.08;

            this.x += (Math.random() - 0.5) * 0.5;
            this.y += (Math.random() - 0.5) * 0.5;
        }
    }

    draw() {
        const wingUp = Math.sin(this.wingPhase) * 0.5;

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.isLeader ? '#1a1a2e' : '#2F2F4F';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.isLeader ? '#1a1a2e' : '#2F2F4F';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.quadraticCurveTo(-8, -8 - wingUp * 10, -15, -5 - wingUp * 15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.quadraticCurveTo(-8, 8 + wingUp * 10, -15, 5 + wingUp * 15);
        ctx.stroke();

        ctx.fillStyle = this.isLeader ? '#1a1a2e' : '#2F2F4F';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(5, -2);
        ctx.lineTo(5, 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function init() {
    birds = [];
    leader = new Bird(true, 0);
    birds.push(leader);

    for (let i = 1; i <= 5; i++) {
        birds.push(new Bird(false, i));
        birds.push(new Bird(false, -i));
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FF7F50');
    gradient.addColorStop(0.4, '#FFD700');
    gradient.addColorStop(1, '#87CEEB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        const x = (i * 100 + time * 0.3) % (canvas.width + 100) - 50;
        ctx.ellipse(x, 60 + i * 20, 30 + Math.random() * 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 30);
    for (let x = 0; x <= canvas.width; x += 20) {
        ctx.lineTo(x, canvas.height - 30 + Math.sin(x * 0.05) * 10);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
}

function animate() {
    time++;
    drawBackground();

    birds.forEach(bird => {
        bird.update();
        bird.draw();
    });

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
