const categoryFiltersEl = document.getElementById('categoryFilters');
const priceRangeEl = document.getElementById('priceRange');
const priceValueEl = document.getElementById('priceValue');
const starFilterEl = document.getElementById('starFilter');
const resultsEl = document.getElementById('results');
const infoEl = document.getElementById('info');
const resetBtn = document.getElementById('resetBtn');

const categories = ['電子', '服飾', '食品', '家居'];
const products = [];

for (let i = 0; i < 30; i++) {
    products.push({
        name: `商品 ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: Math.floor(Math.random() * 900) + 100,
        rating: Math.floor(Math.random() * 5) + 1
    });
}

let selectedCategories = new Set(categories);
let maxPrice = 1000;
let minRating = 1;

// Create category checkboxes
categories.forEach(cat => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" checked data-cat="${cat}"><span>${cat}</span>`;
    categoryFiltersEl.appendChild(label);
});

// Create star filter
for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.textContent = '★';
    star.dataset.rating = i;
    star.className = 'active';
    starFilterEl.appendChild(star);
}

function applyFilters() {
    const filtered = products.filter(p =>
        selectedCategories.has(p.category) &&
        p.price <= maxPrice &&
        p.rating >= minRating
    );

    resultsEl.innerHTML = filtered.map(p => `
        <div class="result-item">
            <span>${p.name} (${p.category})</span>
            <span>$${p.price} ${'★'.repeat(p.rating)}</span>
        </div>
    `).join('');

    infoEl.textContent = `找到 ${filtered.length} 個商品`;
}

// Category filter
categoryFiltersEl.addEventListener('change', (e) => {
    const cat = e.target.dataset.cat;
    if (e.target.checked) {
        selectedCategories.add(cat);
    } else {
        selectedCategories.delete(cat);
    }
    applyFilters();
});

// Price filter
priceRangeEl.addEventListener('input', (e) => {
    maxPrice = parseInt(e.target.value);
    priceValueEl.textContent = `$0 - $${maxPrice}`;
    applyFilters();
});

// Star filter
starFilterEl.addEventListener('click', (e) => {
    if (e.target.dataset.rating) {
        minRating = parseInt(e.target.dataset.rating);
        starFilterEl.querySelectorAll('span').forEach((star, i) => {
            star.className = i < minRating ? 'active' : '';
        });
        applyFilters();
    }
});

// Reset
resetBtn.addEventListener('click', () => {
    selectedCategories = new Set(categories);
    maxPrice = 1000;
    minRating = 1;

    categoryFiltersEl.querySelectorAll('input').forEach(cb => cb.checked = true);
    priceRangeEl.value = 1000;
    priceValueEl.textContent = '$0 - $1000';
    starFilterEl.querySelectorAll('span').forEach(star => star.className = 'active');

    applyFilters();
});

applyFilters();
