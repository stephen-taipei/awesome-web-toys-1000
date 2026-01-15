const pages = document.querySelectorAll('.page');
const dots = document.querySelectorAll('.dot');
const pagesContainer = document.querySelector('.pages-container');
const transitionSelect = document.getElementById('transitionType');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentPage = 1;
const totalPages = 3;

function setTransitionType(type) {
    pagesContainer.className = 'pages-container';
    if (type !== 'fade') {
        pagesContainer.classList.add(`transition-${type}`);
    }
}

function goToPage(pageNum) {
    const prevPage = currentPage;
    currentPage = pageNum;

    pages.forEach(page => {
        const num = parseInt(page.dataset.page);
        page.classList.remove('active', 'prev');
        if (num === currentPage) {
            page.classList.add('active');
        } else if (num === prevPage) {
            page.classList.add('prev');
        }
    });

    dots.forEach(dot => {
        dot.classList.toggle('active', parseInt(dot.dataset.page) === currentPage);
    });
}

function nextPage() {
    const next = currentPage >= totalPages ? 1 : currentPage + 1;
    goToPage(next);
}

function prevPage() {
    const prev = currentPage <= 1 ? totalPages : currentPage - 1;
    goToPage(prev);
}

transitionSelect.addEventListener('change', (e) => setTransitionType(e.target.value));
nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);
dots.forEach(dot => {
    dot.addEventListener('click', () => goToPage(parseInt(dot.dataset.page)));
});

setTransitionType('fade');
