const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;
let score = 0;
let isGameOver = false;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

// Crear el tablero
const board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPieceIndex = 0; // Nueva variable para guardar el índice de la pieza
let piece = null;
// Piezas del Tetris
const PIECES = [
    {
        shape: [[1, 1, 1, 1]], // I
        color: '#FF0D72'
    },
    {
        shape: [[1, 1], [1, 1]], // O
        color: '#0DC2FF'
    },
    {
        shape: [[1, 1, 1], [0, 1, 0]], // T
        color: '#0DFF72'
    },
    {
        shape: [[1, 1, 1], [1, 0, 0]], // L
        color: '#F538FF'
    },
    {
        shape: [[1, 1, 1], [0, 0, 1]], // J
        color: '#FF8E0D'
    },
    {
        shape: [[1, 1, 0], [0, 1, 1]], // S
        color: '#FFE138'
    },
    {
        shape: [[0, 1, 1], [1, 1, 0]], // Z
        color: '#3877FF'
    }
];
let piecePos = {x: 0, y: 0};

// Crear nueva pieza
function createPiece() {
    const index = Math.floor(Math.random() * PIECES.length);
    const newPiece = PIECES[index].shape;
    piece = newPiece;
    currentPieceIndex = index; // Guardamos el índice original
    piecePos.y = 0;
    piecePos.x = Math.floor((BOARD_WIDTH - newPiece[0].length) / 2);

    if (collision()) {
        gameOver();
    }
}

// Dibujar el tablero
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = PIECES[value - 1].color;
                context.fillRect(x, y, 1, 1);
            }
        });
    });

    if (piece) {
        context.fillStyle = PIECES[currentPieceIndex].color;
        piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillRect(
                        x + piecePos.x,
                        y + piecePos.y,
                        1, 1
                    );
                }
            });
        });
    }
}
// Detectar colisiones
function collision() {
    return piece.some((row, dy) => {
        return row.some((value, dx) => {
            if (!value) return false;
            const newX = piecePos.x + dx;
            const newY = piecePos.y + dy;
            return (
                newX < 0 ||
                newX >= BOARD_WIDTH ||
                newY >= BOARD_HEIGHT ||
                (newY >= 0 && board[newY][newX])
            );
        });
    });
}

// Fusionar la pieza con el tablero
function merge() {
    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                if (piecePos.y + y < 0) return;
                board[piecePos.y + y][piecePos.x + x] = currentPieceIndex + 1;
            }
        });
    });
}

// Rotar la pieza
function rotate() {
    const rotated = piece[0].map((_, i) =>
        piece.map(row => row[i]).reverse()
    );
    const prevPiece = piece;
    piece = rotated;
    if (collision()) {
        piece = prevPiece;
    }
}

// Limpiar líneas completas
function clearLines() {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }

    if (linesCleared) {
        score += linesCleared * 100;
        scoreElement.textContent = `Puntuación: ${score}`;
    }
}

// Game Over
function gameOver() {
    isGameOver = true;
    gameOverElement.style.display = 'block';
}

// Reiniciar el juego
function resetGame() {
    board.forEach(row => row.fill(0));
    score = 0;
    scoreElement.textContent = `Puntuación: ${score}`;
    gameOverElement.style.display = 'none';
    isGameOver = false;
    createPiece();
}

// Mover pieza
function moveDown() {
    piecePos.y++;
    if (collision()) {
        piecePos.y--;
        merge();
        clearLines();
        createPiece();
    }
}

// Manejar teclado
function handleKeyPress(event) {
    if (isGameOver) {
        if (event.key === 'Enter') {
            resetGame();
        }
        return;
    }

    if (event.key === 'ArrowLeft') {
        piecePos.x--;
        if (collision()) piecePos.x++;
    }
    if (event.key === 'ArrowRight') {
        piecePos.x++;
        if (collision()) piecePos.x--;
    }
    if (event.key === 'ArrowDown') {
        moveDown();
    }
    if (event.key === 'ArrowUp') {
        rotate();
    }
}

// Bucle del juego
function update() {
    draw();
    requestAnimationFrame(update);
}

// Inicializar
document.addEventListener('keydown', handleKeyPress);
createPiece();
setInterval(moveDown, 1000);
update();