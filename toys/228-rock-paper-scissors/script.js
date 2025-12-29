let playerScore = 0;
let computerScore = 0;
let isPlaying = false;

const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };
const names = { rock: '石頭', paper: '布', scissors: '剪刀' };

function init() {
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isPlaying) return;
            play(btn.dataset.choice);
        });
    });

    document.getElementById('resetBtn').addEventListener('click', resetScores);
}

function play(playerChoice) {
    isPlaying = true;

    const computerChoice = choices[Math.floor(Math.random() * 3)];

    const playerHand = document.getElementById('playerHand');
    const computerHand = document.getElementById('computerHand');

    playerHand.classList.add('shake');
    computerHand.classList.add('shake');
    playerHand.textContent = '❓';
    computerHand.textContent = '❓';
    document.getElementById('result').textContent = '...';
    document.getElementById('result').className = 'result';

    setTimeout(() => {
        playerHand.classList.remove('shake');
        computerHand.classList.remove('shake');
        playerHand.textContent = emojis[playerChoice];
        computerHand.textContent = emojis[computerChoice];

        const result = getResult(playerChoice, computerChoice);
        showResult(result, playerChoice, computerChoice);

        isPlaying = false;
    }, 500);
}

function getResult(player, computer) {
    if (player === computer) return 'draw';
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')
    ) {
        return 'win';
    }
    return 'lose';
}

function showResult(result, playerChoice, computerChoice) {
    const resultEl = document.getElementById('result');

    if (result === 'win') {
        playerScore++;
        resultEl.textContent = '你贏了!';
        resultEl.className = 'result win';
    } else if (result === 'lose') {
        computerScore++;
        resultEl.textContent = '你輸了!';
        resultEl.className = 'result lose';
    } else {
        resultEl.textContent = '平手!';
        resultEl.className = 'result draw';
    }

    updateScores();
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function resetScores() {
    playerScore = 0;
    computerScore = 0;
    updateScores();
    document.getElementById('playerHand').textContent = '❓';
    document.getElementById('computerHand').textContent = '❓';
    document.getElementById('result').textContent = '選擇你的招式';
    document.getElementById('result').className = 'result';
}

document.addEventListener('DOMContentLoaded', init);
