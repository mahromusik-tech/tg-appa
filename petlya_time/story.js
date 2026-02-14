const StoryEngine = {
    // Состояние прохождения
    state: {
        day: 1,
        karma: 0,   // Хороший/Плохой
        sanity: 50, // Безумие
        love: 0     // Романтика
    },

    // Элементы интерфейса
    ui: {},

    // --- СЦЕНАРИЙ (ЗАГЛУШКИ) ---
    scenes: {
        // ДЕНЬ 1: НАЧАЛО
        'day1_start': {
            bg: '#2c3e50', // Цвет или URL('img/room.jpg')
            sprite: '',    // URL('img/hero.png')
            speaker: 'Герой',
            text: "Снова этот будильник... Какой сегодня день?",
            next: 'day1_mirror'
        },
        'day1_mirror': {
            bg: '#2c3e50',
            sprite: '', 
            speaker: '', // Пусто = мысли
            text: "Я смотрю в зеркало. Лицо кажется чужим.",
            next: 'day1_choice_1'
        },
        'day1_choice_1': {
            bg: '#34495e', // Коридор
            sprite: '', // Тут можно поставить спрайт Старосты
            speaker: 'Староста',
            text: "Эй! Ты почему опаздываешь? И где деньги на шторы?",
            choices: [
                { 
                    text: "Извиниться и отдать деньги", 
                    next: 'day1_good', 
                    stats: { karma: 1, money: -10 } 
                },
                { 
                    text: "Послать её к черту", 
                    next: 'day1_bad', 
                    stats: { karma: -1, sanity: -5 } 
                }
            ]
        },
        'day1_good': {
            bg: '#27ae60',
            text: "Ты отдал деньги. Староста улыбнулась. День начался неплохо.",
            next: 'day2_start' // Переход к следующему дню
        },
        'day1_bad': {
            bg: '#c0392b',
            text: "Ты нагрубил. Все смотрят на тебя косо.",
            next: 'day2_start'
        },

        // ДЕНЬ 2 (Пример перехода)
        'day2_start': {
            bg: '#000',
            text: "ДЕНЬ 2. Ты просыпаешься с тяжелой головой.",
            action: function() { StoryEngine.state.day = 2; }, // Скрипт меняет день
            next: 'end_check' // Для теста сразу к проверке концовки
        },

        // ПРОВЕРКА КОНЦОВОК (Техническая сцена)
        'end_check': {
            action: function() { StoryEngine.checkEnding(); }
        }
    },

    init: function() {
        this.ui = {
            bg: document.getElementById('story-bg'),
            sprite: document.getElementById('story-sprite'),
            nameBox: document.getElementById('story-name-box'),
            textBox: document.getElementById('story-text-box'),
            choicesBox: document.getElementById('story-choices-box'),
            clickArea: document.getElementById('story-click-area')
        };
    },

    start: function() {
        // Сброс статов при новой игре
        this.state = { day: 1, karma: 0, sanity: 50, love: 0 };
        this.loadScene('day1_start');
    },

    loadScene: function(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) return console.error('Сцена не найдена:', sceneId);

        // 1. Выполняем действие (если есть)
        if (scene.action) {
            scene.action();
            if (!scene.text && !scene.choices) return; // Если это чисто техническая сцена
        }

        // 2. Обновляем графику
        if (scene.bg) {
            // Если это цвет (начинается с #)
            if (scene.bg.startsWith('#')) {
                this.ui.bg.style.backgroundImage = 'none';
                this.ui.bg.style.backgroundColor = scene.bg;
            } else {
                this.ui.bg.style.backgroundImage = `url('${scene.bg}')`;
            }
        }

        if (scene.sprite) {
            this.ui.sprite.style.backgroundImage = `url('${scene.sprite}')`;
            this.ui.sprite.style.opacity = 1;
        } else {
            this.ui.sprite.style.opacity = 0; // Скрываем, если нет спрайта
        }

        // 3. Обновляем текст
        this.ui.textBox.innerText = scene.text || "";
        
        if (scene.speaker) {
            this.ui.nameBox.style.display = 'block';
            this.ui.nameBox.innerText = scene.speaker;
        } else {
            this.ui.nameBox.style.display = 'none';
        }

        // 4. Очищаем старые кнопки
        this.ui.choicesBox.innerHTML = '';
        this.ui.clickArea.onclick = null;

        // 5. Логика переходов
        if (scene.choices) {
            // Режим выбора
            this.ui.clickArea.style.display = 'none'; // Блокируем клик по фону
            
            scene.choices.forEach(choice => {
                const btn = document.createElement('div');
                btn.className = 'btn-story-choice';
                btn.innerText = choice.text;
                btn.onclick = () => {
                    // Применяем статы
                    if (choice.stats) {
                        for (let key in choice.stats) {
                            if (this.state[key] !== undefined) {
                                this.state[key] += choice.stats[key];
                            }
                        }
                    }
                    this.loadScene(choice.next);
                };
                this.ui.choicesBox.appendChild(btn);
            });

        } else {
            // Режим "Далее" (клик по тексту)
            this.ui.clickArea.style.display = 'block';
            this.ui.clickArea.onclick = () => {
                if (scene.next) this.loadScene(scene.next);
            };
        }
    },

    checkEnding: function() {
        // Логика концовок (пример)
        let endingText = "";
        
        if (this.state.sanity <= 0) {
            endingText = "ПЛОХАЯ КОНЦОВКА: Ты сошел с ума.";
        } else if (this.state.karma > 5) {
            endingText = "ХОРОШАЯ КОНЦОВКА: Ты стал душой компании.";
        } else {
            endingText = "НЕЙТРАЛЬНАЯ КОНЦОВКА: День сурка продолжается.";
        }

        // Показываем экран концовки (можно сделать отдельный метод)
        alert(endingText); 
        Game.showScreen('menu');
    }
};
