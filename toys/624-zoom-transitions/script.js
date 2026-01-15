const boxes = document.querySelectorAll('.zoom-box');
const playAllBtn = document.getElementById('playAll');
const resetBtn = document.getElementById('resetAll');

boxes.forEach(box => {
    box.addEventListener('click', () => {
        box.classList.remove('animate');
        void box.offsetWidth;
        box.classList.add('animate');
    });
});

playAllBtn.addEventListener('click', () => {
    boxes.forEach((box, index) => {
        setTimeout(() => {
            box.classList.remove('animate');
            void box.offsetWidth;
            box.classList.add('animate');
        }, index * 200);
    });
});

resetBtn.addEventListener('click', () => {
    boxes.forEach(box => box.classList.remove('animate'));
});
