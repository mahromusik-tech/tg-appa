// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand(); // Расширяем на весь экран телефона
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

let score = 0;
let fruits = [];
let currentFruit = null;
let isGameOver = false;
let canDrop = true;

// Настройки фруктов: цвет, радиус, очки при слиянии
const FRUIT_TYPES = [
    { color: '#ff4d4d', radius: 15, score: 2 },  // Вишня
    { color: '#ff944d', radius: 22, score: 4 },  // Клубника
    { color: '#ffcc00', radius: 30, score: 8 },  // Виноград
    { color: '#ccff33', radius: 38, score: 16 }, // Мандарин
    { color: '#33cc33', radius: 48, score: 32 }, // Апельсин
    { color: '#3399ff', radius: 60, score: 64 }, // Яблоко
    { color: '#9933ff', radius: 75, score: 128 } // Арбуз
];

class Fruit {
    constructor(x, y, typeIndex, isStatic = false) {
        this.x = x;
        this.y = y;
        this.typeIndex = typeIndex;
        this.config = FRUIT_TYPES[typeIndex];
        this.radius = this.config.radius;
        this.vx = 0;
        this.vy = 0;
        this.isStatic = isStatic;
        this.gravity = 0.4;
        this.bounce = 0.2; // Коэффициент упругости
        this.friction = 0.98; // Трение качения
    }

    update() {
        if (this.isStatic) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Коллизии со стенами
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -this.bounce;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -this.bounce;
        }

        // Коллизия с дном
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -this.bounce;
            this.vx *= this.friction;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.config.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}

// Создание нового случайного фрукта для сброса (только первые 3 типа)
function spawnNextFruit() {
    if (isGameOver) return;
    const randType = Math.floor(Math.random() * 3);
    currentFruit = new Fruit(canvas.width / 2, 40, randType, true);
    canDrop = true;
}

// Обработка физики слияния и столкновений между фруктами
function handleCollisions() {
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            let f1 = fruits[i];
            let f2 = fruits[j];

            let dx = f2.x - f1.x;
            let dy = f2.y - f1.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDist = f1.radius + f2.radius;

            if (distance < minDist) {
                // Если фрукты одинакового типа — сливаем их
                if (f1.typeIndex === f2.typeIndex) {
                    const nextType = f1.typeIndex + 1;
                    
                    // Удаляем оба фрукта
                    fruits.splice(j, 1);
                    fruits.splice(i, 1);

                    // Если это был не максимальный фрукт, создаем новый уровнем выше
                    if (nextType < FRUIT_TYPES.length) {
                        const newX = (f1.x + f2.x) / 2;
                        const newY = (f1.y + f2.y) / 2;
                        const mergedFruit = new Fruit(newX, newY, nextType);
                        fruits.push(mergedFruit);
                        
                        score += FRUIT_TYPES[nextType].score;
                        scoreEl.innerText = score;
                    }
                    return; // Выходим из функции, чтобы пересчитать массив на следующем кадре
                }

                // Простая физика расталкивания при коллизии
                let overlap = minDist - distance;
                let nx = dx / distance;
                let ny = dy / distance;

                // Раздвигаем круги, чтобы они не слипались
                f1.x -= nx * overlap * 0.5;
                f1.y -= ny * overlap * 0.5;
                f2.x += nx * overlap * 0.5;
                f2.y += ny * overlap * 0.5;

                // Меняем скорости (простейший отскок)
                let kx = f1.vx - f2.vx;
                let ky = f1.vy - f2.vy;
                let p = 2 * (nx * kx + ny * ky) / 2;

                f1.vx -= p * nx * 0.5;
                f1.vy -= p * ny * 0.5;
                f2.vx += p * nx * 0.5;
                f2.vy += p * ny * 0.5;
            }
        }
    }
}

// Проверка линии проигрыша (если фрукты заполнили экран доверху)
function checkGameOver() {
    for (let f of fruits) {
        if (!f.isStatic && f.y - f.radius < 80 && Math.abs(f.vy) < 0.1) {
            isGameOver = true;
            alert("Игра окончена! Ваш счёт: " + score);
            resetGame();
        }
    }
}

function resetGame() {
    fruits = [];
    score = 0;
    scoreEl.innerText = score;
    isGameOver = false;
    spawnNextFruit();
}

// Управление движением фрукта наверхней панели
function moveCurrentFruit(clientX) {
    if (!currentFruit || !canDrop) return;
    const rect = canvas.getBoundingClientRect();
    let x = (clientX - rect.left) * (canvas.width / rect.width);
    // Ограничиваем стены
    if (x < currentFruit.radius) x = currentFruit.radius;
    if (x > canvas.width - currentFruit.radius) x = canvas.width - currentFruit.radius;
    currentFruit.x = x;
}

function dropFruit() {
    if (!currentFruit || !canDrop) return;
    currentFruit.isStatic = false;
    fruits.push(currentFruit);
    currentFruit = null;
    canDrop = false;

    // Задержка перед появлением следующего фрукта
    setTimeout(() => {
        spawnNextFruit();
    }, 500);
}

// Слушатели событий (Мышь и Тачскрин для смартфонов)
canvas.addEventListener('mousemove', (e) => moveCurrentFruit(e.clientX));
canvas.addEventListener('click', dropFruit);

canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) moveCurrentFruit(e.touches[0].clientX);
});
canvas.addEventListener('touchend', dropFruit);

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем линию дедлайна
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(canvas.width, 80);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (currentFruit) {
        currentFruit.draw();
    }

    fruits.forEach(fruit => {
        fruit.update();
        fruit.draw();
    });

    handleCollisions();
    checkGameOver();

    requestAnimationFrame(gameLoop);
}

// Старт игры
spawnNextFruit();
gameLoop();
