const tg = window.Telegram.WebApp;
tg.expand();

// --- СОСТОЯНИЕ ИГРЫ ---
let gameState = {
    sanity: 5,      // Рассудок (старт с 5, чтобы было куда падать)
    knowledge: 0,   // Знание
    rel_dimon: 0,   // Отношения с Димоном
    rel_lena: 0     // Отношения с Леной
};

// --- СЦЕНАРИЙ ---
const script = {
    // --- СЦЕНА 1: ПРОБУЖДЕНИЕ ---
    start: {
        bg: "url('https://via.placeholder.com/800x600/333/fff?text=Dorm+Room')", // Общага
        speaker: "Герой (мысли)",
        isThought: true, // Флаг: это мысли
        text: "7:00. Голова как свинцом налита. Кажется, я видел этот сон... или это было вчера? 15 октября. Среда.",
        next: "scene1_dimon"
    },
    scene1_dimon: {
        bg: "url('https://via.placeholder.com/800x600/333/fff?text=Dorm+Room')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon",
        text: "Макс, выруби его... Кстати, ты не видел мой зарядник? Вчера на столе лежал.",
        choices: [
            { 
                text: "Он под тумбочкой, Димон", 
                next: "scene2_start", 
                stats: { knowledge: 1, rel_dimon: 1 } // Влияние на статы
            },
            { 
                text: "Ищи сам, я не нанимался", 
                next: "scene2_start", 
                stats: { rel_dimon: -1 } 
            },
            { 
                text: "Молча встать и пойти в душ", 
                next: "scene2_start", 
                stats: {} 
            }
        ]
    },

    // --- СЦЕНА 2: КОРИДОР ---
    scene2_start: {
        bg: "url('https://via.placeholder.com/800x600/222/fff?text=Corridor')", // Коридор
        speaker: "",
        text: "*В умывальнике парень из соседней комнаты задевает тебя плечом.*",
        next: "scene2_thought"
    },
    scene2_thought: {
        bg: "url('https://via.placeholder.com/800x600/222/fff?text=Corridor')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Сейчас он уронит мыльницу. Раз, два... (Стук пластика). Точно. Это просто дежавю. Нужно умыться ледяной водой.",
        choices: [
            { 
                text: "Ущипнуть себя за руку до синяка", 
                next: "scene3_start", 
                stats: { sanity: -1 } 
            },
            { 
                text: "Смотреть в зеркало и считать до десяти", 
                next: "scene3_start", 
                stats: { sanity: 1 } 
            }
        ]
    },

    // --- СЦЕНА 3: КРЫЛЬЦО ---
    scene3_start: {
        bg: "url('https://via.placeholder.com/800x600/555/fff?text=University+Porch')", // Универ
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena",
        text: "Макс! Ты лабу сделал? Аркадий сегодня в ярости, он уже троих отправил на пересдачу.",
        choices: [
            { 
                text: "Дай посмотрю твою, я помогу исправить ошибку", 
                next: "scene4_start", 
                stats: { rel_lena: 1, knowledge: 1 } 
            },
            { 
                text: "Прости, я сам по нулям. Пойду кофе возьму", 
                next: "scene4_start", 
                stats: { rel_lena: -1 } 
            }
        ]
    },

    // --- СЦЕНА 4: ЛЕКЦИЯ ---
    scene4_start: {
        bg: "url('https://via.placeholder.com/800x600/444/fff?text=Lecture+Hall')", // Лекция
        speaker: "Аркадий Петрович",
        sprite: "https://via.placeholder.com/300x600/888/fff?text=Teacher",
        text: "Кто желает к доске? Или мне самому выбрать жертву?",
        next: "scene4_thought"
    },
    scene4_thought: {
        bg: "url('https://via.placeholder.com/800x600/444/fff?text=Lecture+Hall')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Он сейчас вызовет Кузнецова. Я помню, как тот позорился.",
        choices: [
            { 
                text: "Вызваться самому и решить задачу", 
                next: "scene5_start", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Сидеть тихо", 
                next: "scene5_start", 
                stats: {} // Кузнецова унижают
            }
        ]
    },

    // --- СЦЕНА 5: ОБЕД ---
    scene5_start: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen')", // Столовая
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Я знаю каждое его слово. Сейчас он скажет про баланс классов...",
        next: "scene5_dimon"
    },
    scene5_dimon: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon",
        text: "...и вот баланс классов они вообще убили, прикинь?",
        choices: [
            { 
                text: "Перебить его и закончить фразу за него", 
                next: "scene6_ending_demo", // Временная концовка
                stats: { sanity: -1 } 
            },
            { 
                text: "Сказать, что тебе плохо, и уйти в библиотеку", 
                next: "scene6A_library", 
                stats: {} 
            },
            { 
                text: "Предложить прогулять пары в парке", 
                next: "scene6B_park", 
                stats: {} 
            }
        ]
    },

    // --- ЗАГЛУШКИ ДЛЯ СЛЕДУЮЩИХ СЦЕН ---
    scene6_ending_demo: {
        isEnding: true,
        title: "Конец демо",
        desc: "Вы напугали Димона. День продолжается..."
    },
    scene6A_library: {
        isEnding: true,
        title: "Ветка Библиотеки",
        desc: "Вы ушли в тишину книг. (Продолжение следует)"
    },
    scene6B_park: {
        isEnding: true,
        title: "Ветка Парка",
        desc: "Вы решили подышать воздухом. (Продолжение следует)"
    }
};

// --- ПЕРЕМЕННЫЕ ДВИЖКА ---
let currentSceneId = 'start';
let isTyping = false;
let typeInterval;

// --- ЭЛЕМЕНТЫ DOM ---
const screens = document.querySelectorAll('.screen');
const bgEl = document.getElementById('background');
const spriteEl = document.getElementById('character-sprite');
const nameEl = document.getElementById('speaker-name');
const textEl = document.getElementById('dialogue-text');
const choicesEl = document.getElementById('choices-container');
const dialogueBox = document.getElementById('dialogue-box');

// Элементы статистики
const statEls = {
    sanity: document.getElementById('stat-sanity'),
    knowledge: document.getElementById('stat-knowledge'),
    dimon: document.getElementById('stat-dimon'),
    lena: document.getElementById('stat-lena')
};

// --- ФУНКЦИИ ---

function updateStatsUI() {
    statEls.sanity.innerText = gameState.sanity;
    statEls.knowledge.innerText = gameState.knowledge;
    statEls.dimon.innerText = gameState.rel_dimon;
    statEls.lena.innerText = gameState.rel_lena;
}

function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    currentSceneId = 'start';
    // Сброс статов
    gameState = { sanity: 5, knowledge: 0, rel_dimon: 0, rel_lena: 0 };
    updateStatsUI();
    showScreen('game-screen');
    renderScene(currentSceneId);
}

function typeText(text, callback) {
    textEl.innerHTML = "";
    isTyping = true;
    let i = 0;
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
    }, 25); 
}

dialogueBox.addEventListener('click', () => {
    const scene = script[currentSceneId];
    if (isTyping) {
        clearInterval(typeInterval);
        textEl.innerHTML = scene.text;
        isTyping = false;
        showChoicesOrNext(scene);
        return;
    }
    if (scene.choices) return;
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
            e.stopPropagation();
            
            // Применение изменений статистики
            if (choice.stats) {
                for (let key in choice.stats) {
                    if (gameState.hasOwnProperty(key)) {
                        gameState[key] += choice.stats[key];
                    }
                }
                updateStatsUI();
            }

            currentSceneId = choice.next;
            renderScene(currentSceneId);
        };
        choicesEl.appendChild(btn);
    });
}

function renderScene(sceneId) {
    const scene = script[sceneId];

    if (scene.isEnding) {
        showScreen('ending-screen');
        document.getElementById('ending-title').innerText = scene.title;
        document.getElementById('ending-desc').innerText = scene.desc;
        return;
    }

    if (scene.bg) bgEl.style.backgroundImage = scene.bg;

    if (scene.sprite) {
        spriteEl.src = scene.sprite;
        spriteEl.classList.remove('hidden');
    } else {
        spriteEl.classList.add('hidden');
    }

    // Обработка мыслей vs речи
    nameEl.innerText = scene.speaker;
    if (scene.isThought) {
        textEl.classList.add('thought-text');
        nameEl.classList.add('thought-name');
    } else {
        textEl.classList.remove('thought-text');
        nameEl.classList.remove('thought-name');
    }

    typeText(scene.text, () => showChoicesOrNext(scene));
}
