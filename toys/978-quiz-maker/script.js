const quizArea = document.getElementById('quizArea');
const scoreEl = document.getElementById('score');

const quizzes = [
    {
        question: '太陽系中最大的行星是哪一顆？',
        answers: ['木星', '土星', '天王星', '海王星'],
        correct: 0
    },
    {
        question: '光年是什麼的單位？',
        answers: ['時間', '距離', '速度', '質量'],
        correct: 1
    },
    {
        question: '人體最大的器官是什麼？',
        answers: ['心臟', '肝臟', '皮膚', '大腦'],
        correct: 2
    },
    {
        question: '地球上最深的海溝是？',
        answers: ['日本海溝', '馬里亞納海溝', '波多黎各海溝', '爪哇海溝'],
        correct: 1
    },
    {
        question: 'HTML 代表什麼？',
        answers: ['超文本標記語言', '高級文本機器語言', '超連結文本標記', '家庭工具標記語言'],
        correct: 0
    },
    {
        question: '哪種動物是世界上最快的陸地動物？',
        answers: ['獅子', '獵豹', '老虎', '馬'],
        correct: 1
    },
    {
        question: '人類 DNA 的雙螺旋結構是誰發現的？',
        answers: ['愛因斯坦', '牛頓', '沃森和克里克', '達爾文'],
        correct: 2
    },
    {
        question: '世界上使用人數最多的語言是？',
        answers: ['英語', '西班牙語', '中文', '印地語'],
        correct: 2
    }
];

let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function startQuiz() {
    currentQuestions = shuffleArray(quizzes).slice(0, 5);
    currentIndex = 0;
    score = 0;
    scoreEl.textContent = '';
    showQuestion();
}

function showQuestion() {
    answered = false;
    const q = currentQuestions[currentIndex];

    quizArea.innerHTML = `
        <div class="question">
            <span style="color: #4CAF50;">問題 ${currentIndex + 1}/5：</span><br>
            ${q.question}
        </div>
        <div class="answers" id="answers"></div>
    `;

    const answersEl = document.getElementById('answers');
    q.answers.forEach((answer, i) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.addEventListener('click', () => checkAnswer(i, btn));
        answersEl.appendChild(btn);
    });
}

function checkAnswer(index, btn) {
    if (answered) return;
    answered = true;

    const q = currentQuestions[currentIndex];
    const buttons = document.querySelectorAll('.answers button');

    buttons.forEach((b, i) => {
        b.style.pointerEvents = 'none';
        if (i === q.correct) {
            b.classList.add('correct');
        } else if (i === index) {
            b.classList.add('wrong');
        }
    });

    if (index === q.correct) {
        score++;
    }

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 1000);
}

function showResult() {
    let message = '';
    if (score === 5) {
        message = '太厲害了！你是知識達人！';
    } else if (score >= 3) {
        message = '不錯喔！繼續加油！';
    } else {
        message = '再接再厲，學無止境！';
    }

    quizArea.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
            <h3 style="color: #4CAF50; margin-bottom: 15px;">測驗完成！</h3>
            <p style="font-size: 36px; margin-bottom: 10px;">${score}/5</p>
            <p>${message}</p>
        </div>
    `;

    scoreEl.textContent = `正確率：${(score / 5 * 100).toFixed(0)}%`;
}

document.getElementById('newQuizBtn').addEventListener('click', startQuiz);

startQuiz();
