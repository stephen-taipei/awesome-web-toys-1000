const capitals = [
    { country: '日本', capital: '東京' },
    { country: '韓國', capital: '首爾' },
    { country: '中國', capital: '北京' },
    { country: '美國', capital: '華盛頓' },
    { country: '英國', capital: '倫敦' },
    { country: '法國', capital: '巴黎' },
    { country: '德國', capital: '柏林' },
    { country: '義大利', capital: '羅馬' },
    { country: '西班牙', capital: '馬德里' },
    { country: '澳洲', capital: '坎培拉' },
    { country: '加拿大', capital: '渥太華' },
    { country: '俄羅斯', capital: '莫斯科' },
    { country: '印度', capital: '新德里' },
    { country: '泰國', capital: '曼谷' },
    { country: '越南', capital: '河內' }
];

let currentQuestion = null;
let correctCount = 0;
let wrongCount = 0;
let answered = false;

function init() {
    nextQuestion();
}

function nextQuestion() {
    answered = false;
    document.getElementById('result').textContent = '';

    currentQuestion = capitals[Math.floor(Math.random() * capitals.length)];
    document.getElementById('country').textContent = currentQuestion.country;

    const wrongAnswers = capitals
        .filter(c => c.capital !== currentQuestion.capital)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.capital);

    const options = [...wrongAnswers, currentQuestion.capital].sort(() => Math.random() - 0.5);

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
        if (opt.textContent === currentQuestion.capital) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === currentQuestion.capital) {
        correctCount++;
        document.getElementById('result').textContent = '✅ 正確!';
    } else {
        wrongCount++;
        document.getElementById('result').textContent = `❌ 答案是: ${currentQuestion.capital}`;
    }

    document.getElementById('correct').textContent = correctCount;
    document.getElementById('wrong').textContent = wrongCount;

    setTimeout(nextQuestion, 1500);
}

document.addEventListener('DOMContentLoaded', init);
