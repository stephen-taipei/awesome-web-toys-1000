const words = [
    { word: 'APPLE', hint: '一種紅色或綠色的水果' },
    { word: 'BEACH', hint: '海邊有沙子的地方' },
    { word: 'CLOUD', hint: '天空中的白色物體' },
    { word: 'DANCE', hint: '隨著音樂移動身體' },
    { word: 'EARTH', hint: '我們居住的星球' },
    { word: 'FLOWER', hint: '植物開出的美麗部分' },
    { word: 'GUITAR', hint: '有六根弦的樂器' },
    { word: 'HOUSE', hint: '人們居住的建築' },
    { word: 'ISLAND', hint: '四面環水的陸地' },
    { word: 'JUNGLE', hint: '熱帶的茂密森林' },
    { word: 'KING', hint: '國家的最高統治者' },
    { word: 'LIGHT', hint: '讓我們能看見東西' },
    { word: 'MUSIC', hint: '悅耳的聲音藝術' },
    { word: 'NIGHT', hint: '太陽下山後的時間' },
    { word: 'OCEAN', hint: '巨大的鹹水區域' },
    { word: 'PIANO', hint: '有黑白鍵的樂器' },
    { word: 'QUEEN', hint: '國王的配偶' },
    { word: 'RIVER', hint: '流動的淡水' },
    { word: 'STORM', hint: '伴隨雷電的惡劣天氣' },
    { word: 'TIGER', hint: '橘色條紋的大貓' }
];

let currentWord = null;
let score = 0;
let streak = 0;
let hintUsed = false;

function init() {
    document.getElementById('submitBtn').addEventListener('click', checkAnswer);
    document.getElementById('answer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('skipBtn').addEventListener('click', nextWord);
    nextWord();
}

function scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join('');
    return scrambled === word ? scramble(word) : scrambled;
}

function nextWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    hintUsed = false;

    document.getElementById('scrambled').textContent = scramble(currentWord.word);
    document.getElementById('hint').textContent = '';
    document.getElementById('answer').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('answer').focus();
}

function showHint() {
    if (!hintUsed) {
        hintUsed = true;
        document.getElementById('hint').textContent = currentWord.hint;
    }
}

function checkAnswer() {
    const answer = document.getElementById('answer').value.toUpperCase().trim();
    const feedback = document.getElementById('feedback');

    if (answer === currentWord.word) {
        streak++;
        const points = hintUsed ? 5 : 10;
        score += points * (1 + Math.floor(streak / 3));
        feedback.textContent = '正確! +' + (points * (1 + Math.floor(streak / 3))) + '分';
        feedback.className = 'feedback correct';
        updateStats();
        setTimeout(nextWord, 1500);
    } else if (answer.length > 0) {
        streak = 0;
        feedback.textContent = '錯誤，再試一次!';
        feedback.className = 'feedback wrong';
        updateStats();
    }
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
}

document.addEventListener('DOMContentLoaded', init);
