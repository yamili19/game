const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mineCounter = document.getElementById("mineCounter");
const foundCounter = document.getElementById("foundCounter");
const winMessage = document.getElementById('winMessage');
const loseMessage = document.getElementById('loseMessage');
const playAgainWin = document.getElementById('playAgainWin');
const playAgainLose = document.getElementById('playAgainLose');

const ROWS = 10;
const COLS = 10;
const CELL_SIZE = 40;
const MINE_COUNT = 15;

let grid;
let revealed;
let flagged;
let mines;
let gameOver = false;
let flagsPlaced = 0;
let correctFlags = 0;

function initGame() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    mines = new Set();
    gameOver = false;
    flagsPlaced = 0;
    correctFlags = 0;

    mineCounter.textContent = `Minas totales: ${MINE_COUNT}`;
    foundCounter.textContent = `Minas encontradas: ${correctFlags}`;
    winMessage.style.display = 'none';
    loseMessage.style.display = 'none';

    // Generar minas
    while (mines.size < MINE_COUNT) {
        let row = Math.floor(Math.random() * ROWS);
        let col = Math.floor(Math.random() * COLS);
        if (!mines.has(`${row},${col}`)) {
            mines.add(`${row},${col}`);
            grid[row][col] = -1;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = row + dr, nc = col + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] !== -1) {
                        grid[nr][nc]++;
                    }
                }
            }
        }
    }
    drawBoard();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.fillStyle = revealed[row][col] ? "lightgray" : "darkgray";
            if (flagged[row][col]) ctx.fillStyle = "blue";
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            if (revealed[row][col]) {
                if (grid[row][col] === -1) {
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.arc(col * CELL_SIZE + 20, row * CELL_SIZE + 20, 10, 0, Math.PI * 2);
                    ctx.fill();
                } else if (grid[row][col] > 0) {
                    ctx.fillStyle = "black";
                    ctx.font = "20px Arial";
                    ctx.fillText(grid[row][col], col * CELL_SIZE + 15, row * CELL_SIZE + 25);
                }
            }

            if (flagged[row][col] && !revealed[row][col]) {
                ctx.fillStyle = "white";
                ctx.fillRect(col * CELL_SIZE + 15, row * CELL_SIZE + 10, 10, 20);
                ctx.fillStyle = "red";
                ctx.fillRect(col * CELL_SIZE + 12, row * CELL_SIZE + 5, 16, 5);
            }
        }
    }
}

function revealCell(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS ||
        revealed[row][col] || flagged[row][col] || gameOver) return;

    revealed[row][col] = true;

    if (grid[row][col] === -1) {
        gameOver = true;
        showGameOver(false);
        return;
    }

    if (grid[row][col] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                revealCell(row + dr, col + dc);
            }
        }
    }

    checkWin();
    drawBoard();
}

function toggleFlag(row, col) {
    if (revealed[row][col] || gameOver) return;

    flagged[row][col] = !flagged[row][col];
    flagsPlaced += flagged[row][col] ? 1 : -1;

    if (mines.has(`${row},${col}`)) {
        correctFlags += flagged[row][col] ? 1 : -1;
    }

    mineCounter.textContent = `Minas totales: ${MINE_COUNT}`;
    foundCounter.textContent = `Minas encontradas: ${correctFlags}`;

    checkWin();
    drawBoard();
}

function checkWin() {
    let revealedCount = 0;
    let correct = 0;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (revealed[row][col]) revealedCount++;
            if (flagged[row][col] && mines.has(`${row},${col}`)) correct++;
        }
    }

    if (correct === MINE_COUNT && flagsPlaced === MINE_COUNT ||
        revealedCount === (ROWS * COLS - MINE_COUNT)) {
        showGameOver(true);
    }
}

function showGameOver(won) {
    gameOver = true;
    if (won) {
        winMessage.style.display = 'block';
    } else {
        loseMessage.style.display = 'block';
    }
}

// Event listeners
canvas.addEventListener("click", (event) => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((event.clientY - rect.top) / CELL_SIZE);
    revealCell(row, col);
});

canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((event.clientY - rect.top) / CELL_SIZE);
    toggleFlag(row, col);
});

playAgainWin.addEventListener('click', () => {
    winMessage.style.display = 'none';
    initGame();
});

playAgainLose.addEventListener('click', () => {
    loseMessage.style.display = 'none';
    initGame();
});

// Inicializar juego
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;
initGame();