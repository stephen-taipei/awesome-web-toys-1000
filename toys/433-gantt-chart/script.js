const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const tasks = [
    { name: '需求分析', start: 0, duration: 2, color: '#e74c3c', progress: 100 },
    { name: '系統設計', start: 1, duration: 3, color: '#f39c12', progress: 100 },
    { name: '前端開發', start: 3, duration: 4, color: '#3498db', progress: 80 },
    { name: '後端開發', start: 3, duration: 5, color: '#2ecc71', progress: 60 },
    { name: '資料庫', start: 4, duration: 2, color: '#9b59b6', progress: 50 },
    { name: '測試', start: 6, duration: 3, color: '#1abc9c', progress: 20 },
    { name: '部署', start: 8, duration: 2, color: '#e67e22', progress: 0 }
];

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'];
const chartLeft = 80;
const chartTop = 50;
const rowHeight = 30;
const weekWidth = 28;

let hoverTask = null;
let currentWeek = 4; // Simulated current week

function draw() {
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('專案甘特圖', canvas.width / 2, 25);

    // Week headers
    ctx.font = '10px Arial';
    weeks.forEach((week, i) => {
        const x = chartLeft + i * weekWidth + weekWidth / 2;
        ctx.fillStyle = i < currentWeek ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)';
        ctx.fillText(week, x, 45);
    });

    // Current week indicator
    ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
    ctx.fillRect(chartLeft + currentWeek * weekWidth, chartTop, weekWidth, tasks.length * rowHeight);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= weeks.length; i++) {
        ctx.beginPath();
        ctx.moveTo(chartLeft + i * weekWidth, chartTop);
        ctx.lineTo(chartLeft + i * weekWidth, chartTop + tasks.length * rowHeight);
        ctx.stroke();
    }

    // Tasks
    tasks.forEach((task, i) => {
        const y = chartTop + i * rowHeight;
        const isHover = hoverTask === i;

        // Task name
        ctx.fillStyle = isHover ? '#fff' : 'rgba(255,255,255,0.8)';
        ctx.font = isHover ? 'bold 11px Arial' : '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(task.name, chartLeft - 8, y + rowHeight / 2 + 4);

        // Task bar background
        const barX = chartLeft + task.start * weekWidth;
        const barWidth = task.duration * weekWidth;
        ctx.fillStyle = `${task.color}44`;
        ctx.beginPath();
        ctx.roundRect(barX + 2, y + 5, barWidth - 4, rowHeight - 10, 4);
        ctx.fill();

        // Progress fill
        const progressWidth = (barWidth - 4) * (task.progress / 100);
        ctx.fillStyle = task.color;
        ctx.beginPath();
        ctx.roundRect(barX + 2, y + 5, progressWidth, rowHeight - 10, 4);
        ctx.fill();

        // Progress text
        if (task.progress > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${task.progress}%`, barX + barWidth / 2, y + rowHeight / 2 + 3);
        }
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('▮ 已完成  ▯ 待進行  | 目前週', 20, canvas.height - 15);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    hoverTask = null;
    tasks.forEach((task, i) => {
        const taskY = chartTop + i * rowHeight;
        if (y >= taskY && y < taskY + rowHeight) {
            hoverTask = i;
        }
    });
    canvas.style.cursor = hoverTask !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverTask !== null) {
        const task = tasks[hoverTask];
        infoEl.textContent = `${task.name}: 第${task.start + 1}週開始，為期${task.duration}週，進度${task.progress}%`;
    }
});

draw();
