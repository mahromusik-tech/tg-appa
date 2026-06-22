// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Модули Matter.js
const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

const container = document.getElementById('game-container');
const scoreEl = document.getElementById('score');

const WIDTH = 400;
const HEIGHT = 600;
let score = 0;
let currentFruit = null;
let canDrop = true;
let isGameOver = false;

// Создаем физический движок
const engine = Engine.create({
    constraintIterations: 3, // Повышает точность, чтобы фрукты не проходили сквозь друг друга
    positionIterations: 6
});
const world = engine.world;

// Создаем отрисовщик (рендерер)
const render = Render.create({
    element: container,
    engine: engine,
    options: {
        width: WIDTH,
        height: HEIGHT,
        wireframes: false, // Отключаем сеточный режим, чтобы видеть текстуры
        background: '#333'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Конфигурация фруктов
// Если захотите свои картинки, замените texture: '🍒' на URL вашей картинки, например texture: 'assets/cherry.png'
const FRUIT_TYPES = [
    { label: 'cherry', radius: 15, score: 2, texture: '🍒', color: '#ff4d4d' },
    { label: 'strawberry', radius: 22, score: 4, texture: '🍓', color: '#ff944d' },
    { label: 'grape', radius: 30, score: 8, texture: '🍇', color: '#ffcc00' },
    { label: 'tangerine', radius: 38, score: 16, texture: '🍊', color: '#ccff33' },
    { label: 'orange', radius: 48, score: 32, texture: '🍎', color: '#33cc33' },
    { label: 'apple', radius: 60, score: 64, texture: '🍏', color: '#3399ff' },
    { label: 'watermelon', radius: 75, score: 128, texture: '🍉', color: '#9933ff' }
];

// Генерация текстуры из Эмодзи на лету (чтобы не подключать внешние файлы картинок)
function createEmojiTexture(emoji, radius, color) {
    const canvas = document.createElement('canvas');
    const size = radius * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Рисуем круглый фон фрукта
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Рисуем саму иконку фрукта по центру
    ctx.font = `${radius * 1.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, radius, radius + (radius * 0.05));
    
    return canvas.toDataURL();
}

// Предзагрузка текстур
FRUIT_TYPES.forEach(fruit => {
    fruit.textureUrl = createEmojiTexture(fruit.texture, fruit.radius, fruit.color);
});

// Создание стен стакана (пол, левая и правая стены)
const wallOptions = { isStatic: true, render: { fillStyle: '#555' }, friction: 0.1 };
const ground = Bodies.rectangle(WIDTH / 2, HEIGHT + 30, WIDTH, 100, wallOptions);
const leftWall = Bodies.rectangle(-30, HEIGHT / 2, 100, HEIGHT, wallOptions);
const rightWall = Bodies.rectangle(WIDTH + 30, HEIGHT / 2, 100, HEIGHT, wallOptions);
Composite.add(world, [ground, leftWall, rightWall]);

// Функция создания нового фрукта
function createFruit(x, y, typeIndex, isStatic = false) {
    const config = FRUIT_TYPES[typeIndex];
    
    const fruit = Bodies.circle(x, y, config.radius, {
        isStatic: isStatic,
        restitution: 0.2, // Упругость (отскок)
        friction: 0.05,   // Трение (позволяет скатываться)
        density: 0.001,   // Плотность тела
        render: {
            sprite: {
                texture: config.textureUrl
            }
        }
    });

    // Добавляем метаданные к телу, чтобы различать типы фруктов при столкновении
    fruit.fruitType = typeIndex;
    fruit.isFruit = true;
    
    return fruit;
}

// Появление верхнего фрукта готовящегося к броску
function spawnNextFruit() {
    if (isGameOver) return;
    const randType = Math.floor(Math.random() * 3); // Только первые 3 типа падают сверху
    currentFruit = createFruit(WIDTH / 2, 40, randType, true);
    Composite.add(world, currentFruit);
    canDrop = true;
}

// Управление движением по горизонтали (мышь/тач)
function moveFruit(clientX) {
    if (!currentFruit || !canDrop) return;
    const rect = container.getBoundingClientRect();
    let x = (clientX - rect.left) * (WIDTH / rect.width);
    
    const radius = FRUIT_TYPES[currentFruit.fruitType].radius;
    if (x < radius) x = radius;
    if (x > WIDTH - radius) x = WIDTH - radius;

    Body.setPosition(currentFruit, { x: x, y: 40 });
}

// Сброс фрукта вниз
function dropFruit() {
    if (!currentFruit || !canDrop) return;
    
    canDrop = false;
    // Делаем тело динамическим, чтобы на него начала действовать гравитация
    Body.setStatic(currentFruit, false);
    currentFruit = null;

    setTimeout(() => {
        spawnNextFruit();
    }, 600);
}

// Обработка столкновений и слияний
Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Проверяем, что столкнулись именно два фрукта одинакового типа
        if (bodyA.isFruit && bodyB.isFruit && bodyA.fruitType === bodyB.fruitType) {
            const currentType = bodyA.fruitType;
            const nextType = currentType + 1;

            // Если это были не максимальные фрукты (не арбузы), создаем новый уровень выше
            if (nextType < FRUIT_TYPES.length) {
                // Точка появления нового фрукта — центр между двумя столкнувшимися
                const newX = (bodyA.position.x + bodyB.position.x) / 2;
                const newY = (bodyA.position.y + bodyB.position.y) / 2;

                // На всякий случай проверяем, не удалены ли они уже в этом кадре
                if (Composite.allBodies(world).includes(bodyA) && Composite.allBodies(world).includes(bodyB)) {
                    Composite.remove(world, [bodyA, bodyB]);

                    const mergedFruit = createFruit(newX, newY, nextType);
                    Composite.add(world, mergedFruit);

                    score += FRUIT_TYPES[nextType].score;
                    scoreEl.innerText = score;
                }
            } else {
                // Если столкнулись два максимальных фрукта — просто удаляем их (или можно дать кучу очков)
                Composite.remove(world, [bodyA, bodyB]);
                score += 500;
                scoreEl.innerText = score;
            }
            break; 
        }
    }
});

// Проверка GameOver (линия лимита сверху)
Events.on(engine, 'afterUpdate', () => {
    const bodies = Composite.allBodies(world);
    for (let body of bodies) {
        if (body.isFruit && !body.isStatic && body.position.y < 90 && body.velocity.y < 0.1) {
            // Фрукт застрял под потолком и почти не двигается
            isGameOver = true;
            alert("Игра окончена! Ваши очки: " + score);
            resetGame();
            break;
        }
    }
});

function resetGame() {
    const bodies = Composite.allBodies(world);
    const fruitsToRemove = bodies.filter(b => b.isFruit);
    Composite.remove(world, fruitsToRemove);
    score = 0;
    scoreEl.innerText = score;
    isGameOver = false;
    spawnNextFruit();
}

// События ввода
container.addEventListener('mousemove', (e) => moveFruit(e.clientX));
container.addEventListener('click', dropFruit);

container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) moveFruit(e.touches[0].clientX);
});
container.addEventListener('touchend', dropFruit);

// Дополнительно рисуем красную линию дедлайна поверх физики
Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    ctx.beginPath();
    ctx.moveTo(0, 90);
    ctx.lineTo(WIDTH, 90);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
});

// Старт
spawnNextFruit();
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
