const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('search');
const paginationEl = document.getElementById('pagination');
const infoEl = document.getElementById('info');

const categories = ['電子', '服飾', '食品', '家居'];
const names = ['商品A', '商品B', '商品C', '商品D', '商品E', '商品F', '商品G', '商品H'];

const data = [];
for (let i = 0; i < 50; i++) {
    data.push({
        name: names[Math.floor(Math.random() * names.length)] + (i + 1),
        category: categories[Math.floor(Math.random() * categories.length)],
        value: Math.floor(Math.random() * 1000) + 100
    });
}

let filteredData = [...data];
let sortColumn = null;
let sortDirection = 1;
let currentPage = 1;
const pageSize = 8;

function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const pageData = filteredData.slice(start, start + pageSize);

    tableBody.innerHTML = pageData.map(row => `
        <tr>
            <td>${row.name}</td>
            <td>${row.category}</td>
            <td>${row.value}</td>
        </tr>
    `).join('');

    renderPagination();
    infoEl.textContent = `顯示 ${start + 1}-${Math.min(start + pageSize, filteredData.length)} / ${filteredData.length} 筆`;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    paginationEl.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        paginationEl.appendChild(btn);
    }
}

function sortData(column) {
    if (sortColumn === column) {
        sortDirection *= -1;
    } else {
        sortColumn = column;
        sortDirection = 1;
    }

    filteredData.sort((a, b) => {
        if (typeof a[column] === 'number') {
            return (a[column] - b[column]) * sortDirection;
        }
        return a[column].localeCompare(b[column]) * sortDirection;
    });

    currentPage = 1;
    renderTable();
}

function filterData(query) {
    query = query.toLowerCase();
    filteredData = data.filter(row =>
        row.name.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query) ||
        row.value.toString().includes(query)
    );

    if (sortColumn) {
        filteredData.sort((a, b) => {
            if (typeof a[sortColumn] === 'number') {
                return (a[sortColumn] - b[sortColumn]) * sortDirection;
            }
            return a[sortColumn].localeCompare(b[sortColumn]) * sortDirection;
        });
    }

    currentPage = 1;
    renderTable();
}

document.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => sortData(th.dataset.col));
});

searchInput.addEventListener('input', (e) => filterData(e.target.value));

renderTable();
