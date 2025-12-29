const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const K = 3;
const colors = ['#e74c3c', '#3498db', '#2ecc71'];

let points = [];
let centroids = [];
let assignments = [];
let iteration = 0;
let animating = false;

function generatePoints() {
    points = [];
    // Create clustered data
    for (let c = 0; c < 3; c++) {
        const cx = 80 + Math.random() * 200;
        const cy = 60 + Math.random() * 200;
        for (let i = 0; i < 20; i++) {
            points.push({
                x: cx + (Math.random() - 0.5) * 80,
                y: cy + (Math.random() - 0.5) * 80
            });
        }
    }

    // Initialize centroids randomly
    centroids = [];
    for (let i = 0; i < K; i++) {
        centroids.push({
            x: 50 + Math.random() * 260,
            y: 50 + Math.random() * 220
        });
    }

    assignments = new Array(points.length).fill(-1);
    iteration = 0;
}

function assignPoints() {
    let changed = false;
    points.forEach((point, i) => {
        let minDist = Infinity;
        let nearest = 0;
        centroids.forEach((c, j) => {
            const dist = Math.sqrt((point.x - c.x) ** 2 + (point.y - c.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = j;
            }
        });
        if (assignments[i] !== nearest) {
            changed = true;
            assignments[i] = nearest;
        }
    });
    return changed;
}

function updateCentroids() {
    centroids.forEach((c, i) => {
        const clusterPoints = points.filter((_, j) => assignments[j] === i);
        if (clusterPoints.length > 0) {
            c.x = clusterPoints.reduce((s, p) => s + p.x, 0) / clusterPoints.length;
            c.y = clusterPoints.reduce((s, p) => s + p.y, 0) / clusterPoints.length;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw points
    points.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = assignments[i] >= 0 ? colors[assignments[i]] : 'rgba(255,255,255,0.5)';
        ctx.fill();
    });

    // Draw centroids
    centroids.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, c.x, c.y);
    });
}

function step() {
    iteration++;
    const changed = assignPoints();
    updateCentroids();
    draw();
    infoEl.textContent = `迭代 ${iteration} - ${changed ? '收斂中...' : '已收斂!'}`;

    if (changed && iteration < 50) {
        setTimeout(step, 500);
    } else {
        animating = false;
    }
}

document.getElementById('cluster').addEventListener('click', () => {
    if (animating) return;
    animating = true;
    iteration = 0;
    step();
});

document.getElementById('reset').addEventListener('click', () => {
    animating = false;
    generatePoints();
    infoEl.textContent = 'K-Means 聚類演算法';
    draw();
});

generatePoints();
draw();
