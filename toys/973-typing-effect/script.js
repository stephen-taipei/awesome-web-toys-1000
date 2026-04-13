const typeArea = document.getElementById('typeArea');

const texts = [
    '在很久很久以前，有一位勇敢的冒險者踏上了尋找傳說之劍的旅程...',
    '科技改變了世界，但人心依然是最珍貴的寶藏。',
    '程式設計不只是寫代碼，更是一種創造的藝術。',
    '每一行代碼都是通往未來的橋樑，每一個函數都是解決問題的智慧。',
    '黑夜給了我黑色的眼睛，我卻用它來尋找光明。',
    '星空浩瀚無垠，而我們都是宇宙中的一粒塵埃，卻擁有無限可能。',
    '時間是最好的魔法師，它能將傷痛化為回憶，將夢想變成現實。',
    '學習就像逆水行舟，不進則退。但每一步前進都讓你更接近目標。'
];

let currentText = '';
let charIndex = 0;
let isTyping = false;

function startTyping() {
    if (isTyping) return;

    currentText = texts[Math.floor(Math.random() * texts.length)];
    charIndex = 0;
    isTyping = true;
    typeArea.innerHTML = '<span class="cursor"></span>';

    typeNext();
}

function typeNext() {
    if (charIndex < currentText.length) {
        const textSpan = typeArea.querySelector('.text') || document.createElement('span');
        textSpan.className = 'text';
        textSpan.textContent = currentText.substring(0, charIndex + 1);

        typeArea.innerHTML = '';
        typeArea.appendChild(textSpan);

        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        typeArea.appendChild(cursor);

        charIndex++;

        const delay = Math.random() * 100 + 50;
        setTimeout(typeNext, delay);
    } else {
        isTyping = false;
    }
}

document.getElementById('newTextBtn').addEventListener('click', () => {
    isTyping = false;
    setTimeout(startTyping, 100);
});

startTyping();
