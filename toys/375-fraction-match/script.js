const targetEl = document.getElementById('target');
const optionsEl = document.getElementById('options');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');

let score = 0;
let targetFraction = { num: 1, den: 2 };

const baseFractions = [
    { num: 1, den: 2 }, { num: 1, den: 3 }, { num: 1, den: 4 },
    { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 1, den: 5 },
    { num: 2, den: 5 }, { num: 3, den: 5 }
];

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function generateEquivalent(frac, multiplier) {
    return { num: frac.num * multiplier, den: frac.den * multiplier };
}

function areFractionsEqual(f1, f2) {
    return f1.num * f2.den === f2.num * f1.den;
}

function generatePuzzle() {
    targetFraction = baseFractions[Math.floor(Math.random() * baseFractions.length)];
    const multiplier = Math.floor(Math.random() * 4) + 2;
    const correct = generateEquivalent(targetFraction, multiplier);

    const wrongs = [];
    while (wrongs.length < 3) {
        const wrongNum = Math.floor(Math.random() * 10) + 1;
        const wrongDen = Math.floor(Math.random() * 10) + 2;
        const wrong = { num: wrongNum, den: wrongDen };

        if (!areFractionsEqual(wrong, targetFraction) &&
            !wrongs.some(w => w.num === wrong.num && w.den === wrong.den)) {
            wrongs.push(wrong);
        }
    }

    const options = [...wrongs, correct].sort(() => Math.random() - 0.5);

    targetEl.innerHTML = `
        <span class="numerator">${targetFraction.num}</span>
        <span class="denominator">${targetFraction.den}</span>
    `;

    optionsEl.innerHTML = options.map((opt, i) => `
        <button class="option" data-index="${i}" data-num="${opt.num}" data-den="${opt.den}">
            <span class="numerator">${opt.num}</span>
            <span class="denominator">${opt.den}</span>
        </button>
    `).join('');

    optionsEl.querySelectorAll('.option').forEach(btn => {
        btn.onclick = () => checkAnswer(btn);
    });

    resultEl.textContent = '';
}

function checkAnswer(btn) {
    const num = parseInt(btn.dataset.num);
    const den = parseInt(btn.dataset.den);
    const selected = { num, den };

    optionsEl.querySelectorAll('.option').forEach(b => b.disabled = true);

    if (areFractionsEqual(selected, targetFraction)) {
        btn.classList.add('correct');
        score += 10;
        scoreEl.textContent = score;
        resultEl.textContent = '✅ 正確!';
    } else {
        btn.classList.add('wrong');
        resultEl.textContent = '❌ 錯誤!';
        optionsEl.querySelectorAll('.option').forEach(b => {
            const n = parseInt(b.dataset.num);
            const d = parseInt(b.dataset.den);
            if (areFractionsEqual({ num: n, den: d }, targetFraction)) {
                b.classList.add('correct');
            }
        });
    }

    setTimeout(generatePuzzle, 2000);
}

generatePuzzle();
