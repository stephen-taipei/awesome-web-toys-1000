function init() {
    document.getElementById('calcBtn').addEventListener('click', calculate);
    document.getElementById('height').addEventListener('keypress', e => { if (e.key === 'Enter') calculate(); });
    document.getElementById('weight').addEventListener('keypress', e => { if (e.key === 'Enter') calculate(); });
}

function calculate() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (!height || !weight || height <= 0 || weight <= 0) {
        document.getElementById('bmiValue').textContent = '--';
        document.getElementById('bmiCategory').textContent = '請輸入有效數據';
        return;
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    document.getElementById('bmiValue').textContent = bmi.toFixed(1);

    let category, color;
    if (bmi < 18.5) {
        category = '體重過輕';
        color = '#3498db';
    } else if (bmi < 24) {
        category = '正常範圍';
        color = '#2ecc71';
    } else if (bmi < 27) {
        category = '過重';
        color = '#f1c40f';
    } else {
        category = '肥胖';
        color = '#e74c3c';
    }

    document.getElementById('bmiCategory').textContent = category;
    document.getElementById('bmiCategory').style.color = color;
    document.getElementById('bmiValue').style.color = color;

    const position = Math.min(Math.max((bmi - 15) / 20 * 100, 0), 100);
    document.getElementById('bmiIndicator').style.left = `calc(${position}% - 5px)`;
}

document.addEventListener('DOMContentLoaded', init);
