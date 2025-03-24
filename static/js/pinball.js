const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.1; // Gravedad reducida
const DAMPING = 0.9; // Amortiguamiento aumentado
const FLIPPER_POWER = 20; // Fuerza de los flippers reducida
const FLIPPER_LENGTH = 80;
const FLIPPER_HEIGHT = 10;
const BUMPER_BOOST = 1.5; // Aumento de velocidad al chocar con un bumper
const MAX_BALL_SPEED = 8; // Velocidad máxima de la bola reducida
const WALL_WIDTH = 10;

const leftWall = {
    start: { x: 120, y: canvas.height - 50 },
    end: { x: 0, y: 0 } // Se calculará dinámicamente
};

const rightWall = {
    start: { x: 380, y: canvas.height - 50 },
    end: { x: canvas.width, y: 0 } // Se calculará dinámicamente
};

// Bola
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    radius: 10,
    dx: 1 + Math.random() * 2, // Velocidad inicial aleatoria
    dy: -3, // Velocidad vertical inicial reducida
    color: "white"
};

// Flippers con el punto de giro en el lado externo
let leftFlipper = {
    x: 120, // Punto de giro externo (lado izquierdo)
    y: canvas.height - 50,
    angle: 20
};

let rightFlipper = {
    x: 380, // Punto de giro externo (lado derecho)
    y: canvas.height - 50,
    angle: -20
};

// Bumpers
let bumpers = [
    { x: 150, y: 200, radius: 20, color: "red" },
    { x: 250, y: 150, radius: 20, color: "blue" },
    { x: 350, y: 200, radius: 20, color: "yellow" }
];


// Teclado
let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function calculateWalls() {
    // Ajustar posición inicial para compensar el grosor
    const offset = WALL_WIDTH / 2;

    // Pared izquierda (ángulo 20°)
    const leftAngle = 20 * Math.PI / 180;
    leftWall.start.x = 120 + offset; // Compensar posición inicial
    leftWall.end.x = leftWall.start.x - (leftWall.start.y / Math.tan(leftAngle));

    // Pared derecha (ángulo -20°)
    const rightAngle = -20 * Math.PI / 180;
    rightWall.start.x = 380 - offset; // Compensar posición inicial
    rightWall.end.x = rightWall.start.x - (rightWall.start.y / Math.tan(rightAngle));
}

calculateWalls()

function update() {
    // Movimiento de la bola
    ball.dy += GRAVITY;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Rebote en paredes laterales
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx *= -DAMPING;
    }

    // Rebote en el techo
    if (ball.y - ball.radius < 0) {
        ball.dy *= -DAMPING;
    }

    // Verificar colisión con bumpers
    bumpers.forEach((bumper) => {
        let dist = Math.hypot(ball.x - bumper.x, ball.y - bumper.y);
        if (dist < ball.radius + bumper.radius) {
            // Calcular el ángulo de colisión
            let angle = Math.atan2(ball.y - bumper.y, ball.x - bumper.x);
            // Aplicar un rebote en función del ángulo
            ball.dx = Math.cos(angle) * BUMPER_BOOST;
            ball.dy = Math.sin(angle) * BUMPER_BOOST;
            ball.color = bumper.color;
        }
    });

    // Movimiento de flippers
    if (keys["z"]) leftFlipper.angle = -FLIPPER_POWER;
    else leftFlipper.angle = 20;

    if (keys["m"]) rightFlipper.angle = FLIPPER_POWER;
    else rightFlipper.angle = -20;

    // Verificar colisión con flippers
    checkFlipperCollision(leftFlipper, -1);
    checkFlipperCollision(rightFlipper, 1);
    // Verificar colisión con paredes anguladas
    checkWallCollision(leftWall);
    checkWallCollision(rightWall);

    // Limitar la velocidad máxima de la bola
    let speed = Math.hypot(ball.dx, ball.dy);
    if (speed > MAX_BALL_SPEED) {
        ball.dx = (ball.dx / speed) * MAX_BALL_SPEED;
        ball.dy = (ball.dy / speed) * MAX_BALL_SPEED;
    }

    // Si la bola cae fuera del área de juego
    if (ball.y > canvas.height) {
        resetBall();
    }

}

function checkWallCollision(wall) {
    // Vector de la pared
    const wallVecX = wall.end.x - wall.start.x;
    const wallVecY = wall.end.y - wall.start.y;

    // Vector de la bola al inicio de la pared
    const ballToStartX = ball.x - wall.start.x;
    const ballToStartY = ball.y - wall.start.y;

    // Proyección para encontrar el punto más cercano
    let t = (ballToStartX * wallVecX + ballToStartY * wallVecY) / (wallVecX * wallVecX + wallVecY * wallVecY);
    t = Math.max(0, Math.min(1, t));

    // Punto más cercano en la pared
    const closestX = wall.start.x + t * wallVecX;
    const closestY = wall.start.y + t * wallVecY;

    // Distancia entre bola y punto más cercano
    const distX = ball.x - closestX;
    const distY = ball.y - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < ball.radius + WALL_WIDTH / 2) { // Margen de colisión
        // Calcular vector normal
        const normal = normalizeVector(-wallVecY, wallVecX);

        // Reflexión del vector velocidad
        const dot = ball.dx * normal.x + ball.dy * normal.y;
        ball.dx = (ball.dx - 2 * dot * normal.x) * DAMPING;
        ball.dy = (ball.dy - 2 * dot * normal.y) * DAMPING;

        // Reposicionar bola considerando el ancho
        const overlap = (ball.radius + WALL_WIDTH / 2) - distance;
        ball.x += overlap * normal.x;
        ball.y += overlap * normal.y;
    }
}

function normalizeVector(x, y) {
    const length = Math.sqrt(x * x + y * y);
    return { x: x/length, y: y/length };
}


function checkFlipperCollision(flipper, direction) {
    // Calcular la posición de la punta del flipper
    let flipperEndX = flipper.x - FLIPPER_LENGTH * Math.cos((flipper.angle * Math.PI) / 180);
    let flipperEndY = flipper.y - FLIPPER_LENGTH * Math.sin((flipper.angle * Math.PI) / 180);

    // Calcular el vector del flipper
    let flipperVectorX = flipperEndX - flipper.x;
    let flipperVectorY = flipperEndY - flipper.y;

    // Calcular el vector de la bola al punto de giro del flipper
    let ballVectorX = ball.x - flipper.x;
    let ballVectorY = ball.y - flipper.y;

    // Calcular la distancia perpendicular entre la bola y el flipper
    let crossProduct = flipperVectorX * ballVectorY - flipperVectorY * ballVectorX;
    let distance = Math.abs(crossProduct) / Math.hypot(flipperVectorX, flipperVectorY);

    // Verificar si la bola está dentro del área del flipper
    if (distance < ball.radius + FLIPPER_HEIGHT / 2) {
        // Calcular el punto más cercano en el flipper a la bola
        let t = (ballVectorX * flipperVectorX + ballVectorY * flipperVectorY) / (flipperVectorX * flipperVectorX + flipperVectorY * flipperVectorY);
        t = Math.max(0, Math.min(1, t)); // Asegurar que t esté entre 0 y 1
        let closestX = flipper.x + t * flipperVectorX;
        let closestY = flipper.y + t * flipperVectorY;

        // Verificar si la bola está cerca del punto más cercano
        let distToClosest = Math.hypot(ball.x - closestX, ball.y - closestY);
        if (distToClosest < ball.radius + FLIPPER_HEIGHT / 2) {
            // Calcular el ángulo de colisión
            let angle = Math.atan2(ball.y - closestY, ball.x - closestX);

            // Aplicar un rebote en función del ángulo
            ball.dx = Math.cos(angle) * FLIPPER_POWER / 10;
            ball.dy = Math.sin(angle) * FLIPPER_POWER / 10;

            // Añadir un impulso en la dirección del flipper
            ball.dx += direction * (FLIPPER_POWER / 5);
            ball.dy -= 2; // Impulso hacia arriba
        }
    }
}
function resetBall() {
    // Reiniciar la posición y velocidad de la bola
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 150;
    ball.dx = 1 + Math.random() * 2; // Velocidad inicial aleatoria
    ball.dy = -3; // Velocidad vertical inicial reducida
    ball.color = "white";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo oscuro
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar bola
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = WALL_WIDTH; // Grosor visual de la línea

    // Pared izquierda
    ctx.beginPath();
    ctx.moveTo(leftWall.start.x, leftWall.start.y);
    ctx.lineTo(leftWall.end.x, leftWall.end.y);
    ctx.stroke();

    // Pared derecha
    ctx.beginPath();
    ctx.moveTo(rightWall.start.x, rightWall.start.y);
    ctx.lineTo(rightWall.end.x, rightWall.end.y);
    ctx.stroke();

    // Dibujar bumpers
    bumpers.forEach((bumper) => {
        ctx.fillStyle = bumper.color;
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Dibujar flippers con rotación desde la base interna
    drawFlipper(leftFlipper, -1);
    drawFlipper(rightFlipper, 1);
}

function drawFlipper(flipper, direction) {
    ctx.fillStyle = "white";
    ctx.save();
    ctx.translate(flipper.x, flipper.y); // Punto de giro (externo)
    ctx.rotate((flipper.angle * Math.PI) / 180); // Rotar desde el punto de giro
    // Dibujar el flipper desde el punto de giro hacia adentro
    ctx.fillRect(-FLIPPER_LENGTH * direction, -FLIPPER_HEIGHT / 2, FLIPPER_LENGTH * direction, FLIPPER_HEIGHT);
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();