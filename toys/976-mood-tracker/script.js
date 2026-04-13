const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const moodDisplay = document.getElementById('moodDisplay');
const moodButtons = document.getElementById('moodButtons');

canvas.width = 370;
canvas.height = 150;

const moods = [
    { emoji: '😊', label: '開心', color: '#FFD700', value: 5 },
    { emoji: '😌', label: '平靜', color: '#4DB6AC', value: 4 },
    { emoji: '😐', label: '普通', color: '#90A4AE', value: 3 },
    { emoji: '😔', label: '低落', color: '#5C6BC0', value: 2 },
    { emoji: '😢', label: '難過', color: '#7986CB', value: 1 }
];

let moodHistory = [];
let currentMood = moods[0];

function init() {
    moodDisplay.textContent = currentMood.emoji;

    moodButtons.innerHTML = '';
    moods.forEach(mood => {
        const btn = document.createElement('button');
        btn.textContent = mood.emoji;
        btn.title = mood.label;
        btn.addEventListener('click', () => selectMood(mood));
        moodButtons.appendChild(btn);
    });

    for (let i = 0; i < 10; i++) {
        moodHistory.push(moods[Math.floor(Math.random() * moods.length)]);
    }

    draw();
}

function selectMood(mood) {
    currentMood = mood;
    moodDisplay.textContent = mood.emoji;
    moodDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        moodDisplay.style.transform = 'scale(1)';
    }, 200);

    moodHistory.push(mood);
    if (moodHistory.length > 10) {
        moodHistory.shift();
    }

    draw();
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 40, right: 20, top: 20, bottom: 30 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 1; i <= 5; i++) {
        const y = padding.top + chartHeight - (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();
    }

    if (moodHistory.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#29B6F6';
        ctx.lineWidth = 3;

        moodHistory.forEach((mood, i) => {
            const x = padding.left + (i / (moodHistory.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - (mood.value / 5) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        moodHistory.forEach((mood, i) => {
            const x = padding.left + (i / (moodHistory.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - (mood.value / 5) * chartHeight;

            ctx.beginPath();
            ctx.fillStyle = mood.color;
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(mood.emoji, x, y + 3);
        });
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';

    ['😢', '😔', '😐', '😌', '😊'].forEach((emoji, i) => {
        const y = padding.top + chartHeight - ((i + 1) / 5) * chartHeight;
        ctx.fillText(emoji, padding.left - 10, y + 4);
    });
}

moodDisplay.style.transition = 'transform 0.2s';

init();
