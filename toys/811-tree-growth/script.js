const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let branches = [];
let growing = false;

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#98d8c8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 35, canvas.width, 10);
}

function growTree() {
    branches = [];
    growing = true;

    branches.push({
        x1: canvas.width / 2,
        y1: canvas.height - 30,
        x2: canvas.width / 2,
        y2: canvas.height - 30,
        targetY: canvas.height - 100,
        angle: -Math.PI / 2,
        length: 70,
        width: 8,
        depth: 0,
        growing: true
    });
}

function updateBranches() {
    let allDone = true;

    branches.forEach(branch => {
        if (branch.growing) {
            allDone = false;
            const speed = 2;
            const dx = Math.cos(branch.angle) * speed;
            const dy = Math.sin(branch.angle) * speed;

            branch.x2 += dx;
            branch.y2 += dy;

            const currentLength = Math.sqrt(
                Math.pow(branch.x2 - branch.x1, 2) + Math.pow(branch.y2 - branch.y1, 2)
            );

            if (currentLength >= branch.length) {
                branch.growing = false;

                if (branch.depth < 6 && branch.length > 10) {
                    const spread = 0.3 + Math.random() * 0.4;
                    const shrink = 0.65 + Math.random() * 0.15;

                    branches.push({
                        x1: branch.x2,
                        y1: branch.y2,
                        x2: branch.x2,
                        y2: branch.y2,
                        angle: branch.angle - spread,
                        length: branch.length * shrink,
                        width: branch.width * 0.7,
                        depth: branch.depth + 1,
                        growing: true
                    });

                    branches.push({
                        x1: branch.x2,
                        y1: branch.y2,
                        x2: branch.x2,
                        y2: branch.y2,
                        angle: branch.angle + spread,
                        length: branch.length * shrink,
                        width: branch.width * 0.7,
                        depth: branch.depth + 1,
                        growing: true
                    });
                }
            }
        }
    });

    if (allDone) growing = false;
}

function drawBranches() {
    branches.forEach(branch => {
        const isLeaf = branch.depth >= 5;

        if (isLeaf) {
            ctx.fillStyle = `hsl(${100 + Math.random() * 40}, 60%, ${40 + Math.random() * 20}%)`;
            ctx.beginPath();
            ctx.arc(branch.x2, branch.y2, 4 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = '#4a3728';
            ctx.lineWidth = branch.width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(branch.x1, branch.y1);
            ctx.lineTo(branch.x2, branch.y2);
            ctx.stroke();
        }
    });
}

function animate() {
    drawBackground();

    if (growing) {
        updateBranches();
    }

    drawBranches();
    requestAnimationFrame(animate);
}

document.getElementById('growBtn').addEventListener('click', growTree);

growTree();
animate();
