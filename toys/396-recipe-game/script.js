const ingredientsEl = document.getElementById('ingredients');
const ingredientsInEl = document.getElementById('ingredientsIn');
const resultEl = document.getElementById('result');

const allIngredients = ['🍅', '🧀', '🍞', '🥚', '🥓', '🥬', '🍗', '🍚', '🍜', '🧈', '🌶️', '🧄'];

const recipes = {
    '🍅🧀🍞': { name: '起司三明治', emoji: '🥪' },
    '🥚🥓🍞': { name: '培根蛋三明治', emoji: '🥪' },
    '🍅🥬🧀': { name: '沙拉', emoji: '🥗' },
    '🍗🍚': { name: '雞肉飯', emoji: '🍛' },
    '🍜🥚': { name: '拉麵', emoji: '🍜' },
    '🥚🧈': { name: '炒蛋', emoji: '🍳' },
    '🍅🌶️🧄': { name: '辣醬', emoji: '🫕' },
    '🍚🥚': { name: '蛋炒飯', emoji: '🍚' },
    '🍗🌶️': { name: '辣子雞', emoji: '🍗' },
    '🧀🍞🧈': { name: '烤起司', emoji: '🧀' }
};

let selectedIngredients = [];

function createIngredientButtons() {
    allIngredients.forEach(ing => {
        const btn = document.createElement('button');
        btn.className = 'ingredient-btn';
        btn.textContent = ing;
        btn.onclick = () => addIngredient(ing, btn);
        ingredientsEl.appendChild(btn);
    });
}

function addIngredient(ingredient, btn) {
    if (selectedIngredients.length >= 3 || btn.classList.contains('used')) return;

    selectedIngredients.push(ingredient);
    btn.classList.add('used');
    updateDisplay();
}

function updateDisplay() {
    ingredientsInEl.textContent = selectedIngredients.join(' + ');
    if (selectedIngredients.length === 0) {
        resultEl.textContent = '加入食材來創造料理!';
    } else if (selectedIngredients.length < 2) {
        resultEl.textContent = '再加一些食材...';
    } else {
        resultEl.textContent = '按下「開始料理」來烹飪!';
    }
}

function cook() {
    if (selectedIngredients.length < 2) {
        resultEl.textContent = '需要至少 2 種食材!';
        return;
    }

    const sorted = [...selectedIngredients].sort().join('');

    // Check all possible combinations
    let found = null;
    for (const [key, value] of Object.entries(recipes)) {
        const keyIngredients = [...key];
        if (selectedIngredients.every(i => keyIngredients.includes(i)) &&
            keyIngredients.every(i => selectedIngredients.includes(i))) {
            found = value;
            break;
        }
    }

    if (found) {
        resultEl.innerHTML = `${found.emoji} 成功做出 <strong>${found.name}</strong>!`;
    } else {
        const mystery = ['🤔', '😅', '🫠'][Math.floor(Math.random() * 3)];
        resultEl.innerHTML = `${mystery} 做出了神秘料理...`;
    }
}

function reset() {
    selectedIngredients = [];
    document.querySelectorAll('.ingredient-btn').forEach(btn => btn.classList.remove('used'));
    updateDisplay();
}

document.getElementById('cook').addEventListener('click', cook);
document.getElementById('reset').addEventListener('click', reset);

createIngredientButtons();
