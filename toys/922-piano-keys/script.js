const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const whiteKeys = 14;
const whiteKeyWidth = canvas.width / whiteKeys;
const whiteKeyHeight = 180;
const blackKeyWidth = whiteKeyWidth * 0.6;
const blackKeyHeight = 110;

let pressedKeys = [];
let ripples = [];
let autoPlay = false;
let autoPlayTime = 0;

const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0];

function getKeyAtPosition(x, y) {
    const keyY = canvas.height - whiteKeyHeight - 30;

    if (y >= keyY && y < keyY + blackKeyHeight) {
        let blackIndex = 0;
        for (let i = 0; i < whiteKeys; i++) {
            const patternIndex = i % 7;
            if (blackKeyPattern[patternIndex]) {
                const blackX = (i + 1) * whiteKeyWidth - blackKeyWidth / 2;
                if (x >= blackX && x < blackX + blackKeyWidth) {
                    return { type: 'black', index: i, blackIndex };
                }
                blackIndex++;
            }
        }
    }

    if (y >= keyY && y < keyY + whiteKeyHeight) {
        const index = Math.floor(x / whiteKeyWidth);
        if (index >= 0 && index < whiteKeys) {
            return { type: 'white', index };
        }
    }

    return null;
}

function pressKey(key) {
    const id = key.type + key.index;
    if (!pressedKeys.find(k => k.id === id)) {
        pressedKeys.push({ ...key, id, time: 30 });

        const keyY = canvas.height - whiteKeyHeight - 30;
        let x;
        if (key.type === 'white') {
            x = key.index * whiteKeyWidth + whiteKeyWidth / 2;
        } else {
            x = (key.index + 1) * whiteKeyWidth;
        }

        ripples.push({
            x,
            y: 50,
            radius: 10,
            maxRadius: 80,
            hue: key.type === 'white' ? key.index * 25 : key.index * 25 + 180,
            alpha: 1
        });
    }
}

function updateKeys() {
    pressedKeys = pressedKeys.filter(key => {
        key.time--;
        return key.time > 0;
    });
}

function updateRipples() {
    ripples.forEach(r => {
        r.radius += 3;
        r.alpha -= 0.02;
    });
    ripples = ripples.filter(r => r.alpha > 0);
}

function updateAutoPlay() {
    if (autoPlay) {
        autoPlayTime++;
        if (autoPlayTime % 15 === 0) {
            const index = Math.floor(Math.random() * whiteKeys);
            const type = Math.random() < 0.3 ? 'black' : 'white';
            if (type === 'black' && blackKeyPattern[index % 7]) {
                pressKey({ type: 'black', index });
            } else {
                pressKey({ type: 'white', index });
            }
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawRipples() {
    ripples.forEach(r => {
        ctx.strokeStyle = `hsla(${r.hue}, 70%, 60%, ${r.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawPiano() {
    const keyY = canvas.height - whiteKeyHeight - 30;

    for (let i = 0; i < whiteKeys; i++) {
        const x = i * whiteKeyWidth;
        const pressed = pressedKeys.find(k => k.type === 'white' && k.index === i);

        const gradient = ctx.createLinearGradient(x, keyY, x, keyY + whiteKeyHeight);
        if (pressed) {
            gradient.addColorStop(0, '#d0d0d0');
            gradient.addColorStop(1, '#a0a0a0');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#e0e0e0');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, keyY, whiteKeyWidth - 2, whiteKeyHeight);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, keyY, whiteKeyWidth - 2, whiteKeyHeight);

        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(noteNames[i % 7], x + whiteKeyWidth / 2, keyY + whiteKeyHeight - 10);
    }

    for (let i = 0; i < whiteKeys - 1; i++) {
        const patternIndex = i % 7;
        if (blackKeyPattern[patternIndex]) {
            const x = (i + 1) * whiteKeyWidth - blackKeyWidth / 2;
            const pressed = pressedKeys.find(k => k.type === 'black' && k.index === i);

            const gradient = ctx.createLinearGradient(x, keyY, x, keyY + blackKeyHeight);
            if (pressed) {
                gradient.addColorStop(0, '#444');
                gradient.addColorStop(1, '#222');
            } else {
                gradient.addColorStop(0, '#333');
                gradient.addColorStop(1, '#111');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(x, keyY, blackKeyWidth, blackKeyHeight);
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(autoPlay ? '自動演奏中' : '手動模式', 20, 28);
}

function animate() {
    updateKeys();
    updateRipples();
    updateAutoPlay();
    drawBackground();
    drawRipples();
    drawPiano();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const key = getKeyAtPosition(x, y);
    if (key) {
        pressKey(key);
    }
});

document.getElementById('demoBtn').addEventListener('click', () => {
    autoPlay = !autoPlay;
});

animate();
