const slides = document.querySelectorAll('.slide');
const wrapper = document.querySelector('.slides-wrapper');
const directionSelect = document.getElementById('direction');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let current = 0;
const total = slides.length;

function updateDirection(dir) {
    wrapper.className = `slides-wrapper ${dir}`;
}

function goToSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'prev');
        if (i === index) {
            slide.classList.add('active');
        } else if (i === current) {
            slide.classList.add('prev');
        }
    });
    current = index;
}

function next() {
    const nextIndex = (current + 1) % total;
    goToSlide(nextIndex);
}

function prev() {
    const prevIndex = (current - 1 + total) % total;
    goToSlide(prevIndex);
}

directionSelect.addEventListener('change', (e) => updateDirection(e.target.value));
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);

updateDirection('horizontal');
