const questions = [
    { category: '科學', q: '太陽系中最大的行星是什麼?', options: ['木星', '土星', '天王星', '海王星'], answer: 0 },
    { category: '地理', q: '世界上最長的河流是什麼?', options: ['亞馬遜河', '尼羅河', '長江', '密西西比河'], answer: 1 },
    { category: '歷史', q: '第一次世界大戰開始於哪一年?', options: ['1912', '1914', '1916', '1918'], answer: 1 },
    { category: '文學', q: '《西遊記》的作者是誰?', options: ['吳承恩', '曹雪芹', '施耐庵', '羅貫中'], answer: 0 },
    { category: '科學', q: '水的化學式是什麼?', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 0 },
    { category: '地理', q: '哪個國家的面積最大?', options: ['中國', '加拿大', '美國', '俄羅斯'], answer: 3 },
    { category: '自然', q: '蜜蜂的眼睛有幾隻?', options: ['2隻', '3隻', '4隻', '5隻'], answer: 3 },
    { category: '科技', q: 'WWW代表什麼?', options: ['World Wide Web', 'World War Web', 'Web Wide World', 'Wide World Web'], answer: 0 },
    { category: '音樂', q: '鋼琴有多少個琴鍵?', options: ['76', '88', '92', '100'], answer: 1 },
    { category: '動物', q: '哪種動物被稱為「萬獸之王」?', options: ['老虎', '獅子', '大象', '熊'], answer: 1 }
];

let currentIndex = 0;
let score = 0;
let answered = false;
let shuffledQuestions = [];

function init() {
    shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    document.getElementById('total').textContent = shuffledQuestions.length;
    showQuestion();
}

function showQuestion() {
    answered = false;
    const q = shuffledQuestions[currentIndex];

    document.getElementById('current').textContent = currentIndex + 1;
    document.getElementById('category').textContent = q.category;
    document.getElementById('question').textContent = q.q;
    document.getElementById('result').textContent = '';

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = q.options.map((opt, i) =>
        `<button class="option" onclick="checkAnswer(${i})">${opt}</button>`
    ).join('');
}

function checkAnswer(selected) {
    if (answered) return;
    answered = true;

    const q = shuffledQuestions[currentIndex];
    const options = document.querySelectorAll('.option');

    options.forEach((opt, i) => {
        opt.disabled = true;
        if (i === q.answer) {
            opt.classList.add('correct');
        } else if (i === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === q.answer) {
        score += 10;
        document.getElementById('result').textContent = '✅ 正確! +10分';
    } else {
        document.getElementById('result').textContent = '❌ 錯誤!';
    }

    document.getElementById('score').textContent = score;

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < shuffledQuestions.length) {
            showQuestion();
        } else {
            showFinal();
        }
    }, 1500);
}

function showFinal() {
    document.getElementById('question').textContent = `遊戲結束! 總分: ${score}`;
    document.getElementById('category').textContent = '🎉';
    document.getElementById('options').innerHTML = '<button class="option" onclick="restart()">再玩一次</button>';
    document.getElementById('result').textContent = '';
}

function restart() {
    currentIndex = 0;
    score = 0;
    document.getElementById('score').textContent = 0;
    shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    showQuestion();
}

document.addEventListener('DOMContentLoaded', init);
