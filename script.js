const board = document.querySelector('[data-board]');
const cellElements = document.querySelectorAll('[data-cell]');
const restartGame = document.querySelector('[data-restart-game]');
const winningMessage = document.querySelector('[data-winning-message]');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');

let isCircleTurn = false;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
    [0, 4, 8], [2, 4, 6]             // diagonais
];

const startGame = () => {
    isCircleTurn = false;
    board.classList.remove('circle');
    board.classList.add('x');

    cellElements.forEach(cell => {
        cell.classList.remove('x', 'circle');
        cell.removeEventListener('click', handleClick); // remove eventos antigos
        cell.addEventListener('click', handleClick, { once: true });
    });

    winningMessage.classList.remove('show-winning-message');
};

const endGame = (isDraw) => {
    if (isDraw) {
        winningMessageTextElement.innerText = 'Empate!';
    } else {
        winningMessageTextElement.innerText = isCircleTurn ? 'O Venceu!' : 'X Venceu!';
    }
    winningMessage.classList.add('show-winning-message');
};

const checkForWin = (currentPlayer) => {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentPlayer);
        });
    });
};

const checkForDraw = () => {
    return [...cellElements].every(cell => {
        return cell.classList.contains('x') || cell.classList.contains('circle');
    });
};

const placeMark = (cell, classToAdd) => {
    cell.classList.add(classToAdd);
};

const swapTurns = () => {
    isCircleTurn = !isCircleTurn;
    
    board.classList.remove('x', 'circle');
    board.classList.add(isCircleTurn ? 'circle' : 'x');
};

const handleClick = (e) => {
    const cell = e.target;
    const currentClass = isCircleTurn ? 'circle' : 'x';

    // Coloca a marca
    placeMark(cell, currentClass);

    // Verifica vitória
    if (checkForWin(currentClass)) {
        endGame(false);
        return;
    }

    // Verifica empate
    if (checkForDraw()) {
        endGame(true);
        return;
    }

    // Troca o turno
    swapTurns();
};

// Inicia o jogo
startGame();

// Botão de reiniciar
restartGame.addEventListener('click', startGame); // melhor que location.reload()