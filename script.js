const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const singleBtn = document.getElementById('singleBtn');
const multiBtn = document.getElementById('multiBtn');
const winLineCanvas = document.getElementById('winLine');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let singlePlayer = true; // Default mode: single player
let winCombo = null;

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diags
];

// SVGs for X and O
const xSVG = `<svg viewBox="0 0 54 54"><line x1="10" y1="10" x2="44" y2="44"/><line x1="44" y1="10" x2="10" y2="44"/></svg>`;
const oSVG = `<svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="17"/></svg>`;

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
    if (cell) cellDiv.classList.add('disabled');
    cellDiv.dataset.index = idx;
    cellDiv.addEventListener('click', handleCellClick);
    boardElement.appendChild(cellDiv);
  });
  drawWinLine();
}

function handleCellClick(e) {
  const idx = parseInt(e.currentTarget.dataset.index);
  if (!gameActive || board[idx]) return;

  board[idx] = currentPlayer;
  renderBoard();

  const winner = checkWinner(currentPlayer);
  if (winner) {
    winCombo = winner;
    statusElement.innerHTML = `<span style="color:#f08c7d;">${currentPlayer === 'O' && singlePlayer ? 'AI' : 'Player ' + currentPlayer}</span> wins! 🎉`;
    gameActive = false;
    drawWinLine();
    return;
  } else if (board.every(cell => cell)) {
    statusElement.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  if (singlePlayer) {
    currentPlayer = 'O';
    statusElement.textContent = "AI's turn...";
    setTimeout(() => {
      aiMove();
      currentPlayer = 'X';
      if (gameActive) statusElement.textContent = "Your turn (X)";
    }, 500);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function aiMove() {
  if (!gameActive) return;
  // Unbeatable AI: Minimax
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  board[move] = 'O';
  renderBoard();
  const winner = checkWinner('O');
  if (winner) {
    winCombo = winner;
    statusElement.innerHTML = `<span style="color:#f08c7d;">AI</span> wins! 🤖`;
    gameActive = false;
    drawWinLine();
  } else if (board.every(cell => cell)) {
    statusElement.textContent = "It's a draw!";
    gameActive = false;
  }
}

function minimax(newBoard, depth, isMaximizing) {
  const scores = { O: 10, X: -10, tie: 0 };
  const winner = checkWinner('O', newBoard) ? 'O'
              : checkWinner('X', newBoard) ? 'X'
              : newBoard.every(cell => cell) ? 'tie'
              : null;
  if (winner) return scores[winner];

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(player, customBoard = board) {
  for (let combo of winCombos) {
    if (combo.every(idx => customBoard[idx] === player)) return combo;
  }
  return null;
}

function resetGame() {
  board = Array(9).fill('');
  currentPlayer = singlePlayer ? 'X' : 'X';
  gameActive = true;
  winCombo = null;
  renderBoard();
  statusElement.textContent = singlePlayer
    ? "Your turn (X)"
    : "Player X's turn";
}

singleBtn.onclick = () => {
  singlePlayer = true;
  singleBtn.classList.add('active');
  multiBtn.classList.remove('active');
  resetGame();
};

multiBtn.onclick = () => {
  singlePlayer = false;
  multiBtn.classList.add('active');
  singleBtn.classList.remove('active');
  resetGame();
};

resetBtn.onclick = resetGame;

// Draw animated win line
function drawWinLine() {
  const canvas = winLineCanvas;
  const boardRect = boardElement.getBoundingClientRect();
  canvas.width = boardRect.width;
  canvas.height = boardRect.height;
  canvas.style.width = boardRect.width + 'px';
  canvas.style.height = boardRect.height + 'px';
  canvas.style.left = boardRect.left - boardElement.offsetLeft + 'px';
  canvas.style.top = boardRect.top - boardElement.offsetTop + 'px';

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!winCombo) return;

  // Calculate cell centers
  const getCellCenter = idx => {
    const row = Math.floor(idx / 3), col = idx % 3;
    const cellSize = boardRect.width / 3;
    return {
      x: col * cellSize + cellSize / 2,
      y: row * cellSize + cellSize / 2
    };
  };
  const start = getCellCenter(winCombo[0]);
  const end = getCellCenter(winCombo[2]);

  // Animate line
  let progress = 0;
  let anim;
  function animateLine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#f08c7d";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(
      start.x + (end.x - start.x) * progress,
      start.y + (end.y - start.y) * progress
    );
    ctx.stroke();
    if (progress < 1) {
      progress += 0.06;
      anim = requestAnimationFrame(animateLine);
    } else {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      cancelAnimationFrame(anim);
    }
  }
  animateLine();
}

// Responsive: redraw win line on resize
window.addEventListener('resize', drawWinLine);

// Initial render
resetGame();
