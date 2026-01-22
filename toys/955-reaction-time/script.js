const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let state = 'idle';
let startTime = 0;
let reactionTime = 0;
let results = [];
let timeout = null;

function draw() {
    let bgColor, message, subMessage;

    switch (state) {
        case 'idle':
            bgColor = '#0a0a15';
            message = '點擊開始測試';
            subMessage = '準備好了嗎？';
            break;
        case 'waiting':
            bgColor = '#C62828';
            message = '等待...';
            subMessage = '當變成綠色時點擊！';
            break;
        case 'ready':
            bgColor = '#2E7D32';
            message = '點擊！';
            subMessage = '';
            break;
        case 'result':
            bgColor = '#1565C0';
            message = `${reactionTime} 毫秒`;
            subMessage = getResultMessage();
            break;
        case 'early':
            bgColor = '#E65100';
            message = '太早了！';
            subMessage = '請等待綠色出現';
            break;
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '16px Arial';
    ctx.fillText(subMessage, canvas.width / 2, canvas.height / 2 + 30);

    if (results.length > 0) {
        const avg = Math.round(results.reduce((a, b) => a + b) / results.length);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText(`平均: ${avg}ms (${results.length}次)`, canvas.width / 2, canvas.height - 30);
    }
}

function getResultMessage() {
    if (reactionTime < 200) return '超快！你是超人嗎？';
    if (reactionTime < 250) return '非常快！反應極佳';
    if (reactionTime < 300) return '很好！高於平均';
    if (reactionTime < 350) return '不錯！普通水準';
    return '還可以，繼續練習！';
}

function startTest() {
    state = 'waiting';
    draw();

    const delay = 2000 + Math.random() * 3000;
    timeout = setTimeout(() => {
        state = 'ready';
        startTime = Date.now();
        draw();
    }, delay);
}

canvas.addEventListener('click', () => {
    switch (state) {
        case 'idle':
        case 'result':
        case 'early':
            startTest();
            break;
        case 'waiting':
            clearTimeout(timeout);
            state = 'early';
            draw();
            break;
        case 'ready':
            reactionTime = Date.now() - startTime;
            results.push(reactionTime);
            if (results.length > 5) results.shift();
            state = 'result';
            draw();
            break;
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (state === 'idle' || state === 'result' || state === 'early') {
        startTest();
    }
});

draw();
