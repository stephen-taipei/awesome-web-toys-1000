const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let bubbles = [];
let pops = [];
let score = 0;
let time = 0;

function addBubble() {
    bubbles.push({
        x: 30 + Math.random() * (canvas.width - 60),
        y: canvas.height + 30,
        radius: 15 + Math.random() * 25,
        speed: 0.5 + Math.random() * 1,
        wobble: Math.random() * Math.PI * 2,
        hue: Math.random() * 360
    });
}

function blowBubbles() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => addBubble(), i * 100);
    }
}

function popBubble(index) {
    const bubble = bubbles[index];

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        pops.push({
            x: bubble.x + Math.cos(angle) * bubble.radius * 0.5,
            y: bubble.y + Math.sin(angle) * bubble.radius * 0.5,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            radius: 3 + Math.random() * 3,
            alpha: 1,
            hue: bubble.hue
        });
    }

    bubbles.splice(index, 1);
    score++;
}

function updateBubbles() {
    bubbles.forEach(bubble => {
        bubble.wobble += 0.05;
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(bubble.wobble) * 0.5;
    });

    bubbles = bubbles.filter(b => b.y + b.radius > 0);

    if (Math.random() < 0.02) addBubble();
}

function updatePops() {
    pops.forEach(pop => {
        pop.x += pop.vx;
        pop.y += pop.vy;
        pop.vy += 0.1;
        pop.alpha -= 0.03;
        pop.radius *= 0.95;
    });

    pops = pops.filter(p => p.alpha > 0);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBubbles() {
    bubbles.forEach(bubble => {
        const gradient = ctx.createRadialGradient(
            bubble.x - bubble.radius * 0.3,
            bubble.y - bubble.radius * 0.3,
            0,
            bubble.x,
            bubble.y,
            bubble.radius
        );

        gradient.addColorStop(0, `hsla(${bubble.hue}, 70%, 90%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${bubble.hue}, 70%, 80%, 0.4)`);
        gradient.addColorStop(1, `hsla(${bubble.hue}, 70%, 70%, 0.2)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsla(${bubble.hue}, 70%, 80%, 0.5)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(
            bubble.x - bubble.radius * 0.3,
            bubble.y - bubble.radius * 0.3,
            bubble.radius * 0.2,
            0, Math.PI * 2
        );
        ctx.fill();
    });
}

function drawPops() {
    pops.forEach(pop => {
        ctx.fillStyle = `hsla(${pop.hue}, 70%, 70%, ${pop.alpha})`;
        ctx.beginPath();
        ctx.arc(pop.x, pop.y, pop.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`分數: ${score}`, 20, 28);
}

function animate() {
    time++;
    updateBubbles();
    updatePops();
    drawBackground();
    drawBubbles();
    drawPops();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        const dist = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
        if (dist < bubble.radius) {
            popBubble(i);
            break;
        }
    }
});

document.getElementById('blowBtn').addEventListener('click', blowBubbles);

for (let i = 0; i < 10; i++) addBubble();
animate();
