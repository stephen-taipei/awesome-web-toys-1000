function init() {
    document.getElementById('calcBtn').addEventListener('click', calculate);
    document.getElementById('birthDate').addEventListener('change', calculate);
}

function calculate() {
    const birthDate = new Date(document.getElementById('birthDate').value);
    const today = new Date();

    if (isNaN(birthDate.getTime()) || birthDate > today) {
        return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    document.getElementById('years').textContent = years;
    document.getElementById('months').textContent = months;
    document.getElementById('days').textContent = days;

    const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    document.getElementById('totalDays').textContent = totalDays.toLocaleString();
    document.getElementById('totalWeeks').textContent = totalWeeks.toLocaleString();

    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday <= today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    document.getElementById('nextBirthday').textContent = daysUntilBirthday;
}

document.addEventListener('DOMContentLoaded', init);
