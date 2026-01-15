const container = document.getElementById('itemsContainer');
const loader = document.getElementById('loader');
let itemCount = 0;
let loading = false;

function createItem(num) {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<h3>Item ${num}</h3><p>這是第 ${num} 個項目的內容</p>`;
    return item;
}

function loadMore() {
    if (loading) return;
    loading = true;

    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            itemCount++;
            container.appendChild(createItem(itemCount));
        }
        loading = false;
    }, 500);
}

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        loadMore();
    }
}, { threshold: 0.1 });

observer.observe(loader);
loadMore();
