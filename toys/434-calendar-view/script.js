const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const cellSize = 40;
const startX = 35;
const startY = 70;

// Generate random activity data for current month
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const daysInMonth = new Date(year, month + 1, 0).getDate();
const firstDay = new Date(year, month, 1).getDay();

const activities = {};
for (let d = 1; d <= daysInMonth; d++) {
    activities[d] = Math.floor(Math.random() * 10);
}

let hoverDay = null;

function getColor(value) {
    if (value === 0) return 'rgba(255,255,255,0.1)';
    const intensity = value / 10;
    const r = Math.floor(46 + (231 - 46) * intensity);
    const g = Math.floor(204 - 100 * intensity);
    const b = Math.floor(113 - 50 * intensity);
    return `rgb(${r}, ${g}, ${b})`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Month title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${year}年${month + 1}月 活動熱力圖`, canvas.width / 2, 30);

    // Weekday headers
    ctx.font = '12px Arial';
    weekdays.forEach((day, i) => {
        ctx.fillStyle = i === 0 || i === 6 ? '#e74c3c' : 'rgba(255,255,255,0.8)';
        ctx.fillText(day, startX + i * cellSize + cellSize / 2, 55);
    });

    // Calendar grid
    let row = 0;
    let col = firstDay;

    for (let day = 1; day <= daysInMonth; day++) {
        const x = startX + col * cellSize;
        const y = startY + row * cellSize;
        const value = activities[day];
        const isHover = hoverDay === day;

        // Cell background
        ctx.fillStyle = getColor(value);
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 6);
        ctx.fill();

        // Hover effect
        if (isHover) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Day number
        ctx.fillStyle = value > 5 ? '#fff' : 'rgba(255,255,255,0.8)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(day, x + cellSize / 2, y + cellSize / 2);

        col++;
        if (col > 6) {
            col = 0;
            row++;
        }
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('少', 100, canvas.height - 15);

    for (let i = 0; i <= 4; i++) {
        ctx.fillStyle = getColor(i * 2.5);
        ctx.fillRect(120 + i * 25, canvas.height - 22, 20, 12);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('多', 250, canvas.height - 15);
}

function getDayFromPos(x, y) {
    if (x < startX || y < startY) return null;

    const col = Math.floor((x - startX) / cellSize);
    const row = Math.floor((y - startY) / cellSize);

    if (col < 0 || col > 6) return null;

    const day = row * 7 + col - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;

    return day;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverDay = getDayFromPos(x, y);
    canvas.style.cursor = hoverDay ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', (e) => {
    if (hoverDay) {
        const value = activities[hoverDay];
        infoEl.textContent = `${month + 1}月${hoverDay}日: ${value} 項活動`;
    }
});

draw();
