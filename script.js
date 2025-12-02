// Global Variables
const modal = document.querySelector(".modal");
const StartButton = document.querySelector(".btn-start");
const StartGameModal = document.querySelector(".start-game");
const GameOverModal = document.querySelector(".game-over");
const RestartButton = document.querySelector(".btn-restart");

const highscoreElement = document.querySelector("#highscore");
const ScoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

let ROWS = 0;
let COlS = 0;
let highScore = 0;
let score = 0;
let time = `00:00`;
let snake = [
  {
    x: 0,
    y: 0,
  },
];

const board = document.querySelector(".board");
const blocks = [];

function calculateColsNRows() {
  const blockHeight = 50;
  const blockWidth = 50;

  const cols = Math.floor(board.clientWidth / blockWidth);
  const rows = Math.floor(board.clientHeight / blockHeight);

  return {
    rows: rows,
    cols: cols,
  };
}
function calculateSnake() {
  let xx = Math.floor(Math.random() * ROWS);
  let yy = Math.floor(Math.random() * COlS);

  snake = [
    {
      x: xx,
      y: yy,
    },
  ];
}

function getRandomDirection() {
  const directions = ["up", "down", "left", "right"];
  const index = Math.floor(Math.random() * directions.length);
  return directions[index];
}

let direction = getRandomDirection();
let IntervalId = null;
let timerIntervalId = null; 
let food = {};

setTimeout(function () {
  const { rows, cols } = calculateColsNRows();

  ROWS = rows;
  COlS = cols;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COlS; j++) {
      const block = document.createElement("div");
      block.classList.add("block");
      board.appendChild(block);
      // block.innerText = `${i}-${j}`;
      blocks[`${i}-${j}`] = block;
    }
  }

  renderFood();
}, 100);

function render() {
  let head = null;

  if (localStorage.getItem("highScore") != null) {
    highscoreElement.innerHTML = localStorage.getItem("highScore");
  }

  blocks[`${food.x}-${food.y}`].classList.add("food");

  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // Game Over Logic
  if (head.x < 0 || head.x >= ROWS || head.y < 0 || head.y >= COlS) {
    // alert("Game Over");
    clearInterval(IntervalId);
    modal.style.display = "flex";
    StartGameModal.style.display = "none";
    GameOverModal.style.display = "flex";
    return;
  }

  // Food eating logic
  if (head.x == food.x && head.y == food.y) {
    updateScore();
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    renderFood();
    blocks[`${food.x}-${food.y}`].classList.add("food");
    snake.unshift(head);
    // calculateHighScore();
  }

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  snake.unshift(head);
  snake.pop();
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

function renderFood() {
  food = {
    x: Math.floor(Math.random() * ROWS),
    y: Math.floor(Math.random() * COlS),
  };
}

StartButton.addEventListener("click", () => {
  modal.style.display = "none";
  IntervalId = setInterval(() => {
    render();
  }, 300);

  timerIntervalId = setInterval(() => {
    let [min,sec] = time.split(":").map(Number);

    if(sec == 59){
      min+=1;
      sec=0;
    }else{
      sec+=1;
    }

    time = `${min.toString()}:${sec.toString()}`;
    timeElement.innerText = time;
  },1000)
});

RestartButton.addEventListener("click", RestartGame);

function RestartGame() {
  resetScore();
  // resetTime();
  time=`00:00`;
  timeElement.innerText = time;
  direction = getRandomDirection();
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  modal.style.display = "none";

  calculateSnake();
  renderFood();
  IntervalId = setInterval(() => {
    render();
  }, 300);
}

// Scoreee

function updateScore() {
  score += 1;
  ScoreElement.innerHTML = score;
  let previousHighScore = localStorage.getItem("highScore");
  if (score > previousHighScore) {
    previousHighScore = score;
    localStorage.setItem("highScore", previousHighScore.toString());
    highscoreElement.innerHTML = localStorage.getItem("highScore");
  }
}

function resetScore() {
  score = 0;
  ScoreElement.innerHTML = `00`;
}
addEventListener("keydown", (event) => {
  console.log(event.code);
  if (event.code == "ArrowUp" || event.code == "KeyW") {
    direction = "up";
  } else if (event.code == "ArrowDown" || event.code == "KeyS") {
    direction = "down";
  } else if (event.code == "ArrowLeft" || event.code == "KeyA") {
    direction = "left";
  } else if (event.code == "ArrowRight" || event.code == "KeyD") {
    direction = "right";
  }
});