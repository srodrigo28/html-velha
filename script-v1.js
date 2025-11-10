// --- CONSTANTES E VARIÁVEIS DE ESTADO ---
const X_CLASS = 'x';
const O_CLASS = 'circle';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]            // Diagonais
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

// Elementos do Placar
const scorePlayerSpan = document.querySelector('[data-score-player]');
const scoreCpuSpan = document.querySelector('[data-score-cpu]');
const scoreTiesSpan = document.querySelector('[data-score-ties]');

// Variáveis de Jogo
let playerClass = null;   // Símbolo do jogador humano ('x' ou 'circle')
let cpuClass = null;      // Símbolo da CPU
let currentPlayerTurn;    // Turno atual ('x' ou 'circle')
let gameActive = false;   // Indica se o jogo está em andamento
let score = { player: 0, cpu: 0, ties: 0 }; // Placar


// --- FUNÇÕES DE PLACAR E LOCAL STORAGE ---

function loadScore() {
    try {
        const savedScore = localStorage.getItem('tictactoeScore');
        if (savedScore) {
            score = JSON.parse(savedScore);
        }
    } catch (e) {
        console.error("Erro ao carregar placar do localStorage:", e);
    }
    updateScoreDisplay();
}

function saveScore() {
    try {
        localStorage.setItem('tictactoeScore', JSON.stringify(score));
    } catch (e) {
        console.error("Erro ao salvar placar no localStorage:", e);
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
    cpuClass = (selectedSymbol === X_CLASS) ? O_CLASS : X_CLASS;

    // Remove a classe 'selected' e adiciona no botão correto
    selectXButton.classList.remove('selected');
    selectOButton.classList.remove('selected');
    
    document.querySelector(`[data-select-${selectedSymbol === X_CLASS ? 'x' : 'o'}]`).classList.add('selected');

    // Habilita o botão de iniciar
    startGameButton.disabled = false;
    startGameButton.textContent = `Iniciar Jogo como ${playerClass.toUpperCase()}`;

    // Atualiza os cabeçalhos do placar
    document.querySelector('.player-score h2').textContent = `Você (${playerClass.toUpperCase()})`;
    document.querySelector('.cpu-score h2').textContent = `CPU (${cpuClass.toUpperCase()})`;
}

function startGame() {
    if (!playerClass) return;

    // 1. Limpa o tabuleiro e adiciona o evento de clique
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.removeEventListener('click', handleClick);
        // Garante que o clique só funcione uma vez
        cell.addEventListener('click', handleClick, { once: true });
    });

    // 2. Esconde mensagens e ativa o jogo
    startMessageElement.classList.add('hide-start-message');
    winningMessageElement.classList.remove('show-winning-message');
    gameActive = true;
    
    // 3. Define a classe hover do tabuleiro (para o símbolo correto)
    setBoardHoverClass();

    // 4. Se a CPU começar, faz a jogada inicial
    if (currentPlayerTurn === cpuClass) {
        setTimeout(cpuMove, 500);
    }
}


// --- LÓGICA DO JOGO ---

function handleClick(e) {
    // Ignora se o jogo não estiver ativo ou se não for o turno do jogador
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
        
        // Se for o turno da CPU, executa a jogada
        if (currentPlayerTurn === cpuClass) {
            setTimeout(cpuMove, 500);
        }
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    // Alterna entre 'x' e 'circle'
    currentPlayerTurn = (currentPlayerTurn === X_CLASS) ? O_CLASS : X_CLASS;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    board.classList.add(currentPlayerTurn);
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        // Verifica se TODAS as células da combinação contêm a classe atual
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

function isDraw() {
    // Verifica se TODAS as células contêm 'x' OU 'circle'
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function endGame(draw) {
    gameActive = false;
    
    if (draw) {
        winningMessageTextElement.textContent = 'Empate!';
        score.ties++;
    } else {
        const winner = (currentPlayerTurn === playerClass) ? 'Você' : 'CPU';
        winningMessageTextElement.textContent = `${winner} Venceu!`;
        
        if (currentPlayerTurn === playerClass) {
            score.player++;
        } else {
            score.cpu++;
        }
    }

    saveScore();
    updateScoreDisplay();
    winningMessageElement.classList.add('show-winning-message');
}


// --- LÓGICA DA CPU (IA SIMPLES) ---

function getAvailableMoves() {
    return [...cellElements]
        .map((cell, index) => ({ cell, index }))
        .filter(move => !move.cell.classList.contains(X_CLASS) && !move.cell.classList.contains(O_CLASS));
}

function cpuMove() {
    if (!gameActive || currentPlayerTurn !== cpuClass) return;

    const availableMoves = getAvailableMoves();
    let bestMoveIndex = -1;

    // 1. Prioridade: Vencer o jogo (Ataque)
    for (const move of availableMoves) {
        move.cell.classList.add(cpuClass);
        if (checkWin(cpuClass)) {
            bestMoveIndex = move.index;
            move.cell.classList.remove(cpuClass); // Desfaz a jogada virtual
            break;
        }
        move.cell.classList.remove(cpuClass); // Desfaz a jogada virtual
    }

    // 2. Prioridade: Bloquear o jogador (Defesa)
    if (bestMoveIndex === -1) {
        for (const move of availableMoves) {
            move.cell.classList.add(playerClass);
            if (checkWin(playerClass)) {
                bestMoveIndex = move.index;
                move.cell.classList.remove(playerClass); // Desfaz a jogada virtual
                break; 
            }
            move.cell.classList.remove(playerClass); // Desfaz a jogada virtual
        }
    }
    
    // 3. Prioridade: Pegar o Centro (Índice 4)
    if (bestMoveIndex === -1 && availableMoves.some(move => move.index === 4)) {
        bestMoveIndex = 4;
    }

    // 4. Prioridade: Pegar um Canto (0, 2, 6, 8)
    const corners = [0, 2, 6, 8];
    if (bestMoveIndex === -1) {
        for (const index of corners) {
            if (availableMoves.some(move => move.index === index)) {
                bestMoveIndex = index;
                break;
            }
        }
    }

    // 5. Reserva: Pegar qualquer movimento disponível (Random)
    if (bestMoveIndex === -1 && availableMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        bestMoveIndex = availableMoves[randomIndex].index;
    }

    // Executa o movimento da CPU
    if (bestMoveIndex !== -1) {
        const cell = cellElements[bestMoveIndex];
        
        // Garante que a CPU não clique em uma célula já marcada
        cell.removeEventListener('click', handleClick); 
        
        placeMark(cell, cpuClass);
        
        // Verifica o estado do jogo após a jogada da CPU
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


// --- EVENT LISTENERS E INICIALIZAÇÃO ---

// Seleção de Símbolo
selectXButton.addEventListener('click', () => handleSymbolSelection(X_CLASS));
selectOButton.addEventListener('click', () => handleSymbolSelection(O_CLASS));

// Botão Iniciar Jogo
startGameButton.addEventListener('click', () => {
    // Define o símbolo do jogador como o primeiro a jogar na primeira rodada
    currentPlayerTurn = playerClass; 
    startGame();
});

// Botão Reiniciar Jogo (após vitória/empate)
restartButton.addEventListener('click', () => {
    // Alterna quem começa para a próxima rodada (para variar o jogo)
    currentPlayerTurn = (currentPlayerTurn === X_CLASS) ? O_CLASS : X_CLASS;
    startGame();
});

// Inicializa o placar ao carregar a página
loadScore();