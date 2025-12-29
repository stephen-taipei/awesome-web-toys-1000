const storyEl = document.getElementById('story');
const charactersEl = document.getElementById('characters');
const locationsEl = document.getElementById('locations');
const eventsEl = document.getElementById('events');

const data = {
    characters: [
        { emoji: '🧙', name: '魔法師', templates: ['{name}揮動魔杖', '{name}念起咒語', '神秘的{name}出現了'] },
        { emoji: '🦸', name: '英雄', templates: ['{name}挺身而出', '{name}展現勇氣', '勇敢的{name}'] },
        { emoji: '🐉', name: '龍', templates: ['巨大的{name}咆哮', '{name}噴出火焰', '{name}展開翅膀'] },
        { emoji: '👸', name: '公主', templates: ['{name}做出決定', '聰明的{name}', '{name}說出真相'] },
        { emoji: '🤖', name: '機器人', templates: ['{name}計算著', '{name}發出光芒', '{name}啟動了'] }
    ],
    locations: [
        { emoji: '🏰', name: '城堡', templates: ['在古老的{name}裡', '{name}的塔樓上', '走進{name}'] },
        { emoji: '🌲', name: '森林', templates: ['深入{name}', '穿過黑暗的{name}', '{name}中迴盪著'] },
        { emoji: '🌊', name: '海洋', templates: ['在廣闘的{name}上', '{name}掀起巨浪', '跨越{name}'] },
        { emoji: '🏔️', name: '山脈', templates: ['攀登{name}', '在{name}之巔', '{name}的深處'] },
        { emoji: '🌙', name: '月球', templates: ['登上{name}', '在{name}表面', '望著{name}'] }
    ],
    events: [
        { emoji: '⚔️', name: '戰鬥', templates: ['一場激烈的{name}', '展開史詩般的{name}', '{name}開始了'] },
        { emoji: '💎', name: '發現寶藏', templates: ['{name}!', '終於{name}', '意外地{name}'] },
        { emoji: '🔮', name: '魔法', templates: ['神奇的{name}發生', '{name}改變了一切', '強大的{name}'] },
        { emoji: '🤝', name: '結盟', templates: ['達成了{name}', '意想不到的{name}', '命運的{name}'] },
        { emoji: '🎉', name: '慶祝', templates: ['大家開始{name}', '歡樂的{name}', '勝利的{name}'] }
    ]
};

let storyParts = [];
let usedElements = new Set();

function createButtons() {
    data.characters.forEach((char, i) => {
        const btn = document.createElement('button');
        btn.className = 'element-btn';
        btn.textContent = `${char.emoji} ${char.name}`;
        btn.onclick = () => addToStory('characters', i);
        charactersEl.appendChild(btn);
    });

    data.locations.forEach((loc, i) => {
        const btn = document.createElement('button');
        btn.className = 'element-btn';
        btn.textContent = `${loc.emoji} ${loc.name}`;
        btn.onclick = () => addToStory('locations', i);
        locationsEl.appendChild(btn);
    });

    data.events.forEach((evt, i) => {
        const btn = document.createElement('button');
        btn.className = 'element-btn';
        btn.textContent = `${evt.emoji} ${evt.name}`;
        btn.onclick = () => addToStory('events', i);
        eventsEl.appendChild(btn);
    });
}

function addToStory(category, index) {
    const key = `${category}-${index}`;
    if (usedElements.has(key)) return;

    usedElements.add(key);
    const item = data[category][index];
    const template = item.templates[Math.floor(Math.random() * item.templates.length)];
    const text = template.replace('{name}', item.name);

    storyParts.push(`${item.emoji} ${text}`);
    updateStory();

    // Mark button as used
    const container = category === 'characters' ? charactersEl :
                     category === 'locations' ? locationsEl : eventsEl;
    container.children[index].classList.add('used');
}

function updateStory() {
    if (storyParts.length === 0) {
        storyEl.textContent = '點擊下方元素開始創造你的故事...';
    } else {
        storyEl.innerHTML = storyParts.join('，') + '。';
    }
}

function resetStory() {
    storyParts = [];
    usedElements.clear();
    document.querySelectorAll('.element-btn').forEach(btn => btn.classList.remove('used'));
    updateStory();
}

document.getElementById('newStory').addEventListener('click', resetStory);

createButtons();
updateStory();
