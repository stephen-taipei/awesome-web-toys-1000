const animGroups = document.querySelectorAll('.anim-group');
const anim1Btn = document.getElementById('anim1');
const anim2Btn = document.getElementById('anim2');
const anim3Btn = document.getElementById('anim3');
const anim4Btn = document.getElementById('anim4');
const anim5Btn = document.getElementById('anim5');
const anim6Btn = document.getElementById('anim6');

const buttons = [anim1Btn, anim2Btn, anim3Btn, anim4Btn, anim5Btn, anim6Btn];

function setAnimation(index) {
    animGroups.forEach((g, i) => {
        g.classList.toggle('active', i === index);
    });
    buttons.forEach((b, i) => {
        b.classList.toggle('active', i === index);
    });
}

anim1Btn.addEventListener('click', () => setAnimation(0));
anim2Btn.addEventListener('click', () => setAnimation(1));
anim3Btn.addEventListener('click', () => setAnimation(2));
anim4Btn.addEventListener('click', () => setAnimation(3));
anim5Btn.addEventListener('click', () => setAnimation(4));
anim6Btn.addEventListener('click', () => setAnimation(5));
