const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let circles = [];
let growing = [];
let time = 0;

function init() {
    circles = [];
    growing = [];
}

function reset() {
    init();
}

function addCircle() {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        let valid = true;
        for (const c of circles) {
            const dist = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2);
            if (dist < c.radius + 2) {
                valid = false;
                break;
            }
        }

        for (const c of growing) {
            const dist = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2);
            if (dist < c.radius + 2) {
                valid = false;
                break;
            }
        }

        if (valid) {
            growing.push({
                x, y,
                radius: 1,
                hue: Math.random() * 360,
                growing: true
            });
            return;
        }

        attempts++;
    }
}

function updateCircles() {
    for (let i = growing.length - 1; i >= 0; i--) {
        const c = growing[i];

        if (c.growing) {
            c.radius += 0.5;

            if (c.x - c.radius < 0 || c.x + c.radius > canvas.width ||
                c.y - c.radius < 0 || c.y + c.radius > canvas.height) {
                c.growing = false;
            }

            for (const other of circles) {
                const dist = Math.sqrt((c.x - other.x) ** 2 + (c.y - other.y) ** 2);
                if (dist < c.radius + other.radius + 1) {
                    c.growing = false;
                    break;
                }
            }

            for (const other of growing) {
                if (other === c) continue;
                const dist = Math.sqrt((c.x - other.x) ** 2 + (c.y - other.y) ** 2);
                if (dist < c.radius + other.radius + 1) {
                    c.growing = false;
                    break;
                }
            }

            if (c.radius > 50) {
                c.growing = false;
            }
        }

        if (!c.growing) {
            circles.push(c);
            growing.splice(i, 1);
        }
    }

    if (growing.length < 5 && circles.length < 200) {
        addCircle();
    }
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCircles() {
    [...circles, ...growing].forEach(c => {
        const gradient = ctx.createRadialGradient(
            c.x - c.radius * 0.3, c.y - c.radius * 0.3, 0,
            c.x, c.y, c.radius
        );

        gradient.addColorStop(0, `hsla(${c.hue}, 70%, 70%, 0.9)`);
        gradient.addColorStop(0.7, `hsla(${c.hue}, 70%, 50%, 0.8)`);
        gradient.addColorStop(1, `hsla(${c.hue}, 70%, 30%, 0.7)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        if (c.growing) {
            ctx.strokeStyle = `hsla(${c.hue}, 70%, 70%, 0.9)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`圓形: ${circles.length + growing.length}`, 20, 28);
}

function animate() {
    time++;
    updateCircles();
    drawBackground();
    drawCircles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', reset);

init();
animate();
