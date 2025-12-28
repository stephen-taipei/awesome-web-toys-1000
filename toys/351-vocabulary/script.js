const vocabulary = [
    { word: 'Apple', meaning: '蘋果' },
    { word: 'Book', meaning: '書' },
    { word: 'Cat', meaning: '貓' },
    { word: 'Dog', meaning: '狗' },
    { word: 'Elephant', meaning: '大象' },
    { word: 'Flower', meaning: '花' },
    { word: 'Garden', meaning: '花園' },
    { word: 'House', meaning: '房子' },
    { word: 'Island', meaning: '島嶼' },
    { word: 'Journey', meaning: '旅程' },
    { word: 'Kitchen', meaning: '廚房' },
    { word: 'Library', meaning: '圖書館' },
    { word: 'Mountain', meaning: '山' },
    { word: 'Night', meaning: '夜晚' },
    { word: 'Ocean', meaning: '海洋' }
];

let currentWord = null;
let correct = 0;
let total = 0;
let answered = false;

function init() {
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    nextQuestion();
}

function nextQuestion() {
    answered = false;
    document.getElementById('result').textContent = '';
    document.getElementById('nextBtn').style.display = 'none';

    // Pick random word
    currentWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    document.getElementById('word').textContent = currentWord.word;

    // Generate options
    const wrongAnswers = vocabulary
        .filter(v => v.word !== currentWord.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(v => v.meaning);

    const options = [...wrongAnswers, currentWord.meaning].sort(() => Math.random() - 0.5);

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = options.map(opt => `
        <button class="option" onclick="checkAnswer('${opt}')">${opt}</button>
    `).join('');
}

function checkAnswer(selected) {
    if (answered) return;
    answered = true;
    total++;

    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        if (opt.textContent === currentWord.meaning) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === currentWord.meaning) {
        correct++;
        document.getElementById('result').textContent = '✅ 正確!';
    } else {
        document.getElementById('result').textContent = '❌ 錯誤!';
    }

    document.getElementById('correct').textContent = correct;
    document.getElementById('total').textContent = total;
    document.getElementById('nextBtn').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);
