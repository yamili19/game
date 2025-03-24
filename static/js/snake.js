let snake;
let direction;
let food;
let obstacles;
let startTime;
let lastObstacleTime;
let lastGrowthTime;
let obstacleInterval = 5000;
let growthInterval = 7000;
const CELL_SIZE = 20;
const WIDTH = 600;
const HEIGHT = 400;
let canvas, ctx;

let gameInterval; // Variable global para el intervalo del juego

window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    startGame();
};

function startGame() {
    resetGame();
    document.addEventListener("keydown", keyPressed);

    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(gameLoop, 100);
}



function resetGame() {
    snake = [{ x: 100, y: 100 }, { x: 80, y: 100 }, { x: 60, y: 100 }];
    direction = { x: CELL_SIZE, y: 0 };
    obstacles = [];
    food = generateFoodOrObstacle();
    startTime = Date.now();
    lastObstacleTime = startTime;
    lastGrowthTime = startTime;
}

function generateFoodOrObstacle() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * (WIDTH / CELL_SIZE)) * CELL_SIZE,
            y: Math.floor(Math.random() * (HEIGHT / CELL_SIZE)) * CELL_SIZE
        };
    } while (isOccupied(position));
    return position;
}

function isOccupied(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y) ||
           obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y);
}

function gameLoop() {
    let currentTime = Date.now();
    let elapsedTime = Math.floor((currentTime - startTime) / 1000);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "yellow";
    ctx.font = "16px Arial";
    ctx.fillText(`Tiempo: ${elapsedTime}s`, 10, 20);
    
    if (currentTime - lastObstacleTime > obstacleInterval) {
        if (obstacles.length < 15) {
            for (let i = 0; i < 3; i++) {
                obstacles.push(generateFoodOrObstacle());
            }
        }
        lastObstacleTime = currentTime;
        obstacleInterval = Math.max(3000, obstacleInterval - 500);
    }
    
    if (currentTime - lastGrowthTime > growthInterval) {
        snake.push({ ...snake[snake.length - 1] });
        lastGrowthTime = currentTime;
        growthInterval = Math.max(4000, growthInterval - 1000);
    }
    
    moveSnake();
    checkCollisions();
    drawElements();
}

function moveSnake() {
    let newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
        food = generateFoodOrObstacle();
        snake.push({ ...snake[snake.length - 1] });
    } else {
        snake.pop();
    }
}

function checkCollisions() {
    let head = snake[0];
    if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y) ||
        obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {

        ctx.fillStyle = "red";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Lose", WIDTH / 2, HEIGHT / 2);

        clearInterval(gameInterval); // Ahora sí se detiene el bucle del juego

        setTimeout(startGame, 2000); // Reinicia el juego después de 2 segundos
    }
}


function drawElements() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, CELL_SIZE, CELL_SIZE);
    
    ctx.fillStyle = "green";
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, CELL_SIZE, CELL_SIZE));
    
    ctx.fillStyle = "white";
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, CELL_SIZE, CELL_SIZE));
}

function keyPressed(event) {
    if (event.key === "ArrowUp" && direction.y === 0) {
        direction = { x: 0, y: -CELL_SIZE };
    } else if (event.key === "ArrowDown" && direction.y === 0) {
        direction = { x: 0, y: CELL_SIZE };
    } else if (event.key === "ArrowLeft" && direction.x === 0) {
        direction = { x: -CELL_SIZE, y: 0 };
    } else if (event.key === "ArrowRight" && direction.x === 0) {
        direction = { x: CELL_SIZE, y: 0 };
    }
}