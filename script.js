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
let foods;
let dx;
let dy;
let score;
let gameOver;
let gameStarted = false;
let gameInterval = null;
let currentSpeed = 180;
let pendingGrowth = 0;
let nextBonusScore = 20;
let bonusActive = false;
let bonusTimeout = null;

const foodLevelCycle = [1, 1, 1, 3, 5];
let foodCycleIndex = 0;

function getFoodTypeByLevel(level) {
  return foodTypes.find(type => type.level === level);
}

function startGame() {
  snake = [{ x: 10, y: 10 }];

  dx = 1;
  dy = 0;
  score = 0;
gameOver = false;
foodCycleIndex = 0;
pendingGrowth = 0;
nextBonusScore = 20;
bonusActive = false;

if (bonusTimeout) {
  clearTimeout(bonusTimeout);
  bonusTimeout = null;
}

currentSpeed = getFoodTypeByLevel(1).speed;

  food = {
    x: 5,
    y: 5,
    type: getFoodTypeByLevel(foodLevelCycle[foodCycleIndex])
  };

  foods = [food];

  scoreElement.textContent = score;
}

function gameLoop() {
  if (!gameStarted) {
    return;
  }

  if (gameOver) {
    drawGameOver();
    stopGameLoop();
    return;
  }

  updateSnake();

  if (checkCollision()) {
    gameOver = true;
  }

  drawGame();
}

function startGameLoop() {
  stopGameLoop();
  gameInterval = setInterval(gameLoop, currentSpeed);
}

function stopGameLoop() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
}

function updateGameSpeed(eatenFoodType) {
  if (score >= 100) {
    currentSpeed = getFoodTypeByLevel(3).speed;
  } else {
    currentSpeed = eatenFoodType.speed;
  }

  if (gameStarted) {
    startGameLoop();
  }
}

function updateSnake() {
  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  snake.unshift(head);

  const eatenFoodIndex = foods.findIndex(item => {
  return head.x === item.x && head.y === item.y;
});

if (eatenFoodIndex !== -1) {
  const eatenFood = foods[eatenFoodIndex];
  const eatenFoodType = eatenFood.type;

    score += eatenFoodType.points;
    scoreElement.textContent = score;

    pendingGrowth += eatenFoodType.points - 1;

if (bonusActive) {
  bonusActive = false;

  if (bonusTimeout) {
    clearTimeout(bonusTimeout);
    bonusTimeout = null;
  }

  foodCycleIndex = 0;
  updateGameSpeed(eatenFoodType);
  createFood();
  return;
}

foodCycleIndex++;

if (foodCycleIndex >= foodLevelCycle.length) {
  foodCycleIndex = 0;
}

updateGameSpeed(eatenFoodType);

if (score >= nextBonusScore) {
  createBonusFoods();
  nextBonusScore += 20;
} else {
  createFood();
}
  } else if (pendingGrowth > 0) {
    pendingGrowth--;
  } else {
    snake.pop();
  }
}

function createFood() {
  const selectedLevel = foodLevelCycle[foodCycleIndex];
  const selectedFoodType = getFoodTypeByLevel(selectedLevel);

  const availableCells = [];

  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      const isOnSnake = snake.some(part => part.x === x && part.y === y);

      if (!isOnSnake) {
        availableCells.push({ x, y });
      }
    }
  }

  if (availableCells.length === 0) {
    gameOver = true;
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableCells.length);
  const newFoodPosition = availableCells[randomIndex];

  food = {
  x: newFoodPosition.x,
  y: newFoodPosition.y,
  type: selectedFoodType
};

foods = [food];
}
function createBonusFoods() {
  const bonusLevels = [1, 3, 5];
  const newFoods = [];

  bonusLevels.forEach(level => {
    const selectedFoodType = getFoodTypeByLevel(level);

    const availableCells = [];

    for (let y = 0; y < tileCount; y++) {
      for (let x = 0; x < tileCount; x++) {
        const isOnSnake = snake.some(part => part.x === x && part.y === y);
        const isOnOtherFood = newFoods.some(item => item.x === x && item.y === y);

        if (!isOnSnake && !isOnOtherFood) {
          availableCells.push({ x, y });
        }
      }
    }

    if (availableCells.length === 0) {
      gameOver = true;
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const newFoodPosition = availableCells[randomIndex];

    newFoods.push({
      x: newFoodPosition.x,
      y: newFoodPosition.y,
      type: selectedFoodType
    });
  });

  foods = newFoods;
food = foods[0];
bonusActive = true;

if (bonusTimeout) {
  clearTimeout(bonusTimeout);
}

bonusTimeout = setTimeout(expireBonusFoods, 6000);

}
function expireBonusFoods() {
  if (!bonusActive) {
    return;
  }

  bonusActive = false;
  bonusTimeout = null;
  foodCycleIndex = 0;
  createFood();
}
function drawGame() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSnake();
  drawFood();
}

function drawSnake() {
  ctx.fillStyle = "lime";

  snake.forEach(part => {
    const snakeSize = 14;
    const offset = (gridSize - snakeSize) / 2;

    ctx.fillRect(
      part.x * gridSize + offset,
      part.y * gridSize + offset,
      snakeSize,
      snakeSize
    );
  });
}

function drawFood() {
  foods.forEach(item => {
    const foodSize = item.type.size;
    const offset = (gridSize - foodSize) / 2;

    ctx.fillStyle = item.type.color;
    ctx.fillRect(
      item.x * gridSize + offset,
      item.y * gridSize + offset,
      foodSize,
      foodSize
    );
  });
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
  if (!gameStarted) {
    gameStarted = true;
    startGameLoop();
  }
});

restartBtn.addEventListener("click", function () {
  startGame();
  gameStarted = true;
  startGameLoop();
  drawGame();
});

startGame();
drawGame();