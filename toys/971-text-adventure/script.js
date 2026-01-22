const storyEl = document.getElementById('story');
const choicesEl = document.getElementById('choices');

const scenes = {
    start: {
        text: '你醒來發現自己在一片神秘的森林中。陽光透過樹葉灑落，遠處傳來潺潺流水聲。你面前有兩條小徑...',
        choices: [
            { text: '走向流水聲', next: 'river' },
            { text: '深入森林', next: 'forest' }
        ]
    },
    river: {
        text: '你來到一條清澈的小河邊。河面上漂浮著一艘小船，岸邊有一位老漁夫正在釣魚。',
        choices: [
            { text: '與漁夫交談', next: 'fisherman' },
            { text: '乘坐小船', next: 'boat' }
        ]
    },
    forest: {
        text: '你走進茂密的森林，發現一座古老的石塔。塔門微微敞開，裡面傳來微弱的光芒。',
        choices: [
            { text: '進入石塔', next: 'tower' },
            { text: '繞塔探索', next: 'around' }
        ]
    },
    fisherman: {
        text: '老漁夫微笑著說：「年輕人，這條河通往神秘的水晶洞穴。如果你夠勇敢，那裡有寶藏等著你。」',
        choices: [
            { text: '請他帶路', next: 'cave' },
            { text: '謝過後離開', next: 'start' }
        ]
    },
    boat: {
        text: '你乘船順流而下，穿過迷霧來到一個寧靜的湖泊。湖中央有一座小島，上面矗立著一座神殿。',
        choices: [
            { text: '登上神殿島', next: 'temple' },
            { text: '繼續漂流', next: 'waterfall' }
        ]
    },
    tower: {
        text: '塔內有一位年邁的法師。他說：「我等你很久了，勇者。這裡有一把魔法劍，但需要通過考驗才能獲得。」',
        choices: [
            { text: '接受考驗', next: 'trial' },
            { text: '婉拒離開', next: 'forest' }
        ]
    },
    around: {
        text: '你繞到塔後發現一個隱藏的寶箱！裡面有一張古老的地圖，標記著寶藏的位置。',
        choices: [
            { text: '按照地圖尋寶', next: 'treasure' },
            { text: '返回石塔', next: 'tower' }
        ]
    },
    cave: {
        text: '水晶洞穴美得令人窒息！到處閃爍著七彩光芒。你在最深處找到了傳說中的寶石！恭喜你完成了冒險！',
        choices: [{ text: '重新開始', next: 'start' }]
    },
    temple: {
        text: '神殿中供奉著古老的神靈。你虔誠地祈禱，獲得了神聖的祝福。你的冒險圓滿結束！',
        choices: [{ text: '重新開始', next: 'start' }]
    },
    waterfall: {
        text: '你被瀑布沖下，幸運地落入深潭中。你游到岸邊，發現這裡是一片未知的新大陸！',
        choices: [{ text: '探索新大陸', next: 'start' }]
    },
    trial: {
        text: '經過智慧與勇氣的考驗，你成功獲得了魔法劍！成為了傳說中的勇者！',
        choices: [{ text: '重新開始', next: 'start' }]
    },
    treasure: {
        text: '你按照地圖找到了古老的寶藏！金幣和珍寶堆積如山！你成為了富翁！',
        choices: [{ text: '重新開始', next: 'start' }]
    }
};

let currentScene = 'start';

function renderScene() {
    const scene = scenes[currentScene];
    storyEl.innerHTML = `<p>${scene.text}</p>`;

    choicesEl.innerHTML = '';
    scene.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            currentScene = choice.next;
            renderScene();
        });
        choicesEl.appendChild(btn);
    });
}

document.getElementById('restartBtn').addEventListener('click', () => {
    currentScene = 'start';
    renderScene();
});

renderScene();
