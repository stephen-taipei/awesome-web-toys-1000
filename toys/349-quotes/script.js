const quotes = [
    { text: '學而不思則罔,思而不學則殆', author: '孔子', cat: 'wisdom' },
    { text: '千里之行,始於足下', author: '老子', cat: 'wisdom' },
    { text: '知之為知之,不知為不知,是知也', author: '孔子', cat: 'wisdom' },
    { text: '失敗為成功之母', author: '俗語', cat: 'motivation' },
    { text: '有志者事竟成', author: '後漢書', cat: 'motivation' },
    { text: '天生我材必有用', author: '李白', cat: 'motivation' },
    { text: '人生自古誰無死,留取丹心照汗青', author: '文天祥', cat: 'life' },
    { text: '書中自有黃金屋', author: '趙恆', cat: 'wisdom' },
    { text: '不經一番寒徹骨,怎得梅花撲鼻香', author: '黃蘗禪師', cat: 'motivation' },
    { text: '海內存知己,天涯若比鄰', author: '王勃', cat: 'life' },
    { text: '業精於勤荒於嬉', author: '韓愈', cat: 'motivation' },
    { text: '路遙知馬力,日久見人心', author: '俗語', cat: 'life' },
    { text: '三人行必有我師', author: '孔子', cat: 'wisdom' },
    { text: '己所不欲,勿施於人', author: '孔子', cat: 'life' },
    { text: '天下無難事,只怕有心人', author: '俗語', cat: 'motivation' }
];

let currentCategory = 'all';

function init() {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => setCategory(btn.dataset.cat));
    });
    document.getElementById('newBtn').addEventListener('click', showQuote);
    showQuote();
}

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    showQuote();
}

function showQuote() {
    let filteredQuotes = quotes;
    if (currentCategory !== 'all') {
        filteredQuotes = quotes.filter(q => q.cat === currentCategory);
    }

    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');

    textEl.style.opacity = 0;
    authorEl.style.opacity = 0;

    setTimeout(() => {
        textEl.textContent = quote.text;
        authorEl.textContent = quote.author;
        textEl.style.opacity = 1;
        authorEl.style.opacity = 1;
    }, 200);
}

document.addEventListener('DOMContentLoaded', init);
