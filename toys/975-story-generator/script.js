const storyOutput = document.getElementById('storyOutput');

const templates = [
    {
        pattern: '在{time}，一位{adj}{hero}在{place}發現了{item}。經過{event}後，{hero}最終{ending}。',
        vars: {
            time: ['很久以前', '未來世界', '平行宇宙中', '神話時代', '現代都市'],
            adj: ['勇敢的', '聰明的', '善良的', '神秘的', '年輕的'],
            hero: ['冒險家', '魔法師', '科學家', '詩人', '工程師'],
            place: ['古老森林', '海底城市', '雲端王國', '地下迷宮', '星際空間站'],
            item: ['一把傳說之劍', '一本魔法書', '一顆許願石', '一張藏寶圖', '一枚時光戒指'],
            event: ['與惡龍戰鬥', '解開千年謎題', '穿越時空', '獲得神靈祝福', '結識生命摯友'],
            ending: ['成為了傳奇英雄', '找到了真正的幸福', '開創了新紀元', '回到了家鄉', '繼續踏上新的旅程']
        }
    },
    {
        pattern: '{char1}和{char2}是{relation}。有一天，他們{action}，結果{result}。從此以後，{moral}。',
        vars: {
            char1: ['小狐狸', '機器人阿爾法', '魔法少女', '太空船長', '精靈王子'],
            char2: ['老烏龜', '人類女孩', '獨角獸', '外星訪客', '森林守護者'],
            relation: ['最好的朋友', '意外的旅伴', '命運的對手', '失散的兄妹', '師徒關係'],
            action: ['一起去尋找彩虹的盡頭', '誤入了另一個維度', '發現了一個被遺忘的王國', '收到了來自未來的信息', '解救了被困的村民'],
            result: ['發現了友情的真諦', '改變了世界的歷史', '獲得了意想不到的力量', '建立了永恆的羈絆', '創造了新的奇蹟'],
            moral: ['他們明白了：真正的寶藏是一路上的經歷', '世界因為善良而變得更美好', '每個人都有改變命運的力量', '愛與勇氣可以克服一切困難', '夢想終會照進現實']
        }
    },
    {
        pattern: '傳說中的{place}裡住著{creature}。它守護著{treasure}。直到{event}，{hero}來到這裡，{ending}。',
        vars: {
            place: ['水晶洞窟', '天空之城', '時間神殿', '夢境花園', '星辰圖書館'],
            creature: ['千年神龍', '智慧精靈', '機械守衛', '影子巨人', '光之鳳凰'],
            treasure: ['世界的記憶', '永恆的真理', '生命之水', '命運之書', '創造的力量'],
            event: ['星星排列成特殊圖案', '預言中的日子到來', '世界陷入危機', '最後一位純潔之心出現', '千年封印開始崩解'],
            hero: ['命中注定的選中者', '一個迷路的孩子', '最後的魔法傳人', '來自另一個世界的旅人', '曾被遺棄的孤兒'],
            ending: ['開啟了新世界的大門', '獲得了改變命運的機會', '完成了古老的使命', '書寫了嶄新的傳奇', '找到了回家的路']
        }
    }
];

function generateStory() {
    const template = templates[Math.floor(Math.random() * templates.length)];
    let story = template.pattern;

    const usedVars = {};

    for (const [key, values] of Object.entries(template.vars)) {
        const value = values[Math.floor(Math.random() * values.length)];
        usedVars[key] = value;
    }

    for (const [key, value] of Object.entries(usedVars)) {
        story = story.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    storyOutput.style.opacity = 0;
    setTimeout(() => {
        storyOutput.innerHTML = `<p>${story}</p>`;
        storyOutput.style.opacity = 1;
    }, 300);
}

storyOutput.style.transition = 'opacity 0.3s';

document.getElementById('generateBtn').addEventListener('click', generateStory);

generateStory();
