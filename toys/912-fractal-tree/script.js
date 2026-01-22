const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let branches = [];
let maxDepth = 0;
let targetDepth = 10;
let time = 0;

function init() {
    branches = [];
    maxDepth = 0;

    branches.push({
        x: canvas.width / 2,
        y: canvas.height,
        angle: -Math.PI / 2,
        length: 60,
        depth: 0,
        grown: false
    });
}

function growTree() {
    init();
}

function updateBranches() {
    if (maxDepth >= targetDepth) return;

    const newBranches = [];

    branches.forEach(branch => {
        if (branch.depth === maxDepth && !branch.grown) {
            branch.grown = true;

            if (branch.depth < targetDepth) {
                const endX = branch.x + Math.cos(branch.angle) * branch.length;
                const endY = branch.y + Math.sin(branch.angle) * branch.length;

                const angleSpread = 0.4 + Math.random() * 0.3;
                const lengthRatio = 0.65 + Math.random() * 0.15;

                newBranches.push({
                    x: endX,
                    y: endY,
                    angle: branch.angle - angleSpread,
                    length: branch.length * lengthRatio,
                    depth: branch.depth + 1,
                    grown: false
                });

                newBranches.push({
                    x: endX,
                    y: endY,
                    angle: branch.angle + angleSpread,
                    length: branch.length * lengthRatio,
                    depth: branch.depth + 1,
                    grown: false
                });
            }
        }
    });

    branches = branches.concat(newBranches);

    if (newBranches.length > 0) {
        maxDepth++;
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a1a2a');
    gradient.addColorStop(1, '#0a1a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBranches() {
    branches.forEach(branch => {
        const endX = branch.x + Math.cos(branch.angle) * branch.length;
        const endY = branch.y + Math.sin(branch.angle) * branch.length;

        const thickness = Math.max(1, 8 - branch.depth);
        const hue = 30 + branch.depth * 10;
        const lightness = 20 + branch.depth * 5;

        ctx.strokeStyle = `hsl(${hue}, 60%, ${lightness}%)`;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(branch.x, branch.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        if (branch.depth >= targetDepth - 2) {
            const leafHue = 100 + Math.random() * 40;
            ctx.fillStyle = `hsla(${leafHue}, 70%, 50%, 0.8)`;
            ctx.beginPath();
            ctx.arc(endX, endY, 3 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawGround() {
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`深度: ${maxDepth}/${targetDepth}`, 20, 28);
}

function animate() {
    time++;

    if (time % 10 === 0) {
        updateBranches();
    }

    drawBackground();
    drawGround();
    drawBranches();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('growBtn').addEventListener('click', growTree);

init();
animate();
