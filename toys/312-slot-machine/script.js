const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];
const payouts = { '7️⃣': 100, '💎': 50, '⭐': 25, '🍉': 15, '🍇': 10, '🍊': 8, '🍋': 5, '🍒': 3 };
let credits = 100, isSpinning = false;

function init() {
    document.getElementById('spinBtn').addEventListener('click', spin);
}

function spin() {
    if (isSpinning || credits < 1) return;

    credits--;
    document.getElementById('credits').textContent = credits;
    document.getElementById('result').textContent = '';
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;

    const results = [null, null, null];
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    reels.forEach((reel, i) => {
        let spins = 0;
        const maxSpins = 10 + i * 5;
        const interval = setInterval(() => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            spins++;
            if (spins >= maxSpins) {
                clearInterval(interval);
                results[i] = symbols[Math.floor(Math.random() * symbols.length)];
                reel.textContent = results[i];

                if (i === 2) {
                    checkWin(results);
                }
            }
        }, 100);
    });
}

function checkWin(results) {
    isSpinning = false;
    document.getElementById('spinBtn').disabled = false;

    if (results[0] === results[1] && results[1] === results[2]) {
        const payout = payouts[results[0]] || 2;
        credits += payout;
        document.getElementById('credits').textContent = credits;
        document.getElementById('result').textContent = '🎉 三連! +' + payout + ' 籌碼!';
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        credits += 2;
        document.getElementById('credits').textContent = credits;
        document.getElementById('result').textContent = '⭐ 兩連! +2 籌碼';
    } else {
        document.getElementById('result').textContent = '再試一次!';
    }

    if (credits <= 0) {
        document.getElementById('result').textContent = '遊戲結束! 點擊重新開始';
        document.getElementById('spinBtn').textContent = '重新開始';
        document.getElementById('spinBtn').onclick = () => {
            credits = 100;
            document.getElementById('credits').textContent = credits;
            document.getElementById('spinBtn').textContent = '拉霸!';
            document.getElementById('spinBtn').onclick = spin;
            document.getElementById('result').textContent = '';
        };
    }
}

document.addEventListener('DOMContentLoaded', init);
