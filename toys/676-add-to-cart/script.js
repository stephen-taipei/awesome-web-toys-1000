const addBtn = document.getElementById('addBtn');
const cartCount = document.getElementById('cartCount');
const cartIcon = document.getElementById('cartIcon');
const flyingItem = document.getElementById('flyingItem');
let count = 0;

addBtn.addEventListener('click', () => {
    addBtn.classList.add('adding');
    setTimeout(() => addBtn.classList.remove('adding'), 300);

    // Flying animation
    const btnRect = addBtn.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    const demoRect = addBtn.closest('.demo-area').getBoundingClientRect();

    flyingItem.style.left = `${btnRect.left - demoRect.left + btnRect.width/2}px`;
    flyingItem.style.top = `${btnRect.top - demoRect.top}px`;
    flyingItem.style.setProperty('--tx', `${cartRect.left - btnRect.left}px`);
    flyingItem.style.setProperty('--ty', `${cartRect.top - btnRect.top}px`);

    flyingItem.classList.remove('fly');
    void flyingItem.offsetWidth;
    flyingItem.classList.add('fly');

    setTimeout(() => {
        count++;
        cartCount.textContent = count;
        cartCount.classList.add('bump');
        setTimeout(() => cartCount.classList.remove('bump'), 300);
    }, 500);
});
