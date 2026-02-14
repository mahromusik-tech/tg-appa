// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрыть на весь экран

// --- СЦЕНАРИЙ ---
// Структура: id сцены -> объект с данными
const script = {
    start: {
        bg: "url('https://via.placeholder.com/800x600/1a1a2e/ffffff?text=School')", // Замените на свои картинки
        speaker: "Незнакомец",
        sprite: null,
        text: "Эй, проснись! Ты слышишь меня?",
        next: "scene2"
    },
    scene2: {
        bg: "url('https://via.placeholder.com/800x600/1a1a2e/ffffff?text=School')",
        speaker: "Герой",
        sprite: "https://via.placeholder.com/300x600/e94560/ffffff?text=Hero", // Замените на спрайт
        text: "Голова раскалывается... Где я?",
        next: "choice1"
    },
    choice1: {
        bg: "url('https://via.placeholder.com/800x600/1a1a2e/ffffff?text=School')",
        speaker: "",
        sprite: "https://via.placeholder.com/300x600/e94560/ffffff?text=Hero",
        text: "Нужно решить, что делать дальше.",
        choices: [
            { text: "Осмотреться вокруг", next: "look_around", karma: 0 },
            { text: "Попытаться встать", next: "stand_up", karma: 1 }
        ]
    },
    look_around: {
        bg: "url('https://via.placeholder.com/800x600/16213e/ffffff?text=Classroom')",
        speaker: "Герой",
        sprite: null,
        text: "Похоже на заброшенный класс. Парты перевернуты.",
        next: "ending_bad"
    },
    stand_up: {
        bg: "url('https://via.placeholder.com/800x600/1a1a2e/ffffff?text=School')",
        speaker: "Герой",
        sprite: "https://via.placeholder.com/300x600/e94560/ffffff?text=Hero",
        text: "Я встал, но ноги подкашиваются. Зато я нашел ключ!",
        next: "ending_good"
    },
    // Концовки
    ending_bad: {
        isEnding: true,
        title: "Плохая концовка",
        desc: "Вы остались лежать и вас нашли монстры."
    },
    ending_good: {
        isEnding: true,
        title: "Хорошая концовка",
        desc: "Вы нашли выход и спаслись!"
    }
};

// --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ---
let currentSceneId = 'start';
let isTyping = false;
let typeInterval;
let gameState = {
    karma: 0 // Пример переменной, на которую влияют выборы
};

// --- ЭЛЕМЕНТЫ DOM ---
const screens = document.querySelectorAll('.screen');
const bgEl = document.getElementById('background');
const spriteEl = document.getElementById('character-sprite');
const nameEl = document.getElementById('speaker-name');
const textEl = document.getElementById('dialogue-text');
const choicesEl = document.getElementById('choices-container');
const dialogueBox = document.getElementById('dialogue-box');

// --- ФУНКЦИИ ---

function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    currentSceneId = 'start';
    gameState.karma = 0;
    showScreen('game-screen');
    renderScene(currentSceneId);
}

// Эффект печатной машинки
function typeText(text, callback) {
    textEl.innerHTML = "";
    isTyping = true;
    let i = 0;
    
    // Очищаем предыдущие выборы пока печатаем
    choicesEl.innerHTML = "";

    clearInterval(typeInterval);
    typeInterval = setInterval(() => {
        textEl.innerHTML += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typeInterval);
            isTyping = false;
            if (callback) callback();
        }
    }, 30); // Скорость печати (мс)
}

// Обработка клика по диалоговому окну (пропуск анимации или след. сцена)
dialogueBox.addEventListener('click', () => {
    const scene = script[currentSceneId];
    
    // Если текст еще печатается — завершить мгновенно
    if (isTyping) {
        clearInterval(typeInterval);
        textEl.innerHTML = scene.text;
        isTyping = false;
        showChoicesOrNext(scene);
        return;
    }

    // Если есть выборы, клик не должен переключать сцену (игрок должен нажать кнопку)
    if (scene.choices) return;

    // Переход к следующей сцене
    if (scene.next) {
        currentSceneId = scene.next;
        renderScene(currentSceneId);
    }
});

function showChoicesOrNext(scene) {
    if (scene.choices) {
        renderChoices(scene.choices);
    }
}

function renderChoices(choices) {
    choicesEl.innerHTML = "";
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice.text;
        btn.onclick = (e) => {
            e.stopPropagation(); // Чтобы не сработал клик по dialogueBox
            if (choice.karma) gameState.karma += choice.karma;
            currentSceneId = choice.next;
            renderScene(currentSceneId);
        };
        choicesEl.appendChild(btn);
    });
}

function renderScene(sceneId) {
    const scene = script[sceneId];

    // Проверка на концовку
    if (scene.isEnding) {
        showScreen('ending-screen');
        document.getElementById('ending-title').innerText = scene.title;
        document.getElementById('ending-desc').innerText = scene.desc;
        return;
    }

    // Обновление фона
    if (scene.bg) {
        bgEl.style.backgroundImage = scene.bg;
    }

    // Обновление спрайта
    if (scene.sprite) {
        spriteEl.src = scene.sprite;
        spriteEl.classList.remove('hidden');
    } else {
        spriteEl.classList.add('hidden');
    }

    // Имя говорящего
    nameEl.innerText = scene.speaker;

    // Запуск текста
    typeText(scene.text, () => showChoicesOrNext(scene));
}
