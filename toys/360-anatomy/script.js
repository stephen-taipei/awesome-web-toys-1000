const organs = [
    { emoji: '🫀', name: '心臟', fact: '心臟每天跳動約10萬次,一生約跳30億次' },
    { emoji: '🧠', name: '大腦', fact: '大腦重約1.4公斤,含有860億個神經元' },
    { emoji: '🫁', name: '肺', fact: '如果把肺展開,面積約有一個網球場大' },
    { emoji: '🦴', name: '骨骼', fact: '成人有206塊骨頭,嬰兒則有300多塊' },
    { emoji: '👁️', name: '眼睛', fact: '眼睛每秒可以處理3600萬個訊息' },
    { emoji: '👂', name: '耳朵', fact: '耳朵內的三塊聽小骨是人體最小的骨頭' },
    { emoji: '👃', name: '鼻子', fact: '人類可以分辨約1萬種不同的氣味' },
    { emoji: '👅', name: '舌頭', fact: '舌頭上有約1萬個味蕾' },
    { emoji: '💪', name: '肌肉', fact: '人體有超過600塊肌肉' },
    { emoji: '🦷', name: '牙齒', fact: '牙釉質是人體最硬的物質' }
];

let currentOrgan = null;
let score = 0;
let answered = false;

function init() {
    nextQuestion();
}

function nextQuestion() {
    answered = false;
    document.getElementById('result').textContent = '';
    document.getElementById('fact').textContent = '';

    currentOrgan = organs[Math.floor(Math.random() * organs.length)];
    document.getElementById('organEmoji').textContent = currentOrgan.emoji;

    const wrongAnswers = organs
        .filter(o => o.name !== currentOrgan.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(o => o.name);

    const options = [...wrongAnswers, currentOrgan.name].sort(() => Math.random() - 0.5);

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
        if (opt.textContent === currentOrgan.name) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected) {
            opt.classList.add('wrong');
        }
    });

    if (selected === currentOrgan.name) {
        score += 10;
        document.getElementById('result').textContent = '✅ 正確!';
    } else {
        document.getElementById('result').textContent = `❌ 答案是: ${currentOrgan.name}`;
    }

    document.getElementById('score').textContent = score;
    document.getElementById('fact').textContent = '💡 ' + currentOrgan.fact;

    setTimeout(nextQuestion, 3000);
}

document.addEventListener('DOMContentLoaded', init);
