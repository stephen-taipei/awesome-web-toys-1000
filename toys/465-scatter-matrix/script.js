const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const variables = ['身高', '體重', '年齡'];
const n = 50;

// Generate correlated data
const data = [];
for (let i = 0; i < n; i++) {
    const height = 150 + Math.random() * 40;
    const weight = height * 0.5 - 30 + (Math.random() - 0.5) * 20;
    const age = 20 + Math.random() * 40;
    data.push([height, weight, age]);
}

const cellSize = 90;
const padding = 45;
const dotRadius = 3;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('變數散佈矩陣', canvas.width / 2, 20);

    const colors = ['#e74c3c', '#3498db', '#2ecc71'];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const x = padding + col * cellSize;
            const y = 35 + row * cellSize;

            // Cell background
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(x, y, cellSize - 5, cellSize - 5);

            if (row === col) {
                // Diagonal - variable name
                ctx.fillStyle = colors[row];
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(variables[row], x + cellSize / 2 - 2, y + cellSize / 2);
            } else {
                // Scatter plot
                const xVar = col;
                const yVar = row;

                const xMin = Math.min(...data.map(d => d[xVar]));
                const xMax = Math.max(...data.map(d => d[xVar]));
                const yMin = Math.min(...data.map(d => d[yVar]));
                const yMax = Math.max(...data.map(d => d[yVar]));

                data.forEach(d => {
                    const px = x + 8 + ((d[xVar] - xMin) / (xMax - xMin)) * (cellSize - 20);
                    const py = y + cellSize - 12 - ((d[yVar] - yMin) / (yMax - yMin)) * (cellSize - 20);

                    ctx.beginPath();
                    ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `${colors[xVar]}88`;
                    ctx.fill();
                });
            }
        }
    }

    // Row labels (left)
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    variables.forEach((v, i) => {
        ctx.save();
        ctx.translate(padding - 8, 35 + i * cellSize + cellSize / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(v, 0, 0);
        ctx.restore();
    });

    // Column labels (bottom)
    ctx.textAlign = 'center';
    variables.forEach((v, i) => {
        ctx.fillText(v, padding + i * cellSize + cellSize / 2 - 2, 35 + 3 * cellSize + 10);
    });
}

draw();

canvas.addEventListener('click', () => {
    // Calculate correlations
    function correlation(x, y) {
        const n = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;
        let num = 0, denX = 0, denY = 0;
        for (let i = 0; i < n; i++) {
            num += (x[i] - meanX) * (y[i] - meanY);
            denX += (x[i] - meanX) ** 2;
            denY += (y[i] - meanY) ** 2;
        }
        return num / Math.sqrt(denX * denY);
    }

    const r = correlation(data.map(d => d[0]), data.map(d => d[1]));
    infoEl.textContent = `身高-體重相關係數: r = ${r.toFixed(3)}`;
});
