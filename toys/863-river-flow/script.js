const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let flowSpeed = 2;
let time = 0;
let ripples = [];

function changeSpeed() {
    flowSpeed = flowSpeed === 2 ? 4 : flowSpeed === 4 ? 1 : 2;
}

function drawBackground() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawRiver() {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.bezierCurveTo(100, 80, 150, 150, 185, 150);
    ctx.bezierCurveTo(220, 150, 250, 100, 300, 120);
    ctx.lineTo(canvas.width, 100);
    ctx.lineTo(canvas.width, 200);
    ctx.lineTo(300, 220);
    ctx.bezierCurveTo(250, 200, 220, 250, 185, 250);
    ctx.bezierCurveTo(150, 250, 100, 180, 0, 200);
    ctx.closePath();
    ctx.clip();

    const gradient = ctx.createLinearGradient(0, 100, 0, 250);
    gradient.addColorStop(0, '#4682B4');
    gradient.addColorStop(0.5, '#20B2AA');
    gradient.addColorStop(1, '#006994');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offset = (time * flowSpeed) % 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;

    for (let i = -1; i < 12; i++) {
        const x = i * 40 - offset;
        ctx.beginPath();
        ctx.moveTo(x, 120);
        ctx.bezierCurveTo(x + 10, 130, x + 30, 130, x + 40, 120);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 20, 170);
        ctx.bezierCurveTo(x + 30, 180, x + 50, 180, x + 60, 170);
        ctx.stroke();
    }

    ctx.restore();
}

function drawRocks() {
    const rocks = [
        { x: 80, y: 130, size: 15 },
        { x: 250, y: 160, size: 12 },
        { x: 320, y: 140, size: 18 }
    ];

    rocks.forEach(rock => {
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.ellipse(rock.x - 3, rock.y - 3, rock.size * 0.6, rock.size * 0.4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        if (Math.random() > 0.7) {
            ripples.push({
                x: rock.x + rock.size,
                y: rock.y,
                radius: 5,
                alpha: 0.5
            });
        }
    });
}

function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.5;
        r.alpha -= 0.01;
        r.x += flowSpeed * 0.5;

        if (r.alpha <= 0) {
            ripples.splice(i, 1);
            continue;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (ripples.length > 50) {
        ripples = ripples.slice(-30);
    }
}

function drawBanks() {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(0, 95);
    ctx.bezierCurveTo(100, 75, 150, 145, 185, 145);
    ctx.bezierCurveTo(220, 145, 250, 95, 300, 115);
    ctx.lineTo(canvas.width, 95);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 205);
    ctx.bezierCurveTo(100, 185, 150, 255, 185, 255);
    ctx.bezierCurveTo(220, 255, 250, 205, 300, 225);
    ctx.lineTo(canvas.width, 205);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillRect(0, 220, canvas.width, 80);
}

function drawTrees() {
    const trees = [
        { x: 50, y: 50 }, { x: 150, y: 40 }, { x: 280, y: 55 },
        { x: 80, y: 260 }, { x: 200, y: 270 }, { x: 320, y: 255 }
    ];

    trees.forEach(tree => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(tree.x - 3, tree.y, 6, 15);

        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.moveTo(tree.x, tree.y - 20);
        ctx.lineTo(tree.x - 15, tree.y + 5);
        ctx.lineTo(tree.x + 15, tree.y + 5);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { 1: '緩慢', 2: '普通', 4: '湍急' };
    ctx.fillText(`流速: ${labels[flowSpeed]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawBanks();
    drawRiver();
    drawRocks();
    drawRipples();
    drawTrees();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('speedBtn').addEventListener('click', changeSpeed);

animate();
