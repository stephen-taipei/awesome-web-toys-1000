const majorArcana = [
    { name: '愚者', symbol: '🃏', meaning: '新的開始、冒險、純真' },
    { name: '魔術師', symbol: '🎭', meaning: '創造力、技能、意志力' },
    { name: '女祭司', symbol: '🌙', meaning: '直覺、神秘、內在智慧' },
    { name: '皇后', symbol: '👑', meaning: '豐饒、母性、創造' },
    { name: '皇帝', symbol: '🏰', meaning: '權威、結構、控制' },
    { name: '教皇', symbol: '📿', meaning: '傳統、精神指引、信仰' },
    { name: '戀人', symbol: '💕', meaning: '愛情、選擇、和諧' },
    { name: '戰車', symbol: '⚔️', meaning: '決心、勝利、意志' },
    { name: '力量', symbol: '🦁', meaning: '勇氣、耐心、內在力量' },
    { name: '隱士', symbol: '🏔️', meaning: '反思、尋求、內在指引' },
    { name: '命運之輪', symbol: '🎡', meaning: '命運、轉折、機會' },
    { name: '正義', symbol: '⚖️', meaning: '公平、真相、因果' },
    { name: '星星', symbol: '⭐', meaning: '希望、靈感、平靜' },
    { name: '月亮', symbol: '🌕', meaning: '幻覺、潛意識、夢境' },
    { name: '太陽', symbol: '☀️', meaning: '快樂、成功、活力' },
    { name: '世界', symbol: '🌍', meaning: '完成、整合、成就' }
];

let deck = [], selectedCard = null;

function init() {
    document.getElementById('shuffleBtn').addEventListener('click', shuffle);
    shuffle();
}

function shuffle() {
    deck = [...majorArcana].sort(() => Math.random() - 0.5).slice(0, 3);
    selectedCard = null;
    document.getElementById('reading').textContent = '選擇一張牌';
    renderCards();
}

function renderCards() {
    const container = document.getElementById('cards');
    container.innerHTML = '';

    deck.forEach((card, i) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = '✨';
        cardEl.addEventListener('click', () => selectCard(i, cardEl));
        container.appendChild(cardEl);
    });
}

function selectCard(index, cardEl) {
    if (selectedCard !== null) return;

    selectedCard = index;
    const card = deck[index];

    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    cardEl.classList.add('flipped');

    setTimeout(() => {
        cardEl.textContent = card.symbol;
        document.getElementById('reading').innerHTML =
            '<strong>' + card.name + '</strong><br><br>' + card.meaning;
    }, 300);
}

document.addEventListener('DOMContentLoaded', init);
