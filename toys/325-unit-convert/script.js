const units = {
    length: {
        'm': { name: '公尺', factor: 1 },
        'km': { name: '公里', factor: 1000 },
        'cm': { name: '公分', factor: 0.01 },
        'mm': { name: '公釐', factor: 0.001 },
        'in': { name: '英寸', factor: 0.0254 },
        'ft': { name: '英尺', factor: 0.3048 }
    },
    weight: {
        'kg': { name: '公斤', factor: 1 },
        'g': { name: '公克', factor: 0.001 },
        'mg': { name: '毫克', factor: 0.000001 },
        'lb': { name: '磅', factor: 0.453592 },
        'oz': { name: '盎司', factor: 0.0283495 }
    },
    temp: {
        'C': { name: '攝氏', factor: 1 },
        'F': { name: '華氏', factor: 1 },
        'K': { name: '克氏', factor: 1 }
    }
};

let currentCategory = 'length';

function init() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.cat;
            populateUnits();
        });
    });

    document.getElementById('value1').addEventListener('input', convert);
    document.getElementById('unit1').addEventListener('change', convert);
    document.getElementById('unit2').addEventListener('change', convert);
    document.getElementById('swapBtn').addEventListener('click', swap);

    populateUnits();
}

function populateUnits() {
    const unit1 = document.getElementById('unit1');
    const unit2 = document.getElementById('unit2');
    const unitList = units[currentCategory];

    unit1.innerHTML = '';
    unit2.innerHTML = '';

    const keys = Object.keys(unitList);
    keys.forEach((key, i) => {
        unit1.innerHTML += '<option value="' + key + '">' + unitList[key].name + '</option>';
        unit2.innerHTML += '<option value="' + key + '"' + (i === 1 ? ' selected' : '') + '>' + unitList[key].name + '</option>';
    });

    convert();
}

function convert() {
    const value = parseFloat(document.getElementById('value1').value) || 0;
    const from = document.getElementById('unit1').value;
    const to = document.getElementById('unit2').value;

    let result;

    if (currentCategory === 'temp') {
        result = convertTemp(value, from, to);
    } else {
        const unitList = units[currentCategory];
        const inBase = value * unitList[from].factor;
        result = inBase / unitList[to].factor;
    }

    document.getElementById('value2').value = result.toFixed(4).replace(/\.?0+$/, '');
}

function convertTemp(value, from, to) {
    let celsius;
    if (from === 'C') celsius = value;
    else if (from === 'F') celsius = (value - 32) * 5/9;
    else celsius = value - 273.15;

    if (to === 'C') return celsius;
    else if (to === 'F') return celsius * 9/5 + 32;
    else return celsius + 273.15;
}

function swap() {
    const unit1 = document.getElementById('unit1');
    const unit2 = document.getElementById('unit2');
    const temp = unit1.value;
    unit1.value = unit2.value;
    unit2.value = temp;
    convert();
}

document.addEventListener('DOMContentLoaded', init);
