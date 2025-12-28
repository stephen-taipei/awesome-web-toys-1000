let history = [];

function init() {
    document.getElementById('drawBtn').addEventListener('click', draw);
    renderBalls([]);
}

function draw() {
    const numbers = [];
    while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);

    let bonus;
    do {
        bonus = Math.floor(Math.random() * 49) + 1;
    } while (numbers.includes(bonus));

    animateDraw(numbers, bonus);
}

function animateDraw(numbers, bonus) {
    const ballsContainer = document.getElementById('balls');
    ballsContainer.innerHTML = '';

    numbers.forEach((num, i) => {
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.style.animation = 'pop 0.3s ease-out';
            ball.textContent = num;
            ballsContainer.appendChild(ball);

            if (i === numbers.length - 1) {
                setTimeout(() => {
                    const bonusBall = document.getElementById('bonusBall');
                    bonusBall.textContent = bonus;
                    bonusBall.style.animation = 'pop 0.3s ease-out';

                    history.unshift({ numbers, bonus });
                    if (history.length > 5) history.pop();
                    renderHistory();
                }, 300);
            }
        }, i * 300);
    });
}

function renderBalls(numbers) {
    const ballsContainer = document.getElementById('balls');
    ballsContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.textContent = numbers[i] || '?';
        ballsContainer.appendChild(ball);
    }
}

function renderHistory() {
    const container = document.getElementById('history');
    container.innerHTML = history.map((h, i) =>
        '<div>' + (i + 1) + '. ' + h.numbers.join(', ') + ' + ' + h.bonus + '</div>'
    ).join('');
}

const style = document.createElement('style');
style.textContent = '@keyframes pop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }';
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);
