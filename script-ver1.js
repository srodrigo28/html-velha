const board = document.querySelector('[data-board]')
const cellElements = document.querySelectorAll('[data-cell]');
const restartGame = document.querySelector('[data-restart-game]');
const winningMessage = document.querySelector('[data-winning-message]')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')

let isCircleTurn;

// combinações array para vitórias
const winningCombinations = [
    // colunas e linhas
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // agora diagonais
    [0, 4, 8],
    [2, 4, 6],
]

const startGame = () => {    
    for (const cell of cellElements){
        cell.addEventListener("click", handleClick, { once: true });
    }
    isCircleTurn = false;
    board.classList.add('x'); // seleciona x ou circle para start
};

const endGame = (isDraw) => {
    if(isDraw){
        winningMessageTextElement.innerText = 'Empate!'
    }else{
        winningMessageTextElement.innerText = isCircleTurn 
            ? 'O Venceu!' 
            : 'X Venceu!';
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

const placeMark = (cell, classToAdd) => {
    cell.classList.add(classToAdd);

    board.classList.remove('circle')
    board.classList.remove('x')

    if(isCircleTurn){
        board.classList.add('circle')
    }else{
        board.classList.add('x')
    }
}

const swapTurns = () => {
    isCircleTurn = !isCircleTurn
};

const handleClick = (e) => {
    const cell = e.target;
    
    const classToAdd = isCircleTurn ? 'circle' : 'x';
    
    placeMark(cell, classToAdd);
    // marcar a celular com x ou circle
    
    // verificar se há um vencedor
    const isWin = checkForWin(classToAdd);
    if(isWin){
        endGame(false)

        // alert('Winner ' + classToAdd)
    }
    // verificar se há um empate

    // mudar o símbolo
    swapTurns();
};

startGame();

// Adiciona o evento de clique
restartGame.addEventListener('click', () => {
    location.reload(); // Recarrega a página inteira
});