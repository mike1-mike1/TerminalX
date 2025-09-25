const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings and variables
const gameWidth = 1600;
const gameHeight = 900;

// Bird settings
const birdSize = 30;           // Size of the bird (width and height)
const ytap = 85;              // Jump height for each tap
const gravity = 150 * 0.02;    // Gravity effect per interval

// Game loop settings
const interval = 0.01;         // Time interval between updates in seconds
const obstacleGenerationInterval = 210; // Number of updates before generating a new obstacle (50 * 0.02s = 1 second)
let velocityX = 3.1;             // Initial x-velocity, which increases over time

// Obstacle settings
const minObstacleWidth = 40;   // Minimum obstacle width
const maxObstacleWidth = 90;   // Maximum obstacle width
const minGapHeight = 250;      // Minimum gap height between obstacles
const maxGapHeight = 400;      // Maximum gap height between obstacles

// Game state variables
let birdY, time, obstacles, gameOver, highScore, score;
let isGameStarted = false;     // Controls game start
let obstacleGenerationCounter = 0; // Counter for obstacle generation

// Initialize game variables
function initGame() {
    birdY = 400;
    time = 0;
    velocityX = 3.1;
    obstacles = [];
    gameOver = false;
    score = 0;
    isGameStarted = false;     // Wait for player input to start

    if (!highScore) highScore = 0; // Retain high score between sessions
    drawStartScreen();          // Show the start screen
}

// Draw the start screen
function drawStartScreen() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
    ctx.font = "48px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Tappy Block", gameWidth / 2 - 100, gameHeight / 2 - 50);
    ctx.font = "24px Arial";
    ctx.fillText("Press Space or Tap to Start", gameWidth / 2 - 120, gameHeight / 2 + 20);
}

// Handle input for start, jump, and restart
function handleInput() {
    if (!isGameStarted) {
        isGameStarted = true;
        gameLoop(); // Start the game loop
    } else if (gameOver) {
        initGame(); // Restart if the game is over
    } else {
        birdY -= ytap; // Jump during gameplay
    }
}

// Event listeners for space and tap
canvas.addEventListener("click", handleInput);
window.addEventListener("keypress", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        handleInput();
    }
});

// Main game loop
function gameLoop() {
    if (gameOver) {
        displayGameOver();
        return;
    }

    time += interval;
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Update game logic
function updateGame() {
    // Update bird position
    velocityX = velocityX //+ time / 20000;
    birdY += gravity;
    score = Math.floor(time); // Increment score based on time

    // Update obstacle generation counter
    obstacleGenerationCounter++;

    // Generate new obstacles based on the defined interval
    if (obstacleGenerationCounter >= obstacleGenerationInterval) {
        obstacleGenerationCounter = 0; // Reset counter after generating obstacle
        const gapHeight = minGapHeight + Math.random() * (maxGapHeight - minGapHeight);
        const obstacleWidth = minObstacleWidth + Math.random() * (maxObstacleWidth - minObstacleWidth);
        obstacles.push({
            x: gameWidth,
            width: obstacleWidth,
            gapY: Math.random() * (gameHeight - gapHeight),
            gapHeight
        });
    }

    // Move obstacles and check for collisions
    obstacles = obstacles.map(obstacle => {
        obstacle.x -= velocityX;
        if (checkCollision(birdY, obstacle)) {
            gameOver = true;
            if (score > highScore) highScore = score; // Update high score
        }
        return obstacle;
    }).filter(obstacle => obstacle.x + obstacle.width > 0);

    // Check if bird hits the ground or ceiling
    if (birdY >= gameHeight - birdSize || birdY <= 0) {
        gameOver = true;
        if (score > highScore) highScore = score;
    }
}

// Collision detection
function checkCollision(birdY, obstacle) {
    return (
        obstacle.x < 100 + birdSize &&
        obstacle.x + obstacle.width > 100 &&
        (birdY < obstacle.gapY || birdY + birdSize > obstacle.gapY + obstacle.gapHeight)
    );
}

// Draw game objects
function drawGame() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Draw bird
    ctx.fillStyle = "red";
    ctx.fillRect(100, birdY, birdSize, birdSize);

    // Draw obstacles
    ctx.fillStyle = "green";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapY);
        ctx.fillRect(obstacle.x, obstacle.gapY + obstacle.gapHeight, obstacle.width, gameHeight - obstacle.gapY - obstacle.gapHeight);
    });

    // Display current score
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`Score: ${score}`, 20, 50);
    ctx.fillText(`High Score: ${highScore}`, 20, 90);
}

// Display Game Over and restart prompt
function displayGameOver() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Game Over!", gameWidth / 2 - 100, gameHeight / 2 - 50);
    ctx.font = "24px Arial";
    ctx.fillText("Press Space or Tap to Restart", gameWidth / 2 - 140, gameHeight / 2 + 20);
}

// Initialize the game and display start screen
initGame(time);