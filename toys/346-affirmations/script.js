const affirmations = [
    '我值得被愛和尊重',
    '我有能力克服任何挑戰',
    '我選擇快樂和平靜',
    '我對自己充滿信心',
    '我的努力正在帶來成果',
    '我接受自己的不完美',
    '我值得擁有美好的事物',
    '我的想法和感受很重要',
    '我正在成為更好的自己',
    '我擁有無限的可能性',
    '我感謝生命中的每一刻',
    '我的內心充滿力量',
    '我選擇釋放負面情緒',
    '我相信一切都會好起來',
    '我的存在本身就有價值',
    '我能夠處理生活中的一切',
    '我值得休息和放鬆',
    '我的聲音值得被聆聽',
    '我正走在正確的道路上',
    '我愛自己並接受自己'
];

let currentAffirmation = '';
let favorites = [];

function init() {
    document.getElementById('newBtn').addEventListener('click', showNew);
    document.getElementById('saveBtn').addEventListener('click', saveFavorite);
    showNew();
    renderFavorites();
}

function showNew() {
    const index = Math.floor(Math.random() * affirmations.length);
    currentAffirmation = affirmations[index];
    const el = document.getElementById('affirmation');
    el.style.opacity = 0;
    setTimeout(() => {
        el.textContent = currentAffirmation;
        el.style.opacity = 1;
    }, 200);
}

function saveFavorite() {
    if (!currentAffirmation || favorites.includes(currentAffirmation)) return;
    favorites.push(currentAffirmation);
    renderFavorites();
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favoritesList');
    container.innerHTML = favorites.map((text, i) => `
        <div class="favorite-item">
            <span class="text">${text}</span>
            <button class="remove" onclick="removeFavorite(${i})">×</button>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
