const names = {
    fantasy: {
        prefixes: ['Aer', 'Thal', 'Eld', 'Gor', 'Zan', 'Myr', 'Vel', 'Kael', 'Dra', 'Syl'],
        suffixes: ['ith', 'orn', 'wyn', 'dor', 'ria', 'wen', 'ion', 'ara', 'oth', 'mir']
    },
    scifi: {
        prefixes: ['Zyx', 'Nex', 'Vex', 'Orb', 'Kry', 'Xen', 'Cyr', 'Nova', 'Axi', 'Plex'],
        suffixes: ['on', 'ax', 'ex', 'ix', 'us', 'is', 'or', 'ar', 'um', 'ia']
    },
    chinese: {
        surnames: ['李', '王', '張', '劉', '陳', '楊', '黃', '趙', '吳', '周', '林', '徐'],
        names: ['志明', '俊傑', '雅婷', '怡君', '宗翰', '雅涵', '冠宇', '佳穎', '承翰', '詩涵', '宇軒', '欣怡']
    },
    username: {
        adjectives: ['Cool', 'Epic', 'Dark', 'Swift', 'Ninja', 'Cyber', 'Shadow', 'Fire', 'Ice', 'Storm'],
        nouns: ['Wolf', 'Dragon', 'Phoenix', 'Tiger', 'Hawk', 'Viper', 'Ghost', 'Knight', 'Raven', 'Fox']
    }
};

let history = [];

function init() {
    document.getElementById('generateBtn').addEventListener('click', generate);
}

function generate() {
    const type = document.getElementById('type').value;
    let name = '';

    switch(type) {
        case 'fantasy':
            name = names.fantasy.prefixes[Math.floor(Math.random() * names.fantasy.prefixes.length)] +
                   names.fantasy.suffixes[Math.floor(Math.random() * names.fantasy.suffixes.length)];
            break;
        case 'scifi':
            name = names.scifi.prefixes[Math.floor(Math.random() * names.scifi.prefixes.length)] +
                   names.scifi.suffixes[Math.floor(Math.random() * names.scifi.suffixes.length)];
            break;
        case 'chinese':
            name = names.chinese.surnames[Math.floor(Math.random() * names.chinese.surnames.length)] +
                   names.chinese.names[Math.floor(Math.random() * names.chinese.names.length)];
            break;
        case 'username':
            name = names.username.adjectives[Math.floor(Math.random() * names.username.adjectives.length)] +
                   names.username.nouns[Math.floor(Math.random() * names.username.nouns.length)] +
                   Math.floor(Math.random() * 100);
            break;
    }

    document.getElementById('result').textContent = name;
    history.unshift(name);
    if (history.length > 10) history.pop();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history');
    container.innerHTML = history.map(n => '<div>' + n + '</div>').join('');
}

document.addEventListener('DOMContentLoaded', init);
