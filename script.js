// Selectors
const modal = document.querySelector(".modal");
const StartButton = document.querySelector(".btn-start");
const StartGameModal = document.querySelector(".start-game");
const GameOverModal = document.querySelector(".game-over");
const RestartButton = document.querySelector(".btn-restart");

const highscoreElement = document.querySelector("#highscore");
const ScoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const board = document.querySelector(".board");
const blocks = {};

let ROWS = 0;
let COLS = 0;
let score = 0;
let speed = 500; // starting speed in ms
const minSpeed = 120; // fastest allowed speed
const speedIncrease = 15; // decrease interval when eating
let highScore = Number(localStorage.getItem("highScore")) || 0;
highscoreElement.innerText = highScore;

let snake = [];
let direction = "right";
let pendingDirection = direction; // newest requested direction (applied at next frame)
const opposite = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
let food = {};
let gameInterval = null;
let timerInterval = null;
let time = 0;

// Movement map
const moves = {
  up: { x: -1, y: 0 },
  down: { x: 1, y: 0 },
  left: { x: 0, y: -1 },
  right: { x: 0, y: 1 },
};

// BOARD INITIALIZATION
function initBoard() {
  const blockSize = 50;
  COLS = Math.floor(board.clientWidth / blockSize);
  ROWS = Math.floor(board.clientHeight / blockSize);

  // 1️⃣ CREATE ALL BLOCKS FIRST
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const block = document.createElement("div");
      block.classList.add("block");
      board.appendChild(block);
      blocks[`${i}-${j}`] = block;
    }
  }

  // 2️⃣ THEN RESET GAME STATE
  resetGameState();

  // 3️⃣ THEN RENDER FOOD
  renderFood();
}

// Reset state (used on restart)
function resetGameState() {
  if (Object.keys(blocks).length === 0) return;
  snake = [
    {
      x: Math.floor(Math.random() * ROWS),
      y: Math.floor(Math.random() * COLS),
    },
  ];
  score = 0;
  ScoreElement.innerText = "00";
  time = 0;
  timeElement.innerText = "00:00";

  direction = getRandomDirection();

  // clear classes
  Object.values(blocks).forEach((b) => {
    b.classList.remove("fill");
    b.classList.remove("food");
  });

  blocks[`${snake[0].x}-${snake[0].y}`].classList.add("fill");
  speed = 500;
}

// FOOD
function renderFood() {
  let fx, fy;

  do {
    fx = Math.floor(Math.random() * ROWS);
    fy = Math.floor(Math.random() * COLS);
  } while (snake.some((s) => s.x === fx && s.y === fy)); // prevent spawning on snake

  Object.values(blocks).forEach((b) => b.classList.remove("food"));

  food = { x: fx, y: fy };
  blocks[`${fx}-${fy}`].classList.add("food");
}

// CORE GAME LOOP
function render() {
  direction = pendingDirection;

  const move = moves[direction];
  const head = { x: snake[0].x + move.x, y: snake[0].y + move.y };

  // WALL COLLISION
  if (head.x < 0 || head.x >= ROWS || head.y < 0 || head.y >= COLS) {
    endGame();
    return;
  }

  // SELF COLLISION (snake bites itself)
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  // FOOD
  if (head.x === food.x && head.y === food.y) {
    score++;
    ScoreElement.innerText = score;
    updateHighScore();

    snake.unshift(head);
    blocks[`${head.x}-${head.y}`].classList.add("fill");

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    renderFood();

    if (speed > minSpeed) {
      speed -= speedIncrease;
    }

    // restart interval with new speed
    clearInterval(gameInterval);
    gameInterval = setInterval(render, speed);

    return;
  }

  // NORMAL MOVE
  const tail = snake.pop();
  blocks[`${tail.x}-${tail.y}`].classList.remove("fill");

  snake.unshift(head);
  blocks[`${head.x}-${head.y}`].classList.add("fill");
}

// High Score
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highscoreElement.innerText = highScore;
  }
}

// Start Game
StartButton.addEventListener("click", () => {
  modal.style.display = "none";
  startGame();
});

function waitForBoardReady(callback) {
  const check = () => {
    if (board.clientWidth > 0 && board.clientHeight > 0) {
      callback();
    } else {
      requestAnimationFrame(check);
    }
  };
  check();
}

// Restart
RestartButton.addEventListener("click", () => {
  modal.style.display = "none";
  resetGameState();
  renderFood();
  startGame();
});

// Start intervals
function startGame() {
  gameInterval = setInterval(render, speed);

  timerInterval = setInterval(() => {
    time++;
    const min = String(Math.floor(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    timeElement.innerText = `${min}:${sec}`;
  }, 1000);
}

// End game
function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  StartGameModal.style.display = "none";
  GameOverModal.style.display = "flex";

  modal.style.display = "flex";
}

// Random start direction
function getRandomDirection() {
  return ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
}

// Controls
window.addEventListener("keydown", (e) => {
  let newDir = null;
  if (e.code === "ArrowUp" || e.code === "KeyW") newDir = "up";
  else if (e.code === "ArrowDown" || e.code === "KeyS") newDir = "down";
  else if (e.code === "ArrowLeft" || e.code === "KeyA") newDir = "left";
  else if (e.code === "ArrowRight" || e.code === "KeyD") newDir = "right";

  if (!newDir) return;

  if (opposite[direction] === newDir) return;

  pendingDirection = newDir;
});

// INIT
window.addEventListener("load", () => {
  waitForBoardReady(() => {
    initBoard();
  });
});
