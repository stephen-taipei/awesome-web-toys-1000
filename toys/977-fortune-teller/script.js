const fortuneEl = document.getElementById('fortune');
const crystalBall = document.getElementById('crystalBall');

const fortunes = [
    { category: '愛情', predictions: [
        '近期會有一段美好的邂逅，請保持開放的心。',
        '你的真誠會打動一個特別的人。',
        '感情中需要更多的溝通與理解。',
        '舊愛可能會重新出現，請聆聽內心的聲音。'
    ]},
    { category: '事業', predictions: [
        '一個重要的機會正在向你靠近，請做好準備。',
        '你的努力即將得到回報，堅持下去。',
        '團隊合作將帶來意想不到的成功。',
        '是時候學習新技能，提升自己了。'
    ]},
    { category: '財運', predictions: [
        '近期財運亨通，但要理性消費。',
        '一筆意外之財可能會到來。',
        '投資需謹慎，多聽取專業意見。',
        '儲蓄是智慧的選擇，未雨綢繆。'
    ]},
    { category: '健康', predictions: [
        '注意休息，不要過度勞累。',
        '保持運動習慣，身體會越來越好。',
        '飲食規律是健康的基礎。',
        '心理健康同樣重要，適時放鬆自己。'
    ]},
    { category: '人際', predictions: [
        '一位貴人即將出現在你的生活中。',
        '真誠待人，友誼自然會來。',
        '化解過去的誤會，和好如初。',
        '新的社交圈會帶來新的機遇。'
    ]}
];

const luckyItems = ['數字 7', '藍色', '水晶', '貓咪', '彩虹', '星星', '月亮', '書本', '音樂', '花朵'];

let isRevealing = false;

function revealFortune() {
    if (isRevealing) return;
    isRevealing = true;

    crystalBall.style.animation = 'none';
    crystalBall.offsetHeight;
    crystalBall.style.animation = 'glow 0.3s ease-in-out 5';

    fortuneEl.innerHTML = '<p style="color: rgba(255,255,255,0.5);">水晶球正在顯示你的命運...</p>';

    setTimeout(() => {
        const category = fortunes[Math.floor(Math.random() * fortunes.length)];
        const prediction = category.predictions[Math.floor(Math.random() * category.predictions.length)];
        const luckyItem = luckyItems[Math.floor(Math.random() * luckyItems.length)];

        fortuneEl.innerHTML = `
            <p><strong style="color: #7C4DFF;">【${category.category}運勢】</strong></p>
            <p style="margin: 10px 0;">${prediction}</p>
            <p style="font-size: 12px; color: rgba(255,255,255,0.6);">幸運物：${luckyItem}</p>
        `;

        crystalBall.style.animation = 'glow 3s ease-in-out infinite';
        isRevealing = false;
    }, 1500);
}

document.getElementById('revealBtn').addEventListener('click', revealFortune);

fortuneEl.innerHTML = '<p style="color: rgba(255,255,255,0.5);">點擊下方按鈕揭示你的命運...</p>';
