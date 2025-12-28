const countries = [
    { flag: '🇯🇵', name: '日本' },
    { flag: '🇰🇷', name: '韓國' },
    { flag: '🇨🇳', name: '中國' },
    { flag: '🇺🇸', name: '美國' },
    { flag: '🇬🇧', name: '英國' },
    { flag: '🇫🇷', name: '法國' },
    { flag: '🇩🇪', name: '德國' },
    { flag: '🇮🇹', name: '義大利' },
    { flag: '🇪🇸', name: '西班牙' },
    { flag: '🇧🇷', name: '巴西' },
    { flag: '🇦🇺', name: '澳洲' },
    { flag: '🇨🇦', name: '加拿大' },
    { flag: '🇷🇺', name: '俄羅斯' },
    { flag: '🇮🇳', name: '印度' },
    { flag: '🇹🇭', name: '泰國' }
];

let currentCountry = null;
let score = 0;
let answered = false;

function init() {
    nextQuestion();
}

function nextQuestion() {
    answered = false;
    document.getElementById('result').textContent = '';

    // Pick random country
    currentCountry = countries[Math.floor(Math.random() * countries.length)];
    document.getElementById('flag').textContent = currentCountry.flag;

    // Generate options
    const wrongAnswers = countries
        .filter(c => c.name !== currentCountry.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.name);

    const options = [...wrongAnswers, currentCountry.name].sort(() => Math.random() - 0.5);

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
        if (opt.textContent === currentCountry.name) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === currentCountry.name) {
        score += 10;
        document.getElementById('result').textContent = '✅ 正確! +10分';
    } else {
        document.getElementById('result').textContent = `❌ 答案是: ${currentCountry.name}`;
    }

    document.getElementById('score').textContent = score;

    setTimeout(nextQuestion, 1500);
}

document.addEventListener('DOMContentLoaded', init);
