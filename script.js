const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

const foodTypes = [
  {
    level: 1,
    points: 1,
    size: 10,
    color: "red",
    speed: 180
  },
  {
    level: 3,
    points: 3,
    size: 15,
    color: "orange",
    speed: 90
  },
  {
    level: 5,
    points: 5,
    size: 20,
    color: "gold",
    speed: 120
  }
];

let snake;
let food;
let dx;
let dy;
let score;
let gameOver;
let gameStarted = false;
let gameInterval = null;
let nextFoodLevel = null;
let level1EatCount = 0;
let currentSpeed = 180;

function startGame() {
  snake = [{ x: 10, y: 10 }];
  food = {
    x: 5,
    y: 5,
    type: foodTypes[0]
  };
  dx = 1;
  dy = 0;
  score = 0;
  gameOver = false;
  nextFoodLevel = null;
  level1EatCount = 0;
  currentSpeed = foodTypes.find(type => type.level === 1).speed;
  scoreElement.textContent = score;
}

function gameLoop() {
  if (!gameStarted) {
    return;
  }

  if (gameOver) {
    drawGameOver();
    clearInterval(gameInterval);
    gameInterval = null;
    return;
  }

  function updateGameSpeed(eatenFoodType) {
  if (score >= 100) {
    currentSpeed = foodTypes.find(type => type.level === 3).speed;
  } else {
    currentSpeed = eatenFoodType.speed;
  }

  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
  }
}

  updateSnake();

  if (checkCollision()) {
    gameOver = true;
  }

  drawGame();
}

function updateSnake() {
  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
  const eatenFoodType = food.type;

  score += eatenFoodType.points;
  scoreElement.textContent = score;

  if (eatenFoodType.level === 1) {
    level1EatCount++;

    if (level1EatCount >= 3) {
      nextFoodLevel = 3;
      level1EatCount = 0;
    }
  } else if (eatenFoodType.level === 3) {
    nextFoodLevel = 5;
  } else if (eatenFoodType.level === 5) {
    nextFoodLevel = null;
    level1EatCount = 0;
  }

  updateGameSpeed(eatenFoodType);
  createFood();
} else {
  snake.pop();
}
}

function drawGame() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();
}

function drawSnake() {
  ctx.fillStyle = "lime";

  snake.forEach(part => {
    ctx.fillRect(
      part.x * gridSize,
      part.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  });
}

function drawFood() {
  const foodSize = food.type.size;
  const offset = (gridSize - foodSize) / 2;

  ctx.fillStyle = food.type.color;
  ctx.fillRect(
    food.x * gridSize + offset,
    food.y * gridSize + offset,
    foodSize,
    foodSize
  );
}

function createFood() {
  let selectedFoodType;

  if (nextFoodLevel === 3) {
    selectedFoodType = foodTypes.find(type => type.level === 3);
    nextFoodLevel = null;
  } else if (nextFoodLevel === 5) {
    selectedFoodType = foodTypes.find(type => type.level === 5);
    nextFoodLevel = null;
  } else {
    selectedFoodType = foodTypes.find(type => type.level === 1);
  }

  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    type: selectedFoodType
  };

  for (let part of snake) {
    if (part.x === food.x && part.y === food.y) {
      createFood();
      return;
    }
  }
}

function changeDirection(event) {
  const key = event.key;

  if (key === "ArrowUp" && dy !== 1) {
    dx = 0;
    dy = -1;
  } else if (key === "ArrowDown" && dy !== -1) {
    dx = 0;
    dy = 1;
  } else if (key === "ArrowLeft" && dx !== 1) {
    dx = -1;
    dy = 0;
  } else if (key === "ArrowRight" && dx !== -1) {
    dx = 1;
    dy = 0;
  }
}

function checkCollision() {
  const head = snake[0];

  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount
  ) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

  ctx.font = "18px Arial";
  ctx.fillText(
    "Bấm Chơi lại để bắt đầu lại",
    canvas.width / 2,
    canvas.height / 2 + 40
  );
}

document.addEventListener("keydown", changeDirection);

startBtn.addEventListener("click", function () {
  if (!gameInterval) {
    gameStarted = true;
    gameInterval = setInterval(gameLoop, currentSpeed);
  }
});

restartBtn.addEventListener("click", function () {
  startGame();
  gameStarted = true;

  if (gameInterval) {
    clearInterval(gameInterval);
  }

  gameInterval = setInterval(gameLoop, currentSpeed);
});

startGame();
drawGame();