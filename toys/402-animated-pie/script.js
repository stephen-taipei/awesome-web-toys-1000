const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const legendEl = document.getElementById('legend');

const categories = [
    { name: '科技', color: '#3498db' },
    { name: '金融', color: '#e74c3c' },
    { name: '醫療', color: '#2ecc71' },
    { name: '零售', color: '#f39c12' },
    { name: '能源', color: '#9b59b6' }
];

let currentValues = categories.map(() => Math.random() * 100 + 20);
let targetValues = [...currentValues];
let animating = false;

function createLegend() {
    legendEl.innerHTML = '';
    categories.forEach((cat, i) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background: ${cat.color}"></div>
            <span>${cat.name}: <span id="val${i}">${Math.round(currentValues[i])}</span>%</span>
        `;
        legendEl.appendChild(item);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 120;

    const total = currentValues.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    categories.forEach((cat, i) => {
        const sliceAngle = (currentValues[i] / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = cat.color;
        ctx.fill();

        // Label
        if (sliceAngle > 0.2) {
            const midAngle = startAngle + sliceAngle / 2;
            const labelX = cx + Math.cos(midAngle) * (radius * 0.65);
            const labelY = cy + Math.sin(midAngle) * (radius * 0.65);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(currentValues[i] / total * 100) + '%', labelX, labelY);
        }

        startAngle += sliceAngle;

        // Update legend value
        const valEl = document.getElementById(`val${i}`);
        if (valEl) valEl.textContent = Math.round(currentValues[i]);
    });
}

function animate() {
    let stillAnimating = false;

    currentValues = currentValues.map((val, i) => {
        const diff = targetValues[i] - val;
        if (Math.abs(diff) > 0.5) {
            stillAnimating = true;
            return val + diff * 0.1;
        }
        return targetValues[i];
    });

    draw();

    if (stillAnimating) {
        requestAnimationFrame(animate);
    } else {
        animating = false;
    }
}

function randomize() {
    targetValues = categories.map(() => Math.random() * 100 + 20);
    if (!animating) {
        animating = true;
        animate();
    }
}

document.getElementById('randomize').addEventListener('click', randomize);

createLegend();
draw();
