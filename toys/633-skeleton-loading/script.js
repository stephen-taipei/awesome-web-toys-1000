const cards = document.querySelectorAll('.card-skeleton');
const toggleBtn = document.getElementById('toggleBtn');
let loaded = false;

toggleBtn.addEventListener('click', () => {
    loaded = !loaded;
    cards.forEach(card => card.classList.toggle('loaded', loaded));
    toggleBtn.textContent = loaded ? '顯示骨架' : '切換內容';
});
