const testArea = document.getElementById('testArea');
const resultEl = document.getElementById('result');

const questions = [
    {
        question: '週末你更喜歡怎麼度過？',
        options: [
            { text: '和朋友聚會', scores: { E: 2 } },
            { text: '獨自看書或看電影', scores: { I: 2 } },
            { text: '戶外活動', scores: { E: 1, S: 1 } },
            { text: '學習新技能', scores: { I: 1, N: 1 } }
        ]
    },
    {
        question: '做決定時，你更傾向於？',
        options: [
            { text: '根據邏輯分析', scores: { T: 2 } },
            { text: '考慮他人感受', scores: { F: 2 } },
            { text: '相信直覺', scores: { N: 1, F: 1 } },
            { text: '參考過去經驗', scores: { S: 1, T: 1 } }
        ]
    },
    {
        question: '面對新任務，你通常會？',
        options: [
            { text: '立即開始嘗試', scores: { P: 2 } },
            { text: '先制定詳細計劃', scores: { J: 2 } },
            { text: '收集相關資訊', scores: { S: 1, J: 1 } },
            { text: '尋找創新方法', scores: { N: 1, P: 1 } }
        ]
    },
    {
        question: '你更喜歡哪種工作環境？',
        options: [
            { text: '團隊合作', scores: { E: 2 } },
            { text: '獨立完成', scores: { I: 2 } },
            { text: '彈性自由', scores: { P: 1, N: 1 } },
            { text: '穩定規律', scores: { J: 1, S: 1 } }
        ]
    },
    {
        question: '當遇到問題時？',
        options: [
            { text: '尋找根本原因', scores: { T: 2 } },
            { text: '考慮影響到的人', scores: { F: 2 } },
            { text: '想像各種可能', scores: { N: 2 } },
            { text: '回顧類似經驗', scores: { S: 2 } }
        ]
    }
];

const personalities = {
    INTJ: { name: '建築師', desc: '富有想像力和戰略性的思考者，計劃周密。' },
    INTP: { name: '邏輯學家', desc: '創新的發明家，對知識有無窮的渴望。' },
    ENTJ: { name: '指揮官', desc: '大膽、想像力豐富的領導者。' },
    ENTP: { name: '辯論家', desc: '聰明好奇的思考者，無法抵抗智力挑戰。' },
    INFJ: { name: '提倡者', desc: '安靜且富有神秘感，鼓舞人心的理想主義者。' },
    INFP: { name: '調停者', desc: '詩意、善良的利他主義者，總是樂於助人。' },
    ENFJ: { name: '主人公', desc: '富有魅力的鼓舞人心的領導者。' },
    ENFP: { name: '競選者', desc: '熱情、有創造力的社交達人。' },
    ISTJ: { name: '物流師', desc: '實際且注重事實的人，可靠性無可懷疑。' },
    ISFJ: { name: '守衛者', desc: '非常專注且溫暖的守護者。' },
    ESTJ: { name: '總經理', desc: '出色的管理者，在管理事物方面無與倫比。' },
    ESFJ: { name: '執政官', desc: '非常關心他人，愛社交、受歡迎。' },
    ISTP: { name: '鑑賞家', desc: '大膽且實際的實驗者。' },
    ISFP: { name: '探險家', desc: '靈活有魅力的藝術家。' },
    ESTP: { name: '企業家', desc: '聰明、精力充沛且敏銳的人。' },
    ESFP: { name: '表演者', desc: '自發性、精力充沛的表演者。' }
};

let currentQuestion = 0;
let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

function startTest() {
    currentQuestion = 0;
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    resultEl.style.display = 'none';
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQuestion];

    testArea.innerHTML = `
        <div class="test-question">
            <span style="color: #EC407A;">問題 ${currentQuestion + 1}/${questions.length}</span><br><br>
            ${q.question}
        </div>
        <div class="test-options" id="options"></div>
    `;

    const optionsEl = document.getElementById('options');
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.addEventListener('click', () => selectOption(opt.scores));
        optionsEl.appendChild(btn);
    });
}

function selectOption(optScores) {
    for (const [key, value] of Object.entries(optScores)) {
        scores[key] += value;
    }

    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const type =
        (scores.E >= scores.I ? 'E' : 'I') +
        (scores.S >= scores.N ? 'S' : 'N') +
        (scores.T >= scores.F ? 'T' : 'F') +
        (scores.J >= scores.P ? 'J' : 'P');

    const personality = personalities[type];

    testArea.innerHTML = '';
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
        <h3>${type} - ${personality.name}</h3>
        <p style="margin-top: 10px;">${personality.desc}</p>
    `;
}

document.getElementById('startBtn').addEventListener('click', startTest);

testArea.innerHTML = `
    <div style="text-align: center; padding: 40px 0;">
        <p>回答 5 個簡單的問題</p>
        <p>探索你的性格類型！</p>
    </div>
`;
