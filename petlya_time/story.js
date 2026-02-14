const StoryEngine = {
    currentSceneId: 'start',
    
    // База данных сцен
    scenes: {
        'start': {
            text: "Ох... голова... Как будто по ней ударили учебником по матану.",
            type: 'monologue', // Новый тип: просто мысли
            next: 'start_2'    // Куда переходим по клику
        },
        'start_2': {
            text: "Стоп. Я же вчера... Я вчера умер? Меня сбила маршрутка?",
            type: 'monologue',
            next: 'start_3'
        },
        'start_3': {
            text: "Смотрю на телефон. 1 сентября. Опять. Не может быть.",
            type: 'monologue',
            next: 'corridor_1'
        },
        'corridor_1': {
            text: "Ты выходишь в коридор. Навстречу несется староста с безумными глазами.",
            type: 'choice', // Тип: выбор
            choices: [
                { text: "Спрятаться в туалете", next: 'toilet_hide' },
                { text: "Поздороваться", next: 'meet_starosta' }
            ]
        },
        'toilet_hide': {
            text: "Ты ныряешь в мужской туалет. Здесь пахнет безысходностью и хлоркой.",
            type: 'monologue',
            next: 'game_over_coward'
        },
        'meet_starosta': {
            text: "Староста: 'О! Ты-то мне и нужен! Сдаем на шторы по 500р!'",
            type: 'choice',
            choices: [
                { text: "Отдать последние деньги", next: 'poor_student' },
                { text: "Сказать, что ты бомж", next: 'angry_starosta' }
            ]
        },
        'game_over_coward': {
            text: "Ты просидел в туалете весь день. Петля не разорвана.",
            type: 'ending' // Тип: конец
        }
        // ... можно добавлять бесконечно
    },

    init: function() {
        // Находим контейнер истории
        this.container = document.getElementById('story-container');
    },

    start: function() {
        Game.showScreen('story');
        this.loadScene('start');
    },

    loadScene: function(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) {
            console.error('Сцена не найдена: ' + sceneId);
            return;
        }
        this.currentSceneId = sceneId;

        // Очищаем экран
        this.container.innerHTML = '';

        // 1. Создаем текст
        const textBlock = document.createElement('div');
        textBlock.className = 'story-text';
        textBlock.innerText = scene.text;
        
        // Анимация появления текста
        textBlock.style.opacity = 0;
        this.container.appendChild(textBlock);
        setTimeout(() => textBlock.style.opacity = 1, 100);

        // 2. Логика в зависимости от типа сцены
        if (scene.type === 'monologue') {
            // Если это монолог — весь экран кликабелен
            const nextHint = document.createElement('div');
            nextHint.className = 'next-hint';
            nextHint.innerText = '▼ Нажми, чтобы продолжить';
            this.container.appendChild(nextHint);

            // Клик по всему контейнеру ведет дальше
            this.container.onclick = () => {
                this.container.onclick = null; // Убираем клик, чтобы не спамить
                this.loadScene(scene.next);
            };

        } else if (scene.type === 'choice') {
            // Если выбор — рисуем кнопки
            this.container.onclick = null; // Убираем клик по фону
            
            const choicesDiv = document.createElement('div');
            choicesDiv.className = 'story-choices';

            scene.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'btn-choice';
                btn.innerText = choice.text;
                btn.onclick = (e) => {
                    e.stopPropagation(); // Чтобы не сработал клик по фону (если он есть)
                    this.loadScene(choice.next);
                };
                choicesDiv.appendChild(btn);
            });
            this.container.appendChild(choicesDiv);
        
        } else if (scene.type === 'ending') {
            // Конец
            const btn = document.createElement('button');
            btn.className = 'btn-restart';
            btn.innerText = 'В МЕНЮ';
            btn.onclick = () => Game.showScreen('menu');
            this.container.appendChild(btn);
        }
    }
};
