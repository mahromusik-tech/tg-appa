// --- ДАННЫЕ СЦЕНАРИЯ ---
const STORY_DATA = {
    "start": {
        text: "Ты открываешь глаза. Голова раскалывается. На часах 8:00. 1 сентября.",
        bg: "https://placehold.co/600x800/222/FFF?text=Room",
        speaker: "", 
        sprite: null, 
        choices: [
            { text: "Встать с кровати", next: "meet_max" },
            { text: "Спать дальше", next: "game_over_sleep" }
        ]
    },
    "meet_max": {
        text: "Эй, соня! Мы проспим линейку! Вставай, ректор будет в ярости.",
        bg: "https://placehold.co/600x800/222/FFF?text=Room",
        speaker: "Макс",
        sprite: "https://placehold.co/300x400/444/FFF?text=Max",
        choices: [
            { text: "Иду, иду...", next: "corridor" },
            { text: "Кто ты такой?", next: "max_joke" }
        ]
    },
    "max_joke": {
        text: "Очень смешно. Я твой сосед, Макс. Ты что, вчера перепил? Погнали!",
        bg: "https://placehold.co/600x800/222/FFF?text=Room",
        speaker: "Макс",
        sprite: "https://placehold.co/300x400/444/FFF?text=Max_Laugh",
        choices: [
            { text: "Ладно, пошли", next: "corridor" }
        ]
    },
    "corridor": {
        text: "Вы выходите в коридор. Вокруг толпы студентов. Но что-то не так...",
        bg: "https://placehold.co/600x800/333/FFF?text=Corridor",
        speaker: "",
        sprite: null,
        choices: [
            { text: "Осмотреться", next: "start" } // Зациклили для теста
        ]
    },
    "game_over_sleep": {
        text: "Ты решил не вставать. Петля замкнулась раньше времени. ТЕБЯ ОТЧИСЛИЛИ ВО СНЕ.",
        bg: "https://placehold.co/600x800/000/FFF?text=Darkness",
        speaker: "СИСТЕМА",
        sprite: null,
        choices: [
            { text: "Начать заново", next: "start" }
        ]
    }
};

// --- ДВИЖОК НОВЕЛЛЫ ---
const StoryEngine = {
    currentScene: null, // Запоминаем текущую сцену

    init: function() {
        console.log("Story Engine Ready");
    },

    start: function() {
        Game.showScreen('story');
        this.loadScene("start");
    },

    // НОВАЯ ФУНКЦИЯ: Продолжить с сохранения
    continueGame: function() {
        const savedScene = localStorage.getItem('student_story_scene');
        if (savedScene && STORY_DATA[savedScene]) {
            Game.showScreen('story');
            this.loadScene(savedScene);
        } else {
            this.start(); // Если сохранения нет, начинаем сначала
        }
    },

    loadScene: function(sceneId) {
        const scene = STORY_DATA[sceneId];
        if (!scene) return;

        this.currentScene = sceneId;
        
        // --- СОХРАНЕНИЕ ---
        // Сохраняем id сцены в память телефона
        localStorage.setItem('student_story_scene', sceneId);

        // 1. Фон
        const storyScreen = document.getElementById('screen-story');
        storyScreen.style.background = `url('${scene.bg}') center/cover no-repeat, #333`;

        // 2. Спрайт
        const spriteEl = document.querySelector('.character-sprite');
        if (scene.sprite) {
            spriteEl.style.backgroundImage = `url('${scene.sprite}')`;
            spriteEl.style.display = 'block';
            spriteEl.classList.remove('fade-in');
            void spriteEl.offsetWidth;
            spriteEl.classList.add('fade-in');
        } else {
            spriteEl.style.display = 'none';
        }

        // 3. Текст и Имя
        document.getElementById('story-text').innerText = scene.text;
        const speakerEl = document.getElementById('story-speaker');
        if (scene.speaker) {
            speakerEl.innerText = scene.speaker;
            speakerEl.style.display = 'block';
        } else {
            speakerEl.style.display = 'none';
        }

        // 4. Кнопки
        const choicesContainer = document.querySelector('.story-choices');
        choicesContainer.innerHTML = '';

        scene.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'btn-choice';
            btn.innerText = choice.text;
            
            btn.onclick = () => {
                // Если выбор ведет к Game Over или концу, можно очищать сохранение
                if (choice.next === 'start') {
                    localStorage.removeItem('student_story_scene');
                }
                this.loadScene(choice.next);
            };
            
            choicesContainer.appendChild(btn);
        });
    },
    
    // Проверка, есть ли сохранение (для меню)
    hasSave: function() {
        return !!localStorage.getItem('student_story_scene');
    }
};

