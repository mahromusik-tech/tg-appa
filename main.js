const SIZE = 4;

let grid = [];
let score = 0;
let bestScore = 0;
let xp = 0;

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const xpEl = document.getElementById('xp');
const gridEl = document.getElementById('grid');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');

const newGameBtn = document.getElementById('new-game');
const tryAgainBtn = document.getElementById('try-again');
const shopBtn = document.getElementById('shop-btn');
const shopModal = document.getElementById('shop-modal');
const closeShopBtn = document.getElementById('close-shop');

// ====== LocalStorage helpers ======
function loadProgress() {
  bestScore = parseInt(localStorage.getItem('bestScore2048') || '0', 10);
  xp = parseInt(localStorage.getItem('xp2048') || '0', 10);
  bestEl.textContent = bestScore;
  xpEl.textContent = xp;
}

function saveProgress() {
  localStorage.setItem('bestScore2048', String(bestScore));
  localStorage.setItem('xp2048', String(xp));
}

// ====== Game logic ======
function initGrid() {
  grid = [];
  for (let r = 0; r < SIZE; r++) {
    const row = [];
    for (let c = 0; c < SIZE; c++) {
      row.push(0);
    }
    grid.push(row);
  }
}

function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function startGame() {
  score = 0;
  updateScore(0);
  initGrid();
  addRandomTile();
  addRandomTile();
  renderGrid();
  hideOverlay();
}

function updateScore(delta) {
  score += delta;
  scoreEl.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    bestEl.textContent = bestScore;
  }
}

// XP: добавляем в конце игры равным набранным очкам
function addXp(amount) {
  xp += amount;
  xpEl.textContent = xp;
  saveProgress();
}

// ====== Rendering ======
function renderGrid() {
  gridEl.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = grid[r][c];
      const tile = document.createElement('div');
      tile.classList.add('tile');
      if (value === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = value;
        tile.classList.add(`tile-${value}`);
      }
      gridEl.appendChild(tile);
    }
  }
}

// ====== Moves ======
function slideRowLeft(row) {
  const filtered = row.filter(v => v !== 0);
  const merged = [];
  let scoreGain = 0;

  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const newVal = filtered[i] * 2;
      merged.push(newVal);
      scoreGain += newVal;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  return { row: merged, scoreGain };
}

function rotateGridClockwise(g) {
  const newGrid = [];
  for (let c = 0; c < SIZE; c++) {
    const newRow = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      newRow.push(g[r][c]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

function rotateGridCounterClockwise(g) {
  let newGrid = [];
  for (let c = SIZE - 1; c >= 0; c--) {
    const newRow = [];
    for (let r = 0; r < SIZE; r++) {
      newRow.push(g[r][c]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

function moveLeft() {
  let moved = false;
  let totalGain = 0;
for (let r = 0; r < SIZE; r++) {
      newRow.push(g[r][c]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

function moveLeft() {
  let moved = false;
  let totalGain = 0;

  for (let r = 0; r < SIZE; r++) {
    const { row: newRow, scoreGain } = slideRowLeft(grid[r]);
    if (!arraysEqual(newRow, grid[r])) {
      moved = true;
      grid[r] = newRow;
    }
    totalGain += scoreGain;
  }

  if (moved) {
    updateScore(totalGain);
    addRandomTile();
    renderGrid();
    checkGameState();
  }
}

function moveRight() {
  grid = grid.map(row => row.reverse());
  moveLeft();
  grid = grid.map(row => row.reverse());
}

function moveUp() {
  grid = rotateGridCounterClockwise(grid);
  moveLeft();
  grid = rotateGridClockwise(grid);
}

function moveDown() {
  grid = rotateGridClockwise(grid);
  moveLeft();
  grid = rotateGridCounterClockwise(grid);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ====== Game state ======
function hasMoves() {
  // Есть пустые клетки
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
    }
  }
  // Есть возможные слияния
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if (r < SIZE - 1 && grid[r + 1][c] === v) return true;
      if (c < SIZE - 1 && grid[r][c + 1] === v) return true;
    }
  }
  return false;
}

function has2048() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 2048) return true;
    }
  }
  return false;
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function checkGameState() {
  if (has2048()) {
    addXp(score);
    saveProgress();
    showOverlay('You win!', `Score: ${score}\nXP +${score}`);
    return;
  }

  if (!hasMoves()) {
    addXp(score);
    saveProgress();
    showOverlay('Game Over', `Score: ${score}\nXP +${score}`);
  }
}

// ====== Input: keyboard ======
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      moveLeft();
      break;
    case 'ArrowRight':
      e.preventDefault();
      moveRight();
      break;
    case 'ArrowUp':
      e.preventDefault();
      moveUp();
      break;
    case 'ArrowDown':
      e.preventDefault();
      moveDown();
      break;
  }
});

// ====== Input: touch (swipes) ======
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const MIN_SWIPE = 30; // px

gridEl.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

gridEl.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
});

gridEl.addEventListener('touchend', () => {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    // горизонтальный свайп
    if (dx > 0) moveRight();
    else moveLeft();
  } else {
    // вертикальный свайп
    if (dy > 0) moveDown();
    else moveUp();
  }
});

// ====== UI buttons ======
newGameBtn.addEventListener('click', startGame);
tryAgainBtn.addEventListener('click', startGame);

shopBtn.addEventListener('click', () => {
  shopModal.classList.remove('hidden');
});

closeShopBtn.addEventListener('click', () => {
  shopModal.classList.add('hidden');
});

// ====== Telegram Mini App integration (пример) ======
// Если используешь Telegram WebApp API, можешь инициализировать так:
// window.Telegram?.WebApp?.ready();
// И, например, менять цвет темы под Telegram.

// ====== Init ======
loadProgress();
startGame();
