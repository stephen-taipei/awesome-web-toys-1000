function init() {
    document.getElementById('bill').addEventListener('input', calculate);
    document.getElementById('tipSlider').addEventListener('input', e => {
        document.getElementById('tipPercent').textContent = e.target.value;
        calculate();
    });
    document.getElementById('peopleSlider').addEventListener('input', e => {
        document.getElementById('peopleCount').textContent = e.target.value;
        calculate();
    });
}

function calculate() {
    const bill = parseFloat(document.getElementById('bill').value) || 0;
    const tipPercent = parseInt(document.getElementById('tipSlider').value);
    const people = parseInt(document.getElementById('peopleSlider').value);

    const tip = bill * (tipPercent / 100);
    const total = bill + tip;
    const perPerson = total / people;

    document.getElementById('tipAmount').textContent = '$' + tip.toFixed(2);
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
    document.getElementById('perPerson').textContent = '$' + perPerson.toFixed(2);
}

document.addEventListener('DOMContentLoaded', init);
