const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let isLit = false;
let sparks = [];
let burnProgress = 0;
let time = 0;
let mouseX = canvas.width / 2;
let mouseY = 100;

function toggleLight() {
    isLit = !isLit;
    if (isLit) burnProgress = 0;
}

function spawnSparks() {
    if (!isLit || burnProgress > 1) return;

    const tipX = mouseX;
    const tipY = mouseY;

    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        sparks.push({
            x: tipX,
            y: tipY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 2,
            life: 1,
            color: Math.random() > 0.3 ? 'gold' : (Math.random() > 0.5 ? 'white' : 'orange')
        });
    }
}

function updateSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vy += 0.1;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.03;

        if (s.life <= 0) sparks.splice(i, 1);
    }

    if (sparks.length > 200) sparks = sparks.slice(-150);

    if (isLit) {
        burnProgress += 0.0005;
        if (burnProgress > 1) {
            isLit = false;
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc((i * 47) % canvas.width, (i * 23) % canvas.height, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSparkler() {
    const handleLength = 80;
    const sparklerLength = 100;
    const burnedLength = sparklerLength * burnProgress;

    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY);
    ctx.lineTo(mouseX, mouseY + handleLength);
    ctx.stroke();

    if (burnProgress < 1) {
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY - sparklerLength + burnedLength);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }

    if (isLit && burnProgress < 1) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 5 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();

        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 30);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSparks() {
    sparks.forEach(s => {
        let color;
        switch (s.color) {
            case 'gold': color = `rgba(255, 215, 0, ${s.life})`; break;
            case 'white': color = `rgba(255, 255, 255, ${s.life})`; break;
            case 'orange': color = `rgba(255, 165, 0, ${s.life})`; break;
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
        ctx.stroke();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    let status = '點擊點燃';
    if (isLit) status = `燃燒中 ${Math.round((1 - burnProgress) * 100)}%`;
    else if (burnProgress >= 1) status = '已燒完';
    ctx.fillText(status, 20, 28);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    mouseY = Math.max(100, Math.min(200, mouseY));
});

function animate() {
    time++;
    drawBackground();
    spawnSparks();
    updateSparks();
    drawSparkler();
    drawSparks();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('lightBtn').addEventListener('click', toggleLight);

animate();
