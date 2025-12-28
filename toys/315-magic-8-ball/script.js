const answers = [
    '肯定的', '毫無疑問', '絕對是', '你可以相信',
    '看起來是', '很可能', '前景不錯', '是的',
    '訊息不清楚', '稍後再問', '現在無法預測', '專注後再問',
    '不要指望', '我的回答是否', '我的消息說不', '前景不妙', '非常懷疑'
];

let isShaking = false;

function init() {
    document.getElementById('shakeBtn').addEventListener('click', shake);
    document.getElementById('ball').addEventListener('click', shake);
}

function shake() {
    if (isShaking) return;
    isShaking = true;

    const ball = document.getElementById('ball');
    const answer = document.getElementById('answer');

    answer.classList.add('hidden');
    ball.classList.add('shaking');

    setTimeout(() => {
        ball.classList.remove('shaking');
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        answer.textContent = randomAnswer;
        answer.classList.remove('hidden');
        isShaking = false;
    }, 500);
}

document.addEventListener('DOMContentLoaded', init);
