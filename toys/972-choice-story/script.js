const narrativeEl = document.getElementById('narrative');
const optionsEl = document.getElementById('options');

const stories = [
    {
        title: '魔法學院',
        start: {
            text: '你收到了魔法學院的入學通知！今天是報到日，你站在宏偉的學院大門前...',
            options: [
                { text: '自信地走進去', next: 'hall', trait: 'brave' },
                { text: '先觀察周圍環境', next: 'garden', trait: 'wise' }
            ]
        },
        hall: {
            text: '大廳裡擠滿了新生。一位教授注意到你，走過來說：「你身上有特別的魔力氣息...」',
            options: [
                { text: '詢問詳情', next: 'special' },
                { text: '謙虛迴避', next: 'normal' }
            ]
        },
        garden: {
            text: '你在花園發現一本遺落的魔法書。翻開後，書中的文字開始發光...',
            options: [
                { text: '大聲朗讀咒語', next: 'spell' },
                { text: '把書交給老師', next: 'honest' }
            ]
        },
        special: { text: '教授告訴你，你是失落王族的後裔，擁有遠古魔法的血脈！你將開啟一段傳奇的魔法之旅。【結局：傳奇開端】', end: true },
        normal: { text: '你和其他新生一起開始了普通但充實的魔法學習生活。平凡也是一種幸福。【結局：平凡之路】', end: true },
        spell: { text: '魔法陣出現在你腳下！你意外召喚出了一隻可愛的魔法生物，它決定成為你的夥伴！【結局：意外之友】', end: true },
        honest: { text: '老師讚賞你的誠實，並破例讓你進入高級班學習。誠實是最珍貴的品質。【結局：誠實獎勵】', end: true }
    },
    {
        title: '星際旅行',
        start: {
            text: '你是星際探險隊的一員，飛船剛降落在一顆未知星球上。雷達顯示附近有生命反應...',
            options: [
                { text: '主動前往調查', next: 'alien' },
                { text: '在飛船待命', next: 'wait' }
            ]
        },
        alien: {
            text: '你遇到了友善的外星生物！它們試圖與你交流，指向遠處一座發光的建築...',
            options: [
                { text: '跟隨它們前往', next: 'city' },
                { text: '回去報告隊長', next: 'report' }
            ]
        },
        wait: {
            text: '突然，飛船警報響起！一艘巨大的外星飛船正在靠近...',
            options: [
                { text: '嘗試通訊', next: 'peace' },
                { text: '準備防禦', next: 'battle' }
            ]
        },
        city: { text: '外星城市美得令人驚嘆！你成為了人類與這個文明的第一位大使。【結局：星際外交官】', end: true },
        report: { text: '隊長決定建立友好關係，這次發現將改變人類歷史！【結局：歷史發現者】', end: true },
        peace: { text: '對方竟然是來尋求幫助的！你們成功建立了星際同盟。【結局：和平使者】', end: true },
        battle: { text: '虛驚一場！原來是友軍前來支援。宇宙中不再孤單。【結局：意外會師】', end: true }
    }
];

let currentStory = null;
let currentNode = null;

function startStory() {
    currentStory = stories[Math.floor(Math.random() * stories.length)];
    currentNode = currentStory.start;
    render();
}

function render() {
    narrativeEl.innerHTML = currentStory.title ?
        `<h3 style="color: #66BB6A; margin-bottom: 10px;">${currentStory.title}</h3><p>${currentNode.text}</p>` :
        `<p>${currentNode.text}</p>`;

    optionsEl.innerHTML = '';

    if (currentNode.end) {
        const btn = document.createElement('button');
        btn.textContent = '開始新故事';
        btn.addEventListener('click', startStory);
        optionsEl.appendChild(btn);
    } else if (currentNode.options) {
        currentNode.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                currentNode = currentStory[opt.next];
                render();
            });
            optionsEl.appendChild(btn);
        });
    }
}

document.getElementById('newStoryBtn').addEventListener('click', startStory);

startStory();
