const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 300; canvas.height = 300;

let animId = null;

function init() {
    document.getElementById('drawBtn').addEventListener('click', drawSpirograph);
    document.getElementById('clearBtn').addEventListener('click', clear);
    clear();
}

function clear() {
    cancelAnimationFrame(animId);
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSpirograph() {
    clear();

    const R = parseInt(document.getElementById('R').value);
    const r = parseInt(document.getElementById('r').value);
    const d = parseInt(document.getElementById('d').value);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const hue = Math.random() * 360;
    let t = 0;
    const maxT = Math.PI * 2 * r / gcd(R, r);

    function gcd(a, b) { return b ? gcd(b, a % b) : a; }

    function animate() {
        for (let i = 0; i < 5; i++) {
            const x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t);
            const y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);

            ctx.fillStyle = `hsl(${(hue + t * 10) % 360}, 100%, 60%)`;
            ctx.beginPath();
            ctx.arc(cx + x, cy + y, 1, 0, Math.PI * 2);
            ctx.fill();

            t += 0.02;
        }

        if (t < maxT) {
            animId = requestAnimationFrame(animate);
        }
    }

    animate();
}

document.addEventListener('DOMContentLoaded', init);
