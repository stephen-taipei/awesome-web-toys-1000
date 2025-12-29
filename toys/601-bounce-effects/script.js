const items = document.querySelectorAll('.bounce-item');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

items.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.remove('active');
        void item.offsetWidth; // Trigger reflow
        item.classList.add('active');
    });

    item.addEventListener('animationend', () => {
        item.classList.remove('active');
    });
});

playBtn.addEventListener('click', () => {
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.remove('active');
            void item.offsetWidth;
            item.classList.add('active');
        }, index * 150);
    });
});

resetBtn.addEventListener('click', () => {
    items.forEach(item => {
        item.classList.remove('active');
    });
});
