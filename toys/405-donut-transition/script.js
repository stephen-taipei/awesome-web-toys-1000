const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const datasets = [
    [30, 25, 20, 15, 10],
    [15, 35, 25, 15, 10],
    [20, 20, 30, 20, 10],
    [25, 15, 20, 25, 15]
];

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
const labels = ['產品A', '產品B', '產品C', '產品D', '產品E'];

let currentData = [...datasets[0]];
let targetData = [...datasets[0]];
let animating = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const outerRadius = 120;
    const innerRadius = 60;

    const total = currentData.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    currentData.forEach((value, i) => {
        const sliceAngle = (value / total) * Math.PI * 2;

        // Draw arc
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();

        // Draw label
        if (sliceAngle > 0.3) {
            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = (outerRadius + innerRadius) / 2;
            const lx = cx + Math.cos(midAngle) * labelRadius;
            const ly = cy + Math.sin(midAngle) * labelRadius;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(value / total * 100) + '%', lx, ly);
        }

        startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('總計', cx, cy - 8);
    ctx.font = '14px Arial';
    ctx.fillText(total + '%', cx, cy + 12);
}

function animate() {
    let stillAnimating = false;

    currentData = currentData.map((val, i) => {
        const diff = targetData[i] - val;
        if (Math.abs(diff) > 0.1) {
            stillAnimating = true;
            return val + diff * 0.15;
        }
        return targetData[i];
    });

    draw();

    if (stillAnimating) {
        requestAnimationFrame(animate);
    } else {
        animating = false;
    }
}

function switchDataset(index) {
    targetData = [...datasets[index]];
    if (!animating) {
        animating = true;
        animate();
    }
}

document.querySelectorAll('.data-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.data-btn.active').classList.remove('active');
        btn.classList.add('active');
        switchDataset(parseInt(btn.dataset.set));
    });
});

draw();
