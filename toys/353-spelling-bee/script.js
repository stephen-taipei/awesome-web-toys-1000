const words = [
    { word: 'APPLE', hint: '一種紅色水果 🍎' },
    { word: 'BANANA', hint: '黃色彎彎的水果 🍌' },
    { word: 'ORANGE', hint: '橙色柑橘類水果 🍊' },
    { word: 'ELEPHANT', hint: '有長鼻子的大動物 🐘' },
    { word: 'BUTTERFLY', hint: '有美麗翅膀的昆蟲 🦋' },
    { word: 'RAINBOW', hint: '雨後天空的七彩 🌈' },
    { word: 'SUNSHINE', hint: '來自太陽的光 ☀️' },
    { word: 'COMPUTER', hint: '用來打字和上網的電子設備 💻' },
    { word: 'KITCHEN', hint: '做飯的房間 🍳' },
    { word: 'MOUNTAIN', hint: '很高的地形 ⛰️' }
];

let currentWord = null;
let score = 0;

function init() {
    document.getElementById('submitBtn').addEventListener('click', submit);
    document.getElementById('skipBtn').addEventListener('click', skip);
    document.getElementById('answer').addEventListener('keypress', e => {
        if (e.key === 'Enter') submit();
    });
    nextWord();
}

function nextWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('hint').textContent = currentWord.hint;
    document.getElementById('result').textContent = '';
    document.getElementById('answer').value = '';

    // Shuffle and display letters
    const shuffled = currentWord.word.split('').sort(() => Math.random() - 0.5);
    const lettersContainer = document.getElementById('letters');
    lettersContainer.innerHTML = shuffled.map(letter =>
        `<div class="letter" onclick="addLetter('${letter}')">${letter}</div>`
    ).join('');
}

function addLetter(letter) {
    const input = document.getElementById('answer');
    input.value += letter;
    input.focus();
}

function submit() {
    const answer = document.getElementById('answer').value.toUpperCase().trim();

    if (answer === currentWord.word) {
        score += 10;
        document.getElementById('score').textContent = score;
        document.getElementById('result').textContent = '✅ 正確! +10分';
        setTimeout(nextWord, 1500);
    } else {
        document.getElementById('result').textContent = '❌ 再試一次!';
    }
}

function skip() {
    document.getElementById('result').textContent = `答案是: ${currentWord.word}`;
    setTimeout(nextWord, 2000);
}

document.addEventListener('DOMContentLoaded', init);
