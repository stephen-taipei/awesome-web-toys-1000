const elements = [
    { symbol: 'H', number: 1, name: '氫' },
    { symbol: 'He', number: 2, name: '氦' },
    { symbol: 'Li', number: 3, name: '鋰' },
    { symbol: 'C', number: 6, name: '碳' },
    { symbol: 'N', number: 7, name: '氮' },
    { symbol: 'O', number: 8, name: '氧' },
    { symbol: 'Na', number: 11, name: '鈉' },
    { symbol: 'Mg', number: 12, name: '鎂' },
    { symbol: 'Al', number: 13, name: '鋁' },
    { symbol: 'Si', number: 14, name: '矽' },
    { symbol: 'Fe', number: 26, name: '鐵' },
    { symbol: 'Cu', number: 29, name: '銅' },
    { symbol: 'Zn', number: 30, name: '鋅' },
    { symbol: 'Ag', number: 47, name: '銀' },
    { symbol: 'Au', number: 79, name: '金' }
];

let currentElement = null;
let score = 0;
let answered = false;

function init() {
    nextQuestion();
}

function nextQuestion() {
    answered = false;
    document.getElementById('result').textContent = '';

    currentElement = elements[Math.floor(Math.random() * elements.length)];
    document.getElementById('symbol').textContent = currentElement.symbol;
    document.getElementById('number').textContent = currentElement.number;

    const wrongAnswers = elements
        .filter(e => e.name !== currentElement.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(e => e.name);

    const options = [...wrongAnswers, currentElement.name].sort(() => Math.random() - 0.5);

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = options.map(opt =>
        `<button class="option" onclick="checkAnswer('${opt}')">${opt}</button>`
    ).join('');
}

function checkAnswer(selected) {
    if (answered) return;
    answered = true;

    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        if (opt.textContent === currentElement.name) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === currentElement.name) {
        score += 10;
        document.getElementById('result').textContent = '✅ 正確!';
    } else {
        document.getElementById('result').textContent = `❌ 答案是: ${currentElement.name}`;
    }

    document.getElementById('score').textContent = score;

    setTimeout(nextQuestion, 1500);
}

document.addEventListener('DOMContentLoaded', init);
