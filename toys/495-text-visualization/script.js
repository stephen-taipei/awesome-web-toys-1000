const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const modeSelect = document.getElementById('modeSelect');
const infoEl = document.getElementById('info');

const sampleText = '床前明月光，疑是地上霜。舉頭望明月，低頭思故鄉。靜夜思，李白。春眠不覺曉，處處聞啼鳥。夜來風雨聲，花落知多少。';

function getCharColor(char) {
    const code = char.charCodeAt(0);
    const hue = (code * 137) % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

function drawArc() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height - 30;
    const chars = sampleText.split('');

    chars.forEach((char, i) => {
        if (char === '，' || char === '。') return;

        const angle = Math.PI + (i / chars.length) * Math.PI;
        const radius = 80 + (i % 3) * 40;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        ctx.fillStyle = getCharColor(char);
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('唐詩視覺化', cx, canvas.height - 10);
}

function drawSpiral() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const chars = sampleText.split('');

    chars.forEach((char, i) => {
        if (char === '，' || char === '。') return;

        const angle = i * 0.4;
        const radius = 20 + i * 3;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        const size = 20 - i * 0.2;
        ctx.fillStyle = getCharColor(char);
        ctx.font = `bold ${Math.max(8, size)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(char, x, y);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Arial';
    ctx.fillText('螺旋文字', cx, canvas.height - 15);
}

function drawWave() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chars = sampleText.split('');
    const startX = 20;
    const startY = canvas.height / 2;

    chars.forEach((char, i) => {
        if (char === '，' || char === '。') return;

        const x = startX + (i % 18) * 18;
        const row = Math.floor(i / 18);
        const wave = Math.sin(i * 0.3) * 30;
        const y = startY + wave + row * 50 - 40;

        ctx.fillStyle = getCharColor(char);
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(char, x, y);
    });

    // Draw wave line
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 5) {
        const y = canvas.height - 30 + Math.sin(x * 0.02) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();
}

function draw() {
    const mode = modeSelect.value;

    switch (mode) {
        case 'arc':
            drawArc();
            infoEl.textContent = '弧形佈局 - 文字沿弧線排列';
            break;
        case 'spiral':
            drawSpiral();
            infoEl.textContent = '螺旋佈局 - 文字由中心向外旋轉';
            break;
        case 'wave':
            drawWave();
            infoEl.textContent = '波浪佈局 - 文字隨波浪起伏';
            break;
    }
}

modeSelect.addEventListener('change', draw);
draw();
