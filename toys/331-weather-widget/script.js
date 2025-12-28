const weatherData = {
    taipei: { location: '台北市', icon: '☀️', temp: 28, desc: '晴朗', humidity: 65, wind: 12 },
    tokyo: { location: '東京', icon: '⛅', temp: 22, desc: '多雲', humidity: 70, wind: 15 },
    newyork: { location: '紐約', icon: '🌧️', temp: 18, desc: '小雨', humidity: 80, wind: 20 },
    london: { location: '倫敦', icon: '🌫️', temp: 12, desc: '霧', humidity: 85, wind: 8 }
};

function init() {
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.addEventListener('click', () => selectCity(btn.dataset.city));
    });
    updateWeather('taipei');
}

function selectCity(city) {
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.city === city);
    });
    updateWeather(city);
}

function updateWeather(city) {
    const data = weatherData[city];
    if (!data) return;

    document.getElementById('location').textContent = data.location;
    document.getElementById('weatherIcon').textContent = data.icon;
    document.getElementById('temp').textContent = data.temp + '°C';
    document.getElementById('desc').textContent = data.desc;
    document.getElementById('humidity').textContent = data.humidity + '%';
    document.getElementById('wind').textContent = data.wind + ' km/h';

    updateBackground(data.icon);
}

function updateBackground(icon) {
    const gradients = {
        '☀️': 'linear-gradient(135deg, #f39c12, #e74c3c)',
        '⛅': 'linear-gradient(135deg, #74b9ff, #0984e3)',
        '🌧️': 'linear-gradient(135deg, #636e72, #2d3436)',
        '🌫️': 'linear-gradient(135deg, #b2bec3, #636e72)'
    };
    document.body.style.background = gradients[icon] || gradients['☀️'];
}

document.addEventListener('DOMContentLoaded', init);
