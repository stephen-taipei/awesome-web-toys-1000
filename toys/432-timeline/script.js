const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const events = [
    { year: 2018, title: '專案啟動', desc: '團隊組建，開始規劃', color: '#e74c3c' },
    { year: 2019, title: '第一版發布', desc: '正式上線，獲得好評', color: '#f39c12' },
    { year: 2020, title: '重大更新', desc: '增加多項新功能', color: '#2ecc71' },
    { year: 2021, title: '全球擴展', desc: '進入國際市場', color: '#3498db' },
    { year: 2022, title: '百萬用戶', desc: '用戶突破百萬', color: '#9b59b6' },
    { year: 2023, title: 'AI 整合', desc: '導入人工智慧技術', color: '#1abc9c' },
    { year: 2024, title: '新里程碑', desc: '持續創新中...', color: '#e67e22' }
];

let selectedEvent = null;
let hoverEvent = null;

function getEventY(index) {
    return 50 + index * 35;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Timeline line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 40);
    ctx.lineTo(80, canvas.height - 30);
    ctx.stroke();

    // Events
    events.forEach((event, i) => {
        const y = getEventY(i);
        const isSelected = selectedEvent === i;
        const isHover = hoverEvent === i;

        // Node
        ctx.beginPath();
        ctx.arc(80, y, isSelected ? 12 : (isHover ? 10 : 8), 0, Math.PI * 2);
        ctx.fillStyle = event.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Connector line
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(92, y);
        ctx.lineTo(110, y);
        ctx.stroke();

        // Event box
        const boxWidth = isSelected ? 220 : 200;
        ctx.fillStyle = isSelected ? event.color : `${event.color}88`;
        ctx.beginPath();
        ctx.roundRect(110, y - 15, boxWidth, 30, 8);
        ctx.fill();

        // Year
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(event.year, 120, y + 5);

        // Title
        ctx.font = '11px Arial';
        ctx.fillText(event.title, 170, y + 5);
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('專案歷程', canvas.width / 2, 25);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    hoverEvent = null;
    events.forEach((event, i) => {
        const eventY = getEventY(i);
        if (Math.abs(y - eventY) < 18) {
            hoverEvent = i;
        }
    });
    canvas.style.cursor = hoverEvent !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    events.forEach((event, i) => {
        const eventY = getEventY(i);
        if (Math.abs(y - eventY) < 18) {
            selectedEvent = i;
            infoEl.innerHTML = `<strong>${event.year} - ${event.title}</strong><br>${event.desc}`;
        }
    });
    draw();
});

draw();
