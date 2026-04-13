const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let style = 0;
let time = 0;

const styles = ['strings', 'web', 'flow', 'burst'];

function changeStyle() {
    style = (style + 1) % styles.length;
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStrings() {
    const points1 = [];
    const points2 = [];
    const numPoints = 20;

    for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        points1.push({
            x: 0,
            y: t * canvas.height
        });
        points2.push({
            x: canvas.width,
            y: (1 - t) * canvas.height + Math.sin(t * 10 + time * 0.05) * 20
        });
    }

    for (let i = 0; i < numPoints; i++) {
        const hue = (i * 18 + time * 2) % 360;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.5)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(points1[i].x, points1[i].y);
        ctx.lineTo(points2[i].x, points2[i].y);
        ctx.stroke();
    }
}

function drawWeb() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const numRays = 24;
    const numRings = 8;

    for (let ray = 0; ray < numRays; ray++) {
        const angle = (ray / numRays) * Math.PI * 2 + time * 0.01;
        const hue = (ray * 15 + time * 2) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(angle) * 150,
            cy + Math.sin(angle) * 150
        );
        ctx.stroke();
    }

    for (let ring = 1; ring <= numRings; ring++) {
        const radius = ring * 18;
        const hue = (ring * 45 + time * 2) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.4)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let ray = 0; ray <= numRays; ray++) {
            const angle = (ray / numRays) * Math.PI * 2 + time * 0.01;
            const wobble = Math.sin(ray + time * 0.05) * 5;
            const x = cx + Math.cos(angle) * (radius + wobble);
            const y = cy + Math.sin(angle) * (radius + wobble);

            if (ray === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function drawFlow() {
    const numLines = 30;

    for (let i = 0; i < numLines; i++) {
        const startY = (i / numLines) * canvas.height;
        const hue = (i * 12 + time * 2) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, startY);

        for (let x = 0; x <= canvas.width; x += 10) {
            const y = startY + Math.sin(x * 0.02 + i * 0.5 + time * 0.03) * 30;
            ctx.lineTo(x, y);
        }

        ctx.stroke();
    }
}

function drawBurst() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const numLines = 60;

    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const length = 50 + Math.sin(i * 3 + time * 0.05) * 80;
        const hue = (i * 6 + time * 2) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);

        const endX = cx + Math.cos(angle + time * 0.02) * length;
        const endY = cy + Math.sin(angle + time * 0.02) * length;

        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.fillStyle = `hsla(${hue}, 70%, 70%, 0.8)`;
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`樣式: ${styles[style]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();

    switch (styles[style]) {
        case 'strings': drawStrings(); break;
        case 'web': drawWeb(); break;
        case 'flow': drawFlow(); break;
        case 'burst': drawBurst(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('styleBtn').addEventListener('click', changeStyle);

ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
animate();
