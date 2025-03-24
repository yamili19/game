const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;
const INITIAL_SPEED = 5.5;
const MAX_SPEED = 12;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let computerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = INITIAL_SPEED;
let ballSpeedY = INITIAL_SPEED;
let playerScore = 0;
let computerScore = 0;
let playerSpeed = 0;
const MOVE_SPEED = 12;
const FRICTION = 0.8;

// Controles
document.addEventListener('keydown', (e) => {
    if (e.key === 'w') playerSpeed = -MOVE_SPEED;
    if (e.key === 's') playerSpeed = MOVE_SPEED;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 's') playerSpeed = 0;
});

function update() {
    // Movimiento del jugador
    playerY += playerSpeed;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));

    // IA de la computadora
    const computerCenter = computerY + PADDLE_HEIGHT / 2;
    const ballCenter = ballY + BALL_SIZE / 2;

    if (computerCenter < ballCenter - 35) computerY += 6;
    if (computerCenter > ballCenter + 35) computerY -= 6;
    computerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, computerY));

    // Movimiento de la pelota
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Rebotes en los bordes
    if (ballY < 0 || ballY > canvas.height - BALL_SIZE) {
        ballSpeedY *= -1;
    }

    // Colisiones con las paletas
    if (
        ballX <= PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballSpeedX = Math.abs(ballSpeedX);
    }

    if (
        ballX >= canvas.width - PADDLE_WIDTH - BALL_SIZE &&
        ballY + BALL_SIZE >= computerY &&
        ballY <= computerY + PADDLE_HEIGHT
    ) {
        ballSpeedX = -Math.abs(ballSpeedX);
    }

    // Puntuación
    if (ballX < 0) {
        computerScore++;
        resetBall();
    }
    if (ballX > canvas.width) {
        playerScore++;
        ballSpeedX *= 1.1;
        ballSpeedY *= 1.1;
        ballSpeedX = Math.min(MAX_SPEED, Math.max(-MAX_SPEED, ballSpeedX));
        ballSpeedY = Math.min(MAX_SPEED, Math.max(-MAX_SPEED, ballSpeedY));
        resetBall();
    }

    // Actualizar marcador
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;

    // Verificar ganador
    if (playerScore >= 5 || computerScore >= 5) {
        alert(playerScore >= 5 ? '¡Jugador Gana!' : '¡Computadora Gana!');
        resetGame();
    }
}

function draw() {
    // Limpiar canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar paletas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(canvas.width - PADDLE_WIDTH, computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Dibujar pelota
    ctx.fillStyle = 'red';
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    resetBall();
}

// Bucle del juego
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();