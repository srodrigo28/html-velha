// --- CONSTANTES E VARIÁVEIS DE ESTADO ---
const X_CLASS = 'x';
const O_CLASS = 'circle';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Elementos DOM
const board = document.querySelector('[data-board]');
const cellElements = document.querySelectorAll('[data-cell]');
const winningMessageElement = document.querySelector('[data-winning-message]');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const restartButton = document.querySelector('[data-restart-game]');

// Elementos da Tela de Início
const startMessageElement = document.querySelector('[data-start-message]');
const selectXButton = document.querySelector('[data-select-x]');
const selectOButton = document.querySelector('[data-select-o]');
const startGameButton = document.querySelector('[data-start-game]');
const difficultySelect = document.querySelector('[data-difficulty]'); // NOVO

// Elementos do Placar
const scorePlayerSpan = document.querySelector('[data-score-player]');
const scoreCpuSpan = document.querySelector('[data-score-cpu]');
const scoreTiesSpan = document.querySelector('[data-score-ties]');

// Variáveis de Jogo
let playerClass = null;
let cpuClass = null;
let currentPlayerTurn;
let gameActive = false;
let score = { player: 0, cpu: 0, ties: 0 };
let difficulty = 2; // Padrão: Médio


// --- FUNÇÕES DE PLACAR E LOCAL STORAGE ---
function loadScore() {
    try {
        const savedScore = localStorage.getItem('tictactoeScore');
        if (savedScore) score = JSON.parse(savedScore);
    } catch (e) {
        console.error("Erro ao carregar placar:", e);
    }
    updateScoreDisplay();
}

function saveScore() {
    try {
        localStorage.setItem('tictactoeScore', JSON.stringify(score));
    } catch (e) {
        console.error("Erro ao salvar placar:", e);
    }
}

function updateScoreDisplay() {
    scorePlayerSpan.textContent = score.player;
    scoreCpuSpan.textContent = score.cpu;
    scoreTiesSpan.textContent = score.ties;
}


// --- FUNÇÕES DE INICIALIZAÇÃO E SELEÇÃO ---
function handleSymbolSelection(selectedSymbol) {
    playerClass = selectedSymbol;
    cpuClass = selectedSymbol === X_CLASS ? O_CLASS : X_CLASS;

    selectXButton.classList.remove('selected');
    selectOButton.classList.remove('selected');
    document.querySelector(`[data-select-${selectedSymbol === X_CLASS ? 'x' : 'o'}]`).classList.add('selected');

    startGameButton.disabled = false;
    startGameButton.textContent = `Iniciar Jogo como ${playerClass.toUpperCase()}`;
    document.querySelector('.player-score h2').textContent = `Você (${playerClass.toUpperCase()})`;
    document.querySelector('.cpu-score h2').textContent = `CPU (${cpuClass.toUpperCase()})`;
}

function startGame() {
    if (!playerClass) return;

    // Lê o nível de dificuldade
    difficulty = parseInt(difficultySelect.value);

    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS, O_CLASS);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });

    startMessageElement.classList.add('hide-start-message');
    winningMessageElement.classList.remove('show-winning-message');
    gameActive = true;
    currentPlayerTurn = playerClass; // Jogador sempre começa
    setBoardHoverClass();

    if (currentPlayerTurn === cpuClass) {
        setTimeout(cpuMove, 500);
    }
}


// --- LÓGICA DO JOGO ---
function handleClick(e) {
    if (!gameActive || currentPlayerTurn === cpuClass) return;

    const cell = e.target;
    placeMark(cell, currentPlayerTurn);

    if (checkWin(currentPlayerTurn)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        if (currentPlayerTurn === cpuClass) {
            setTimeout(cpuMove, 500);
        }
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    currentPlayerTurn = currentPlayerTurn === X_CLASS ? O_CLASS : X_CLASS;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS, O_CLASS);
    board.classList.add(currentPlayerTurn);
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(comb => comb.every(i => cellElements[i].classList.contains(currentClass)));
}

function isDraw() {
    return [...cellElements].every(cell => cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS));
}

function endGame(draw) {
    gameActive = false;

    if (draw) {
        winningMessageTextElement.textContent = 'Empate!';
        score.ties++;
    } else {
        const winner = currentPlayerTurn === playerClass ? 'Você' : 'CPU';
        winningMessageTextElement.textContent = `${winner} Venceu!`;
        if (currentPlayerTurn === playerClass) score.player++;
        else score.cpu++;
    }

    saveScore();
    updateScoreDisplay();
    winningMessageElement.classList.add('show-winning-message');
}


// --- LÓGICA DA CPU COM NÍVEIS ---
function getAvailableMoves() {
    return [...cellElements]
        .map((cell, i) => ({ cell, index: i }))
        .filter(m => !m.cell.classList.contains(X_CLASS) && !m.cell.classList.contains(O_CLASS));
}

function cpuMove() {
    if (!gameActive || currentPlayerTurn !== cpuClass) return;

    const availableMoves = getAvailableMoves();
    let moveIndex = -1;

    // --- NÍVEL 1: ALEATÓRIO ---
    if (difficulty === 1) {
        const rand = Math.floor(Math.random() * availableMoves.length);
        moveIndex = availableMoves[rand].index;
    }

    // --- NÍVEL 2: MÉDIO (50% estratégia, 50% aleatório) ---
    else if (difficulty === 2) {
        if (Math.random() < 0.5) {
            // Usa estratégia completa (igual nível 3)
            moveIndex = getSmartMove(availableMoves);
        } else {
            // Aleatório
            const rand = Math.floor(Math.random() * availableMoves.length);
            moveIndex = availableMoves[rand].index;
        }
    }

    // --- NÍVEL 3: DIFÍCIL (IA completa) ---
    else if (difficulty === 3) {
        moveIndex = getSmartMove(availableMoves);
    }

    // Executa jogada
    if (moveIndex !== -1) {
        const cell = cellElements[moveIndex];
        cell.removeEventListener('click', handleClick);
        placeMark(cell, cpuClass);

        if (checkWin(cpuClass)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            setBoardHoverClass();
        }
    }
}

// Função auxiliar para IA inteligente (usada nos níveis 2 e 3)
function getSmartMove(availableMoves) {
    let bestIndex = -1;

    // 1. Vencer
    for (const move of availableMoves) {
        move.cell.classList.add(cpuClass);
        if (checkWin(cpuClass)) {
            move.cell.classList.remove(cpuClass);
            return move.index;
        }
        move.cell.classList.remove(cpuClass);
    }

    // 2. Bloquear
    for (const move of availableMoves) {
        move.cell.classList.add(playerClass);
        if (checkWin(playerClass)) {
            move.cell.classList.remove(playerClass);
            return move.index;
        }
        move.cell.classList.remove(playerClass);
    }

    // 3. Centro
    if (availableMoves.some(m => m.index === 4)) return 4;

    // 4. Cantos
    const corners = [0, 2, 6, 8];
    for (const c of corners) {
        if (availableMoves.some(m => m.index === c)) return c;
    }

    // 5. Qualquer
    return availableMoves[0].index;
}


// --- EVENT LISTENERS ---
selectXButton.addEventListener('click', () => handleSymbolSelection(X_CLASS));
selectOButton.addEventListener('click', () => handleSymbolSelection(O_CLASS));

startGameButton.addEventListener('click', () => {
    currentPlayerTurn = playerClass;
    startGame();
});

restartButton.addEventListener('click', () => {
    currentPlayerTurn = currentPlayerTurn === X_CLASS ? O_CLASS : X_CLASS;
    startGame();
});

// Carrega placar
loadScore();