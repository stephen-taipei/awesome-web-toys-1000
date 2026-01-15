const filterShape = document.getElementById('filterShape');
const filter1Btn = document.getElementById('filter1');
const filter2Btn = document.getElementById('filter2');
const filter3Btn = document.getElementById('filter3');
const filter4Btn = document.getElementById('filter4');
const filter5Btn = document.getElementById('filter5');
const filter6Btn = document.getElementById('filter6');

const buttons = [filter1Btn, filter2Btn, filter3Btn, filter4Btn, filter5Btn, filter6Btn];
const filters = ['blurFilter', 'glowFilter', 'turbulenceFilter', 'colorFilter', 'morphFilter', 'shadowFilter'];

function setFilter(filterId, btn) {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterShape.setAttribute('filter', `url(#${filterId})`);
}

filter1Btn.addEventListener('click', () => setFilter('blurFilter', filter1Btn));
filter2Btn.addEventListener('click', () => setFilter('glowFilter', filter2Btn));
filter3Btn.addEventListener('click', () => setFilter('turbulenceFilter', filter3Btn));
filter4Btn.addEventListener('click', () => setFilter('colorFilter', filter4Btn));
filter5Btn.addEventListener('click', () => setFilter('morphFilter', filter5Btn));
filter6Btn.addEventListener('click', () => setFilter('shadowFilter', filter6Btn));
