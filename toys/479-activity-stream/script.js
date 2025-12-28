const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const activityTypes = [
    { type: 'login', icon: '🔐', color: '#3498db', label: '登入' },
    { type: 'purchase', icon: '🛒', color: '#2ecc71', label: '購買' },
    { type: 'comment', icon: '💬', color: '#9b59b6', label: '留言' },
    { type: 'like', icon: '❤️', color: '#e74c3c', label: '按讚' },
    { type: 'share', icon: '🔄', color: '#f39c12', label: '分享' },
    { type: 'upload', icon: '📤', color: '#1abc9c', label: '上傳' }
];

const activities = [];
const particles = [];
let totalActivities = 0;

function addActivity() {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const activity = {
        ...type,
        x: Math.random() * (canvas.width - 40) + 20,
        y: canvas.height,
        targetY: 50 + Math.random() * 80,
        opacity: 1,
        scale: 0.5,
        age: 0
    };
    activities.push(activity);
    totalActivities++;

    // Add particles
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: activity.x,
            y: activity.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3 - 1,
            color: type.color,
            size: Math.random() * 4 + 2,
            life: 1
        });
    }
}

function updateActivities() {
    activities.forEach((a, i) => {
        a.y += (a.targetY - a.y) * 0.08;
        a.scale += (1 - a.scale) * 0.1;
        a.age++;

        if (a.age > 120) {
            a.opacity -= 0.02;
        }

        if (a.opacity <= 0) {
            activities.splice(i, 1);
        }
    });

    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('即時活動串流', canvas.width / 2, 25);

    // Draw particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fill();
    });

    // Draw activities
    activities.forEach(a => {
        ctx.save();
        ctx.globalAlpha = a.opacity;
        ctx.translate(a.x, a.y);
        ctx.scale(a.scale, a.scale);

        // Bubble
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fillStyle = a.color + '88';
        ctx.fill();
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.icon, 0, 0);

        ctx.restore();
    });

    // Activity counts
    const counts = {};
    activityTypes.forEach(t => counts[t.type] = 0);
    activities.forEach(a => counts[a.type]++);

    // Stats bar
    const barY = canvas.height - 80;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, barY, canvas.width, 60);

    const barWidth = canvas.width / activityTypes.length;
    activityTypes.forEach((t, i) => {
        const x = i * barWidth + barWidth / 2;

        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.icon, x, barY + 25);

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(counts[t.type], x, barY + 45);
    });

    // Timeline dots at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 30; i++) {
        const x = 20 + i * 11;
        ctx.beginPath();
        ctx.arc(x, canvas.height - 15, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function update() {
    updateActivities();
    draw();
}

function addRandomActivity() {
    addActivity();
    infoEl.textContent = `總活動數: ${totalActivities}`;
}

// Animation loop
setInterval(update, 1000 / 60);

// Add new activity every 500-1500ms
function scheduleActivity() {
    addRandomActivity();
    setTimeout(scheduleActivity, Math.random() * 1000 + 500);
}
scheduleActivity();
