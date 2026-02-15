const tg = window.Telegram.WebApp;
tg.expand();

// --- СОСТОЯНИЕ ИГРЫ ---
let gameState = {
    sanity: 5,      // Рассудок (старт с 5, чтобы было куда падать)
    knowledge: 0,   // Знание
    rel_dimon: 0,   // Отношения с Димоном
    rel_lena: 0     // Отношения с Леной
};

const script = {
    // --- СЦЕНА 1: ПРОБУЖДЕНИЕ (07:00) ---
    start: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')", // Замени на img/dorm.jpg
        speaker: "",
        text: "Ты открываешь глаза. Потолок в желтых пятнах от старой протечки. Справа — стена с плакатом какой-то группы. Ты чувствуешь странную тяжесть в затылке, как будто вчера была бурная вечеринка.",
        next: "s1_thoughts"
    },
    s1_thoughts: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "7:00. Среда. 15 октября. Почему у меня такое чувство, что я уже видел эту трещину на потолке именно при таком освещении? Солнце падает на подоконник ровно под тем же углом...",
        next: "s1_dimon_wake"
    },
    s1_dimon_wake: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sleepy",
        text: "*Скрип панцирной сетки* М-м-макс... выруби эту шарманку. Мозг сейчас взорвется.",
        next: "s1_dimon_action"
    },
    s1_dimon_action: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "",
        text: "Димон свешивает руку с верхней полки, пытаясь нащупать свой телефон на полу.",
        next: "s1_dimon_charger"
    },
    s1_dimon_charger: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sleepy",
        text: "Черт... Опять. Макс, глянь, я зарядку не вижу. Вчера же втыкал в розетку, точно помню.",
        choices: [
            { 
                text: "Встать и молча найти зарядку под тумбочкой", 
                next: "s2_corridor", 
                stats: { knowledge: 1, rel_dimon: 1 } // Ты знаешь, где она (Знание+1)
            },
            { 
                text: "«Сам ищи, я в душ»", 
                next: "s2_corridor", 
                stats: { rel_dimon: -1 } 
            },
            { 
                text: "Лежать и смотреть в потолок", 
                next: "s1_ignore_alarm", 
                stats: { sanity: -1 } 
            }
        ]
    },
    s1_ignore_alarm: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "",
        text: "Будильник орет еще минуту, пока Димон не запускает в него подушкой. Звон в ушах остается.",
        next: "s2_corridor"
    },

    // --- СЦЕНА 2: КОРИДОР И УМЫВАЛЬНИК (07:15) ---
    s2_corridor: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor')", // Замени на img/corridor.jpg
        speaker: "",
        text: "Ты выходишь в коридор. Из-под двери 305-й доносится запах жареной картошки. Навстречу идет староста этажа, тетя Валя, с ведром и шваброй.",
        next: "s2_valya"
    },
    s2_valya: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor')",
        speaker: "Тетя Валя",
        sprite: "https://via.placeholder.com/300x600/555/fff?text=Aunt+Valya",
        text: "Опять в тапочках на босу ногу? Заболеешь, Максимка, а мне потом отвечай.",
        next: "s2_thoughts"
    },
    s2_thoughts: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Она говорит это каждое утро. Или только сегодня? Я могу предсказать её следующий вздох.",
        next: "s2_washroom"
    },
    s2_washroom: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')", // Замени на img/washroom.jpg
        speaker: "",
        text: "Ты заходишь в умывальник. Ряд раковин, над ними — мутные зеркала. Вода в кране фыркает и выплевывает струю ржавчины, прежде чем пойти чистой.",
        choices: [
            { 
                text: "Долго умываться ледяной водой", 
                next: "s2_ice_water", 
                stats: {} 
            },
            { 
                text: "Рассматривать свое отражение", 
                next: "s2_mirror", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Заговорить с парнем у соседней раковины", 
                next: "s2_soap_catch", 
                stats: { sanity: 1 } // Успешное действие повышает рассудок
            }
        ]
    },

    // --- РАЗВЕТВЛЕНИЯ СЦЕНЫ 2 ---
    s2_ice_water: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')",
        speaker: "",
        text: "Кожа немеет, но странное чувство дежавю не уходит. Оно под кожей.",
        next: "scene3_start" // Сюда привяжем следующую часть
    },
    s2_mirror: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')",
        speaker: "",
        text: "Ты всматриваешься в свои зрачки. Кажется, что в них застыло какое-то знание, которое ты еще не можешь сформулировать.",
        next: "scene3_start"
    },
    s2_soap_catch: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')",
        speaker: "",
        text: "Ты молча протягиваешь руку и ловишь мыльницу за секунду до того, как она упадет. Парень смотрит на тебя с открытым ртом.",
        next: "scene3_start"
    },

    // --- СЦЕНА 3: СБОРЫ (07:45) ---
    scene3_start: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "",
        text: "Ты возвращаешься в комнату. Нужно собрать рюкзак. Тетради, ручка, та самая лаба по термеху, которую ты так и не доделал.",
        next: "s3_dimon_date"
    },
    s3_dimon_date: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sitting",
        text: "Слушай, Макс... А какой сегодня день? В смысле, число?",
        next: "s3_hero_reply"
    },
    s3_hero_reply: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "Герой",
        text: "Пятнадцатое. Октябрь.",
        next: "s3_dimon_glitch"
    },
    s3_dimon_glitch: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Confused",
        text: "Странно. Мне казалось, вчера тоже было пятнадцатое. Я еще подумал: о, середина месяца, скоро стипуха... Ладно, забей. Глюки.",
        choices: [
            { 
                text: "«Мне тоже так кажется, Димон. Очень странно»", 
                next: "scene4_tram_stop", 
                stats: { rel_dimon: 1, knowledge: 1 } 
            },
            { 
                text: "«Это просто день сурка, привыкай»", 
                next: "scene4_tram_stop", 
                stats: {} 
            },
            { 
                text: "Поторопить его: «Собирайся быстрее»", 
                next: "scene4_tram_stop", 
                stats: {} 
            }
        ]
    },

    // --- СЦЕНА 4: ОСТАНОВКА И ТРАМВАЙ (08:15) ---
    scene4_tram_stop: {
        bg: "url('https://via.placeholder.com/800x600/555/777?text=Bus+Stop')",
        speaker: "",
        text: "Вы стоите на остановке. Народу тьма. Рядом стоит женщина с маленьким ребенком, который капризничает и просит чупа-чупс.",
        next: "s4_candy_thought"
    },
    s4_candy_thought: {
        bg: "url('https://via.placeholder.com/800x600/555/777?text=Bus+Stop')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Сейчас она достанет из сумки мятную конфету, и он замолчит. Три... два... один.",
        next: "s4_tram_arrives"
    },
    s4_tram_arrives: {
        bg: "url('https://via.placeholder.com/800x600/555/777?text=Bus+Stop')",
        speaker: "",
        text: "Женщина достает конфету. Ребенок затихает. Трамвай №7 со скрипом подкатывает к остановке. Двери открываются с характерным шипением.",
        choices: [
            { 
                text: "Пропустить всех вперед и зайти последним", 
                next: "s4_tram_inside_observe", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Протиснуться к окну и смотреть на город", 
                next: "s4_tram_inside_window", 
                stats: {} 
            }
        ]
    },
    s4_tram_inside_observe: {
        bg: "url('https://via.placeholder.com/800x600/444/666?text=Tram+Inside')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Люди двигаются как по команде. Шаг влево, шаг вправо — все синхронно, будто отрепетировано.",
        next: "scene5_hall"
    },
    s4_tram_inside_window: {
        bg: "url('https://via.placeholder.com/800x600/444/666?text=Tram+Window')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Город кажется декорацией. Машины проезжают те же самые, те же цвета... Нет, это бред. Номера я не запоминал.",
        next: "scene5_hall"
    },

    // --- СЦЕНА 5: ХОЛЛ УНИВЕРСИТЕТА (08:45) ---
    scene5_hall: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "",
        text: "Ты проходишь через турникет. Охранник дядя Юра даже не смотрит на твой пропуск, он увлечен кроссвордом.",
        next: "s5_guard_thought"
    },
    s5_guard_thought: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Слово из шести букв, 'единица времени'... Он сейчас спросит меня.",
        next: "s5_guard_dialogue"
    },
    s5_guard_dialogue: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Дядя Юра",
        sprite: "https://via.placeholder.com/300x600/333/fff?text=Guard+Yura",
        text: "Слышь, студент... Единица времени, шесть букв. Вторая 'е'.",
        next: "s5_hero_answer"
    },
    s5_hero_answer: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Герой",
        text: "Секунда.",
        next: "s5_guard_reply"
    },
    s5_guard_reply: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Дядя Юра",
        sprite: "https://via.placeholder.com/300x600/333/fff?text=Guard+Yura",
        text: "Точно. Башка у тебя варит.",
        next: "s5_meet_lena"
    },
    s5_meet_lena: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "",
        text: "Ты идешь к лестнице и сталкиваешься с Леной. Она выглядит так, будто не спала вечность. Папка в её руках едва не рассыпается.",
        next: "s5_lena_dialogue"
    },
    s5_lena_dialogue: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Tired",
        text: "Макс! Стой. Ты лабу сделал? Я в своей запуталась, там в третьем пункте какая-то дичь получается. Если Аркадий увидит — он меня уничтожит.",
        choices: [
            { 
                text: "«Давай сюда, у нас есть 10 минут. Исправим»", 
                next: "scene6_lecture", 
                stats: { rel_lena: 1, knowledge: 1 } 
            },
            { 
                text: "«Лен, я сам в пролете. Давай надеяться на чудо»", 
                next: "scene6_lecture", 
                stats: {} 
            },
            { 
                text: "«Слушай, а ты не чувствуешь, что мы это уже обсуждали?»", 
                next: "s5_lena_suspicion", 
                stats: { knowledge: 1 } 
            }
        ]
    },
    s5_lena_suspicion: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Worried",
        text: "Макс, ты бледный какой-то. Переучил? Пошли лучше на пару, пока не опоздали.",
        next: "scene6_lecture"
    }, 
    // --- ЗАГЛУШКА ДЛЯ СЛЕДУЮЩЕЙ ЧАСТИ ---
    scene6_lecture: {
        bg: "url('https://via.placeholder.com/800x600/000/000?text=To+Be+Continued')",
        speaker: "Система",
        text: "Конец текущей части сценария. Жду продолжения...",
        isEnding: true,
        title: "Пауза",
        desc: "Пришли следующую часть сценария."
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
