let transactions = [];
let currentType = 'expense';

function init() {
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentType = btn.dataset.type;
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    document.getElementById('addBtn').addEventListener('click', addTransaction);
    updateUI();
}

function addTransaction() {
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    if (!desc || isNaN(amount) || amount <= 0) return;

    transactions.push({
        id: Date.now(),
        desc,
        amount: currentType === 'income' ? amount : -amount,
        type: currentType
    });

    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
    updateUI();
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
}

function updateUI() {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expense;

    document.getElementById('balance').textContent = '$' + balance.toLocaleString();
    document.getElementById('income').textContent = '$' + income.toLocaleString();
    document.getElementById('expense').textContent = '$' + expense.toLocaleString();

    const container = document.getElementById('transactions');
    container.innerHTML = transactions.slice().reverse().map(t => `
        <div class="transaction ${t.type}">
            <span class="desc">${t.desc}</span>
            <span class="amount" style="color: ${t.amount > 0 ? '#2ecc71' : '#e74c3c'}">
                ${t.amount > 0 ? '+' : ''}$${Math.abs(t.amount).toLocaleString()}
            </span>
            <button class="delete" onclick="deleteTransaction(${t.id})">×</button>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
