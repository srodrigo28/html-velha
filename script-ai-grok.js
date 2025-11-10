// script.js - Jogo da Velha vs CPU (IA invencível)

document.addEventListener('DOMContentLoaded', () => {
    // ==================== ELEMENTOS DO DOM ====================
    const board = document.querySelector('[data-board]');
    const cells = document.querySelectorAll('[data-cell]');
    const winningMessage = document.querySelector('[data-winning-message]');
    const winningMessageText = document.querySelector('[data-winning-message-text]');
    const restartButton = document.querySelector('[data-restart-game]');

    const startMessage = document.querySelector('[data-start-message]');
    const selectXBtn = document.querySelector('[data-select-x]');
    const selectOBtn = document.querySelector('[data-select-o]');
    const startGameBtn = document.querySelector('[data-start-game]');
    const selectionContainer = document.querySelector('[data-selection-container]');

    const playerScoreEl = document.querySelector('[data-score-player]');
    const cpuScoreEl = document.querySelector('[data-score-cpu]');
    const tiesScoreEl = document.querySelector('[data-score-ties]');

    // ==================== VARIÁVEIS DE ESTADO ====================
    let playerSymbol = null;      // 'x' ou 'circle'
    let cpuSymbol = null;
    let currentTurn = 'x';        // quem começa (sempre X)
    let gameBoard = ['', '', '', '', '', '', '', '', '']; // estado do tabuleiro
    let gameActive = false;

    // Placar (persistido no localStorage)
    let scores = {
        player: 0,
        cpu: 0,
        ties: 0
    };

    // ==================== CARREGAR PLACAR SALVO ====================
    const loadScores = () => {
        const saved = localStorage.getItem('tictactoe-scores');
        if (saved) {
            scores = JSON.parse(saved);
            updateScoreDisplay();
        }
    };

    const saveScores = () => {
        localStorage.setItem('tictactoe-scores', JSON.stringify(scores));
    };

    const updateScoreDisplay = () => {
        playerScoreEl.textContent = scores.player;
        cpuScoreEl.textContent = scores.cpu;
        tiesScoreEl.textContent = scores.ties;
    };

    // ==================== COMBINAÇÕES VENCEDORAS ====================
    const WINNING_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
        [0, 4, 8], [2, 4, 6]             // diagonais
    ];

    // ==================== VERIFICAR VENCEDOR ====================
    const checkWinner = (symbol) => {
        return WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => gameBoard[index] === symbol);
        });
    };

    const checkDraw = () => {
        return gameBoard.every(cell => cell !== '');
    };

    // ==================== FINALIZAR JOGO ====================
    const endGame = (winner) => {
        gameActive = false;

        if (winner === 'draw') {
            winningMessageText.textContent = 'Empate!';
            scores.ties++;
        } else if (winner === playerSymbol) {
            winningMessageText.textContent = 'Você Venceu!';
            scores.player++;
        } else {
            winningMessageText.textContent = 'CPU Venceu!';
            scores.cpu++;
        }

        saveScores();
        updateScoreDisplay();
        winningMessage.classList.add('show-winning-message');
    };

    // ==================== IA (MINIMAX) - INVENCÍVEL ====================
    const minimax = (board, depth, isMaximizing) => {
        // Verifica terminal states
        if (checkWinner(cpuSymbol)) return 10 - depth;
        if (checkWinner(playerSymbol)) return depth - 10;
        if (checkDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = cpuSymbol;
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = playerSymbol;
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const bestMove = () => {
        let bestScore = -Infinity;
        let move = null;

        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '') {
                gameBoard[i] = cpuSymbol;
                let score = minimax(gameBoard, 0, false);
                gameBoard[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    };

    // ==================== JOGADA DA CPU ====================
    const cpuPlay = () => {
        if (!gameActive) return;

        setTimeout(() => {
            const move = bestMove();
            if (move !== null) {
                gameBoard[move] = cpuSymbol;
                cells[move].classList.add(cpuSymbol);
                if (checkWinner(cpuSymbol)) {
                    endGame(cpuSymbol);
                } else if (checkDraw()) {
                    endGame('draw');
                } else {
                    currentTurn = playerSymbol;
                    board.classList.remove('circle');
                    board.classList.add('x');
                }
            }
        }, 600); // delay natural
    };

    // ==================== JOGADA DO JOGADOR ====================
    const handleCellClick = (e) => {
        const cell = e.target;
        const index = Array.from(cells).indexOf(cell);

        if (gameBoard[index] !== '' || !gameActive || currentTurn !== playerSymbol) return;

        // Marca jogada
        gameBoard[index] = playerSymbol;
        cell.classList.add(playerSymbol);

        // Verifica vitória ou empate
        if (checkWinner(playerSymbol)) {
            endGame(playerSymbol);
            return;
        }
        if (checkDraw()) {
            endGame('draw');
            return;
        }

        // Passa a vez para CPU
        currentTurn = cpuSymbol;
        board.classList.remove('x');
        board.classList.add('circle');
        cpuPlay();
    };

    // ==================== INICIAR JOGO ====================
    const startNewGame = () => {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentTurn = 'x'; // X sempre começa

        cells.forEach(cell => {
            cell.classList.remove('x', 'circle');
        });

        board.classList.remove('x', 'circle');
        board.classList.add('x');

        winningMessage.classList.remove('show-winning-message');
        startMessage.classList.add('hide-start-message');

        // Se CPU for X, joga primeiro
        if (cpuSymbol === 'x') {
            cpuPlay();
        }
    };

    // ==================== SELEÇÃO DE SÍMBOLO ====================
    const selectSymbol = (symbol) => {
        playerSymbol = symbol;
        cpuSymbol = symbol === 'x' ? 'circle' : 'x';

        // Atualiza visual dos botões
        selectXBtn.classList.toggle('selected', symbol === 'x');
        selectOBtn.classList.toggle('selected', symbol === 'circle');

        // Atualiza texto do placar
        document.querySelector('.player-score h2').textContent = `Você (${symbol.toUpperCase()})`;
        document.querySelector('.cpu-score h2').textContent = `CPU (${cpuSymbol.toUpperCase()})`;

        startGameBtn.disabled = false;
    };

    // ==================== EVENT LISTENERS ====================
    selectXBtn.addEventListener('click', () => selectSymbol('x'));
    selectOBtn.addEventListener('click', () => selectSymbol('circle'));

    startGameBtn.addEventListener('click', () => {
        if (playerSymbol) startNewGame();
    });

    restartButton.addEventListener('click', startNewGame);

    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Botão de reiniciar placar (opcional - clique duplo no título)
    document.querySelector('.titulo').addEventListener('dblclick', () => {
        if (confirm('Zerar todo o placar?')) {
            scores = { player: 0, cpu: 0, ties: 0 };
            saveScores();
            updateScoreDisplay();
        }
    });

    // ==================== INICIALIZAÇÃO ====================
    loadScores();

    // Garante que a tela inicial esteja visível
    startMessage.classList.remove('hide-start-message');
    winningMessage.classList.remove('show-winning-message');
});