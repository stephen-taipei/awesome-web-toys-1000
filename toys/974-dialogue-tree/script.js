const chatArea = document.getElementById('chatArea');
const responsesEl = document.getElementById('responses');

const dialogues = {
    start: {
        npc: '哦，旅行者！歡迎來到精靈村落。我是村長艾爾文，有什麼可以幫助你的嗎？',
        responses: [
            { text: '我在尋找傳說中的魔法水晶', next: 'crystal' },
            { text: '我只是路過，想休息一下', next: 'rest' },
            { text: '這個村子有什麼有趣的故事嗎？', next: 'story' }
        ]
    },
    crystal: {
        npc: '魔法水晶？那是非常危險的任務！水晶被守護在北方的龍穴中。你確定要去嗎？',
        responses: [
            { text: '我已經準備好了，請告訴我路線', next: 'directions' },
            { text: '有沒有什麼能幫助我的物品？', next: 'items' },
            { text: '也許我該再考慮考慮...', next: 'start' }
        ]
    },
    rest: {
        npc: '當然可以！村子東邊有一間溫暖的旅館，老闆娘的料理非常美味。需要我帶你去嗎？',
        responses: [
            { text: '好的，謝謝你的熱情！', next: 'inn' },
            { text: '不用了，我自己去找就好', next: 'explore' }
        ]
    },
    story: {
        npc: '這個村子建立於千年前的精靈戰爭之後。傳說我們的祖先與龍族達成了和平協議...',
        responses: [
            { text: '龍族？他們現在在哪裡？', next: 'dragons' },
            { text: '這真是有趣的歷史', next: 'start' }
        ]
    },
    directions: {
        npc: '從北門出去，穿過迷霧森林，翻過銀雪山脈，就能到達龍穴。願神靈保佑你，勇者！',
        responses: [{ text: '謝謝你的指引，我這就出發！', next: 'farewell' }]
    },
    items: {
        npc: '我這裡有一把精靈弓和一瓶療傷藥水，對付龍可能有用。你可以帶上它們。',
        responses: [
            { text: '太感謝了！這些會很有幫助', next: 'directions' },
            { text: '我不需要，我相信自己的力量', next: 'directions' }
        ]
    },
    inn: {
        npc: '旅館就在前方那棟有煙囪的房子。好好休息，明天又是新的一天！',
        responses: [{ text: '謝謝您，村長！', next: 'farewell' }]
    },
    explore: {
        npc: '好的，村子不大，你很快就能找到。如果需要什麼，隨時來找我。',
        responses: [{ text: '好的，再見！', next: 'farewell' }]
    },
    dragons: {
        npc: '龍族現在居住在北方的山脈中。雖然我們和平共處，但普通人還是很少去那裡...',
        responses: [
            { text: '我想去見見龍族', next: 'crystal' },
            { text: '原來如此，謝謝分享', next: 'start' }
        ]
    },
    farewell: {
        npc: '一路順風，旅行者！希望我們能再次相見。',
        responses: [{ text: '開始新的對話', next: 'start' }]
    }
};

let currentNode = 'start';

function addMessage(text, isNpc) {
    const msg = document.createElement('div');
    msg.className = `message ${isNpc ? 'npc' : 'player'}`;
    msg.textContent = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function showResponses() {
    const dialogue = dialogues[currentNode];
    responsesEl.innerHTML = '';

    dialogue.responses.forEach(resp => {
        const btn = document.createElement('button');
        btn.textContent = resp.text;
        btn.addEventListener('click', () => {
            addMessage(resp.text, false);
            currentNode = resp.next;
            setTimeout(() => {
                addMessage(dialogues[currentNode].npc, true);
                showResponses();
            }, 500);
        });
        responsesEl.appendChild(btn);
    });
}

function init() {
    chatArea.innerHTML = '';
    currentNode = 'start';
    addMessage(dialogues[currentNode].npc, true);
    showResponses();
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
