const feedEl = document.getElementById('feed');
const infoEl = document.getElementById('info');

const users = [
    { name: '小明', color: '#e74c3c' },
    { name: '小美', color: '#3498db' },
    { name: '阿傑', color: '#2ecc71' },
    { name: '小芳', color: '#9b59b6' },
    { name: '大雄', color: '#f39c12' },
    { name: '靜香', color: '#1abc9c' }
];

const messages = [
    '今天天氣真好！',
    '剛吃完午餐，好飽',
    '有人想一起去看電影嗎？',
    '終於完成專案了！',
    '週末有什麼計劃？',
    '分享一個好消息給大家',
    '這首歌太好聽了',
    '下班了！開心',
    '學到了新技能，很有成就感',
    '推薦這家餐廳，超好吃',
    '今天運動30分鐘',
    '讀完一本好書',
    '準備去旅行了',
    '好久沒見到老朋友了'
];

let postCount = 0;

function getRandomUser() {
    return users[Math.floor(Math.random() * users.length)];
}

function getRandomMessage() {
    return messages[Math.floor(Math.random() * messages.length)];
}

function formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '剛剛';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`;
    return `${Math.floor(diff / 3600)} 小時前`;
}

function createPost() {
    const user = getRandomUser();
    const message = getRandomMessage();
    const likes = Math.floor(Math.random() * 50);
    const comments = Math.floor(Math.random() * 10);

    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `
        <div class="post-header">
            <div class="avatar" style="background: ${user.color}">${user.name[0]}</div>
            <div class="user-info">
                <div class="username">${user.name}</div>
                <div class="time">剛剛</div>
            </div>
        </div>
        <div class="content">${message}</div>
        <div class="actions">
            <span>❤️ ${likes}</span>
            <span>💬 ${comments}</span>
            <span>🔄 分享</span>
        </div>
    `;

    feedEl.insertBefore(post, feedEl.firstChild);
    postCount++;

    // Limit posts
    while (feedEl.children.length > 20) {
        feedEl.removeChild(feedEl.lastChild);
    }

    infoEl.textContent = `已產生 ${postCount} 則動態`;
}

// Initial posts
for (let i = 0; i < 5; i++) {
    createPost();
}

// New post every 3 seconds
setInterval(createPost, 3000);
