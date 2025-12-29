const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const variables = ['身高', '體重', '年齡', '收入', '運動'];
const matrix = [
    [1.00, 0.85, 0.15, 0.25, 0.30],
    [0.85, 1.00, 0.20, 0.20, -0.35],
    [0.15, 0.20, 1.00, 0.60, -0.40],
    [0.25, 0.20, 0.60, 1.00, 0.10],
    [0.30, -0.35, -0.40, 0.10, 1.00]
];

const cellSize = 50;
const startX = 70;
const startY = 60;
let hoverCell = null;

function getColor(value) {
    if (value >= 0) {
        const intensity = value;
        return `rgb(${Math.round(52 + 180 * (1 - intensity))}, ${Math.round(152 + 50 * intensity)}, ${Math.round(219 * (1 - intensity) + 100 * intensity)})`;
    } else {
        const intensity = -value;
        return `rgb(${Math.round(231 * intensity + 100 * (1 - intensity))}, ${Math.round(76 * intensity + 100 * (1 - intensity))}, ${Math.round(60 * intensity + 100 * (1 - intensity))})`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('變數相關性矩陣', canvas.width / 2, 25);

    // Draw cells
    for (let i = 0; i < variables.length; i++) {
        for (let j = 0; j < variables.length; j++) {
            const x = startX + j * cellSize;
            const y = startY + i * cellSize;
            const value = matrix[i][j];
            const isHover = hoverCell && hoverCell.row === i && hoverCell.col === j;

            ctx.fillStyle = getColor(value);
            ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

            if (isHover) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
            }

            // Value text
            ctx.fillStyle = Math.abs(value) > 0.5 ? '#fff' : 'rgba(255,255,255,0.8)';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value.toFixed(2), x + cellSize / 2 - 1, y + cellSize / 2 + 4);
        }
    }

    // Row labels
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    variables.forEach((v, i) => {
        ctx.fillText(v, startX - 8, startY + i * cellSize + cellSize / 2 + 4);
    });

    // Column labels
    ctx.textAlign = 'center';
    variables.forEach((v, i) => {
        ctx.save();
        ctx.translate(startX + i * cellSize + cellSize / 2, startY - 8);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(v, 0, 0);
        ctx.restore();
    });

    // Legend
    const legendX = startX + variables.length * cellSize + 15;
    const legendY = startY + 20;
    const legendHeight = 150;

    for (let i = 0; i < legendHeight; i++) {
        const value = 1 - (i / legendHeight) * 2;
        ctx.fillStyle = getColor(value);
        ctx.fillRect(legendX, legendY + i, 15, 1);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('+1.0', legendX + 20, legendY + 5);
    ctx.fillText('0.0', legendX + 20, legendY + legendHeight / 2 + 3);
    ctx.fillText('-1.0', legendX + 20, legendY + legendHeight);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor((x - startX) / cellSize);
    const row = Math.floor((y - startY) / cellSize);

    if (row >= 0 && row < variables.length && col >= 0 && col < variables.length) {
        hoverCell = { row, col };
    } else {
        hoverCell = null;
    }

    canvas.style.cursor = hoverCell ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverCell) {
        const v1 = variables[hoverCell.row];
        const v2 = variables[hoverCell.col];
        const corr = matrix[hoverCell.row][hoverCell.col];
        const strength = Math.abs(corr) > 0.7 ? '強' : (Math.abs(corr) > 0.3 ? '中' : '弱');
        const direction = corr > 0 ? '正' : '負';
        infoEl.textContent = `${v1} vs ${v2}: ${direction}相關 (${strength}) r=${corr.toFixed(2)}`;
    }
});

draw();
