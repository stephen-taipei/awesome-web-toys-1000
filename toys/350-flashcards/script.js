let cards = [
    { front: 'Hello', back: '你好' },
    { front: 'Goodbye', back: '再見' },
    { front: 'Thank you', back: '謝謝' },
    { front: 'Sorry', back: '抱歉' },
    { front: 'Please', back: '請' },
    { front: 'Yes', back: '是' },
    { front: 'No', back: '否' },
    { front: 'Good morning', back: '早安' },
    { front: 'Good night', back: '晚安' },
    { front: 'How are you?', back: '你好嗎?' }
];

let currentIndex = 0;
let isFlipped = false;

function init() {
    document.getElementById('flashcard').addEventListener('click', flip);
    document.getElementById('prevBtn').addEventListener('click', prev);
    document.getElementById('nextBtn').addEventListener('click', next);
    document.getElementById('addBtn').addEventListener('click', addCard);
    updateCard();
}

function flip() {
    isFlipped = !isFlipped;
    document.getElementById('flashcard').classList.toggle('flipped', isFlipped);
}

function prev() {
    if (currentIndex > 0) {
        currentIndex--;
        isFlipped = false;
        updateCard();
    }
}

function next() {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        isFlipped = false;
        updateCard();
    }
}

function addCard() {
    const front = document.getElementById('frontInput').value.trim();
    const back = document.getElementById('backInput').value.trim();

    if (!front || !back) return;

    cards.push({ front, back });
    document.getElementById('frontInput').value = '';
    document.getElementById('backInput').value = '';
    currentIndex = cards.length - 1;
    isFlipped = false;
    updateCard();
}

function updateCard() {
    const card = cards[currentIndex];
    document.getElementById('front').textContent = card.front;
    document.getElementById('back').textContent = card.back;
    document.getElementById('progress').textContent = `${currentIndex + 1} / ${cards.length}`;
    document.getElementById('flashcard').classList.remove('flipped');
}

document.addEventListener('DOMContentLoaded', init);
