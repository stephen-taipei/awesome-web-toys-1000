const blob1 = document.querySelector('.blob1');
const blob2 = document.querySelector('.blob2');
const mergeBtn = document.getElementById('mergeBtn');
const splitBtn = document.getElementById('splitBtn');
const autoBtn = document.getElementById('autoBtn');

let isAuto = false;

function merge() {
    blob1.classList.remove('split', 'auto');
    blob2.classList.remove('split', 'auto');
    blob1.classList.add('merged');
    blob2.classList.add('merged');
}

function split() {
    blob1.classList.remove('merged', 'auto');
    blob2.classList.remove('merged', 'auto');
    blob1.classList.add('split');
    blob2.classList.add('split');
}

function toggleAuto() {
    isAuto = !isAuto;
    autoBtn.classList.toggle('active', isAuto);

    if (isAuto) {
        blob1.classList.remove('merged', 'split');
        blob2.classList.remove('merged', 'split');
        blob1.classList.add('auto');
        blob2.classList.add('auto');
    } else {
        blob1.classList.remove('auto');
        blob2.classList.remove('auto');
    }
}

mergeBtn.addEventListener('click', () => { isAuto = false; autoBtn.classList.remove('active'); merge(); });
splitBtn.addEventListener('click', () => { isAuto = false; autoBtn.classList.remove('active'); split(); });
autoBtn.addEventListener('click', toggleAuto);
