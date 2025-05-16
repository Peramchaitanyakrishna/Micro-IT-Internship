const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;

// SVGs for X and O (thick, rounded, matching the image)
const xSVG = `<svg viewBox="0 0 64 64"><line x1="12" y1="12" x2="52" y2="52"/><line x1="52" y1="12" x2="12" y2="52"/></svg>`;
const oSVG = `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20"/></svg>`;

const winCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function renderBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, idx) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    if (cell === 'X') {
      cellDiv.classList.add('x');
      cellDiv.innerHTML = xSVG;
    } else if (cell === 'O') {
      cellDiv.classList.add('o');
      cellDiv.innerHTML = oSVG;
    }
    cellDiv.dataset.index = idx;
    cellDiv.addEventListener('click', handleCellClick);
    boardElement.appendChild(cellDiv);
  });
}

function handleCellClick(e) {
  const idx = e.currentTarget.dataset.index;
  if (!gameActive || board[idx]) return;
  board[idx] = currentPlayer;
  renderBoard();
  if (checkWinner()) {
    statusElement.textContent = `Player ${currentPlayer} wins! 🎉`;
    gameActive = false;
  } else if (board.every(cell => cell)) {
    statusElement.textContent = "It's a draw!";
    gameActive = false;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function checkWinner() {
  return winCombos.some(combo =>
    combo.every(idx => board[idx] === currentPlayer)
  );
}

function resetGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusElement.textContent = `Player ${currentPlayer}'s turn`;
  renderBoard();
}

resetBtn.addEventListener('click', resetGame);

resetGame();
