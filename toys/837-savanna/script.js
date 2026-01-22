const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let timeOfDay = 0;
let animals = [];
let trees = [];
let birds = [];

function init() {
    trees = [];
    for (let i = 0; i < 4; i++) {
        trees.push({
            x: 50 + i * 100 + Math.random() * 30,
            y: canvas.height - 80,
            height: 60 + Math.random() * 30,
            width: 40 + Math.random() * 20
        });
    }

    animals = [];
    for (let i = 0; i < 3; i++) {
        animals.push({
            type: 'zebra',
            x: Math.random() * canvas.width,
            y: canvas.height - 50 - Math.random() * 30,
            vx: (Math.random() - 0.5) * 0.5,
            legPhase: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 2; i++) {
        animals.push({
            type: 'giraffe',
            x: Math.random() * canvas.width,
            y: canvas.height - 70,
            vx: (Math.random() - 0.5) * 0.3,
            legPhase: Math.random() * Math.PI * 2
        });
    }

    birds = [];
    for (let i = 0; i < 5; i++) {
        birds.push({
            x: Math.random() * canvas.width,
            y: 30 + Math.random() * 50,
            vx: 1 + Math.random(),
            wingPhase: Math.random() * Math.PI * 2
        });
    }
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);

    if (timeOfDay === 0) {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#F0E68C');
    } else if (timeOfDay === 1) {
        gradient.addColorStop(0, '#FF7F50');
        gradient.addColorStop(1, '#FFD700');
    } else {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#2d2d44');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (timeOfDay === 0) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(canvas.width - 60, 50, 25, 0, Math.PI * 2);
        ctx.fill();
    } else if (timeOfDay === 1) {
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height * 0.4, 30, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#FFFACD';
        ctx.beginPath();
        ctx.arc(60, 40, 15, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * 100, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawGround() {
    ctx.fillStyle = timeOfDay === 2 ? '#3d3d1f' : '#C4A747';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    for (let i = 0; i < 50; i++) {
        ctx.strokeStyle = timeOfDay === 2 ? '#2d2d15' : '#8B7500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const x = Math.random() * canvas.width;
        const y = canvas.height - 80 + Math.random() * 80;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 5, y - 5 - Math.random() * 10);
        ctx.stroke();
    }
}

function drawTree(tree) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(tree.x - 5, tree.y, 10, 40);

    ctx.fillStyle = timeOfDay === 2 ? '#1a3320' : '#228B22';
    ctx.beginPath();
    ctx.ellipse(tree.x, tree.y - 10, tree.width, tree.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = timeOfDay === 2 ? '#0d1f12' : '#1e7b1e';
    ctx.beginPath();
    ctx.ellipse(tree.x - 15, tree.y, tree.width * 0.6, tree.height * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(tree.x + 15, tree.y, tree.width * 0.6, tree.height * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function updateAnimals() {
    animals.forEach(a => {
        a.legPhase += 0.1;
        a.x += a.vx;

        if (a.x < -30) a.x = canvas.width + 30;
        if (a.x > canvas.width + 30) a.x = -30;

        if (Math.random() < 0.01) {
            a.vx = (Math.random() - 0.5) * (a.type === 'zebra' ? 0.5 : 0.3);
        }
    });
}

function drawAnimal(a) {
    const dir = a.vx >= 0 ? 1 : -1;
    const legMove = Math.sin(a.legPhase) * 3;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.scale(dir, 1);

    if (a.type === 'zebra') {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-10 + i * 6, -6);
            ctx.lineTo(-10 + i * 6, 6);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(12, -5, 5, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 8);
        ctx.lineTo(-8 + legMove, 20);
        ctx.moveTo(-3, 8);
        ctx.lineTo(-3 - legMove, 20);
        ctx.moveTo(3, 8);
        ctx.lineTo(3 + legMove, 20);
        ctx.moveTo(8, 8);
        ctx.lineTo(8 - legMove, 20);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(0, 10, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#DAA520';
        ctx.fillRect(-3, -30, 6, 40);

        ctx.beginPath();
        ctx.ellipse(0, -35, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(-2, -40);
        ctx.lineTo(-5, -48);
        ctx.lineTo(-1, -42);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(2, -40);
        ctx.lineTo(5, -48);
        ctx.lineTo(1, -42);
        ctx.fill();

        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.lineTo(-6 + legMove, 35);
        ctx.moveTo(6, 18);
        ctx.lineTo(6 - legMove, 35);
        ctx.stroke();
    }

    ctx.restore();
}

function updateBirds() {
    birds.forEach(b => {
        b.wingPhase += 0.2;
        b.x += b.vx;
        if (b.x > canvas.width + 20) b.x = -20;
    });
}

function drawBird(b) {
    const wingY = Math.sin(b.wingPhase) * 5;

    ctx.fillStyle = timeOfDay === 2 ? '#333' : '#2F2F2F';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = timeOfDay === 2 ? '#333' : '#2F2F2F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x - 2, b.y);
    ctx.lineTo(b.x - 8, b.y - 5 + wingY);
    ctx.moveTo(b.x + 2, b.y);
    ctx.lineTo(b.x + 8, b.y - 5 + wingY);
    ctx.stroke();
}

function animate() {
    drawSky();
    drawGround();
    trees.forEach(t => drawTree(t));
    updateAnimals();
    animals.forEach(a => drawAnimal(a));
    updateBirds();
    birds.forEach(b => drawBird(b));
    requestAnimationFrame(animate);
}

document.getElementById('timeBtn').addEventListener('click', () => {
    timeOfDay = (timeOfDay + 1) % 3;
});

init();
animate();
