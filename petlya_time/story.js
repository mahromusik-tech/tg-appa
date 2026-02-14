// Данные истории
const STORY_DATA = {
    "start": {
        text: "Ты просыпаешься от звонка будильника. На часах 7:00. Сегодня первый день в универе.",
        bg: "https://via.placeholder.com/400x800/333/fff?text=Room", 
        sprite: "", 
        speaker: "",
        choices: [
            { text: "Встать и собраться", next: "kitchen" },
            { text: "Поспать еще 5 минут", next: "late" }
        ]
    },
    "kitchen": {
        text: "На кухне мама готовит завтрак. 'Доброе утро, студент! Волнуешься?'",
        bg: "https://via.placeholder.com/400x800/555/fff?text=Kitchen",
        sprite: "https://via.placeholder.com/300x500/f00/fff?text=Mom",
        speaker: "Мама",
        choices: [
            { text: "Немного", next: "university" },
            { text: "Вообще нет", next: "university" }
        ]
    },
    "late": {
        text: "Ты проспал! Придется бежать без завтрака.",
        bg: "https://via.placeholder.com/400x800/333/fff?text=Room",
        sprite: "",
        speaker: "",
        choices: [
            { text: "Бежать на автобус", next: "university" }
        ]
    },
    "university": {
        text: "Ты стоишь перед огромным зданием университета. Твоя новая жизнь начинается здесь.",
        bg: "https://via.placeholder.com/400x800/777/fff?text=University",
        sprite: "",
        speaker: "",
        choices: [
            { text: "Войти внутрь", next: "start" } // Зацикливаем для теста
        ]
    }
};

const StoryEngine = {
    init: function() {
        console.log("Story Engine Ready");
    },

    start: function() {
        Game.showScreen('story');
        this.loadScene("start");
    },

    loadScene: function(sceneId) {
        const scene = STORY_DATA[sceneId];
        if (!scene) return;

        // 1. Фон
        const storyScreen = document.getElementById('screen-story');
        storyScreen.style.background = `url('${scene.bg}') center/cover no-repeat, #333`;

        // 2. Спрайт
        const spriteEl = document.querySelector('.character-sprite');
        if (scene.sprite) {
            spriteEl.style.backgroundImage = `url('${scene.sprite}')`;
            spriteEl.style.display = 'block';
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
            btn.onclick = () => this.loadScene(choice.next);
            choicesContainer.appendChild(btn);
        });
    }
};
