const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const tracks = [
    { name: '位置', keyframes: [{ time: 0, value: 0 }, { time: 0.3, value: 100 }, { time: 0.7, value: 50 }, { time: 1, value: 80 }], color: '#e74c3c' },
    { name: '透明度', keyframes: [{ time: 0, value: 100 }, { time: 0.5, value: 30 }, { time: 1, value: 100 }], color: '#3498db' },
    { name: '縮放', keyframes: [{ time: 0, value: 50 }, { time: 0.4, value: 100 }, { time: 0.8, value: 80 }, { time: 1, value: 50 }], color: '#2ecc71' },
    { name: '旋轉', keyframes: [{ time: 0, value: 0 }, { time: 0.5, value: 50 }, { time: 1, value: 100 }], color: '#f39c12' }
];

let playhead = 0;
let playing = false;
let dragging = false;

const timelineTop = 140;
const timelineLeft = 80;
const timelineWidth = 250;
const trackHeight = 30;

function interpolate(keyframes, t) {
    for (let i = 0; i < keyframes.length - 1; i++) {
        if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
            const progress = (t - keyframes[i].time) / (keyframes[i + 1].time - keyframes[i].time);
            return keyframes[i].value + (keyframes[i + 1].value - keyframes[i].value) * progress;
        }
    }
    return keyframes[keyframes.length - 1].value;
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Preview area
    const previewX = 80 + interpolate(tracks[0].keyframes, playhead) * 1.5;
    const previewY = 60;
    const opacity = interpolate(tracks[1].keyframes, playhead) / 100;
    const scale = interpolate(tracks[2].keyframes, playhead) / 100;
    const rotation = interpolate(tracks[3].keyframes, playhead) * 3.6 * Math.PI / 180;

    ctx.save();
    ctx.translate(previewX, previewY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-20, -20, 40, 40);
    ctx.restore();

    // Time ruler
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(timelineLeft, timelineTop - 20, timelineWidth, 15);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 10; i++) {
        const x = timelineLeft + (i / 10) * timelineWidth;
        ctx.fillText(`${(i / 10).toFixed(1)}s`, x, timelineTop - 8);
    }

    // Tracks
    tracks.forEach((track, i) => {
        const y = timelineTop + i * trackHeight;

        // Track label
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(track.name, timelineLeft - 10, y + trackHeight / 2 + 4);

        // Track background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(timelineLeft, y + 5, timelineWidth, trackHeight - 10);

        // Keyframes
        track.keyframes.forEach(kf => {
            const kfX = timelineLeft + kf.time * timelineWidth;
            ctx.beginPath();
            ctx.moveTo(kfX, y + 10);
            ctx.lineTo(kfX + 6, y + trackHeight / 2);
            ctx.lineTo(kfX, y + trackHeight - 10);
            ctx.lineTo(kfX - 6, y + trackHeight / 2);
            ctx.closePath();
            ctx.fillStyle = track.color;
            ctx.fill();
        });

        // Curve preview
        ctx.strokeStyle = `${track.color}88`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.02) {
            const x = timelineLeft + t * timelineWidth;
            const val = interpolate(track.keyframes, t);
            const curveY = y + trackHeight - 8 - (val / 100) * (trackHeight - 16);
            if (t === 0) ctx.moveTo(x, curveY);
            else ctx.lineTo(x, curveY);
        }
        ctx.stroke();
    });

    // Playhead
    const phX = timelineLeft + playhead * timelineWidth;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(phX, timelineTop - 5);
    ctx.lineTo(phX, timelineTop + tracks.length * trackHeight);
    ctx.stroke();

    // Playhead handle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(phX - 8, timelineTop - 20);
    ctx.lineTo(phX + 8, timelineTop - 20);
    ctx.lineTo(phX + 8, timelineTop - 10);
    ctx.lineTo(phX, timelineTop - 5);
    ctx.lineTo(phX - 8, timelineTop - 10);
    ctx.closePath();
    ctx.fill();

    // Time display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`時間: ${playhead.toFixed(2)}s`, 20, 25);
}

function update() {
    if (playing) {
        playhead += 0.01;
        if (playhead > 1) playhead = 0;
    }
    draw();
    requestAnimationFrame(update);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= timelineLeft && x <= timelineLeft + timelineWidth && y >= timelineTop - 25) {
        dragging = true;
        playhead = Math.max(0, Math.min(1, (x - timelineLeft) / timelineWidth));
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        playhead = Math.max(0, Math.min(1, (x - timelineLeft) / timelineWidth));
    }
});

canvas.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mouseleave', () => dragging = false);

document.getElementById('play').addEventListener('click', () => {
    playing = !playing;
    infoEl.textContent = playing ? '播放中...' : '已暫停';
});

document.getElementById('stop').addEventListener('click', () => {
    playing = false;
    playhead = 0;
    infoEl.textContent = '已停止';
});

document.getElementById('rewind').addEventListener('click', () => {
    playhead = 0;
    infoEl.textContent = '已回到開始';
});

update();
