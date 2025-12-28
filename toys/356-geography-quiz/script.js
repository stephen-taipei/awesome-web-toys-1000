const questions = [
    { emoji: '🗻', q: '世界最高峰是?', options: ['K2', '珠穆朗瑪峰', '坎城雅加峰', '洛子峰'], answer: 1 },
    { emoji: '🏜️', q: '世界最大的沙漠是?', options: ['戈壁沙漠', '阿拉伯沙漠', '撒哈拉沙漠', '卡拉哈里沙漠'], answer: 2 },
    { emoji: '🌊', q: '世界最深的海溝是?', options: ['日本海溝', '馬里亞納海溝', '菲律賓海溝', '波多黎各海溝'], answer: 1 },
    { emoji: '🏝️', q: '世界最大的島嶼是?', options: ['婆羅洲', '馬達加斯加', '格陵蘭', '新幾內亞'], answer: 2 },
    { emoji: '🌍', q: '非洲最大的國家是?', options: ['埃及', '阿爾及利亞', '蘇丹', '剛果'], answer: 1 },
    { emoji: '🗺️', q: '亞洲面積最大的國家是?', options: ['中國', '印度', '俄羅斯', '哈薩克'], answer: 0 },
    { emoji: '🌋', q: '日本最高的山是?', options: ['立山', '北岳', '富士山', '槍岳'], answer: 2 },
    { emoji: '💧', q: '世界最大的淡水湖是?', options: ['貝加爾湖', '蘇必利爾湖', '維多利亞湖', '休倫湖'], answer: 1 },
    { emoji: '🏔️', q: '台灣最高峰是?', options: ['雪山', '玉山', '南湖大山', '秀姑巒山'], answer: 1 },
    { emoji: '🌏', q: '世界人口最多的國家是?', options: ['美國', '印度', '中國', '印尼'], answer: 1 }
];

let currentIndex = 0;
let correct = 0;
let total = 0;
let answered = false;

function init() {
    showQuestion();
}

function showQuestion() {
    answered = false;
    const q = questions[currentIndex];

    document.getElementById('emoji').textContent = q.emoji;
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
    total++;

    const q = questions[currentIndex];
    const options = document.querySelectorAll('.option');

    options.forEach((opt, i) => {
        if (i === q.answer) {
            opt.classList.add('correct');
        } else if (i === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === q.answer) {
        correct++;
        document.getElementById('result').textContent = '✅ 正確!';
    } else {
        document.getElementById('result').textContent = '❌ 錯誤!';
    }

    document.getElementById('correct').textContent = correct;
    document.getElementById('total').textContent = total;

    setTimeout(() => {
        currentIndex = (currentIndex + 1) % questions.length;
        showQuestion();
    }, 1500);
}

document.addEventListener('DOMContentLoaded', init);
