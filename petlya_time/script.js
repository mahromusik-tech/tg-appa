const tg = window.Telegram.WebApp;
tg.expand();

const Game = {
    state: {
        hp: 50,
        money: 50,
        study: 50,
        sanity: 50
    },
    currentCard: null,

    init: function() {
        // Настройка кнопки "Назад"
        tg.BackButton.onClick(() => {
            this.showScreen('menu');
        });
        
        // Инициализация свайпов для Аркады
        this.initSwipe();
        
        // Инициализация Истории
        if (typeof StoryEngine !== 'undefined') {
            StoryEngine.init();
        }
    },

    showScreen: function(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-' + screenName).classList.add('active');

        if (screenName === 'menu') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    },

    // --- АРКАДА ---
    startArcade: function() {
        this.showScreen('arcade');
        this.nextCard();
    },

    updateResources: function() {
        document.getElementById('res-hp').innerText = this.state.hp;
        document.getElementById('res-money').innerText = this.state.money;
        document.getElementById('res-study').innerText = this.state.study;
        document.getElementById('res-sanity').innerText = this.state.sanity;
    },

    nextCard: function() {
        // Простая генерация карточки (заглушка)
        const scenarios = [
            { text: "Пара в 8 утра. Идти?", yes: { study: 10, sanity: -10 }, no: { study: -10, sanity: 5 } },
            { text: "Друзья зовут пить пиво.", yes: { money: -20, sanity: 20 }, no: { money: 0, sanity: -5 } },
            { text: "Купить доширак?", yes: { money: -5, hp: 5 }, no: { hp: -5 } }
        ];
        this.currentCard = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        document.querySelector('.card-text').innerText = this.currentCard.text;
        this.updateResources();
    },

    applyChoice: function(isYes) {
        const effects = isYes ? this.currentCard.yes : this.currentCard.no;
        
        for (let key in effects) {
            this.state[key] += effects[key];
            // Ограничения 0-100
            if (this.state[key] > 100) this.state[key] = 100;
            if (this.state[key] < 0) this.state[key] = 0;
        }
        
        this.nextCard();
    },

    initSwipe: function() {
        const btnLeft = document.querySelector('.btn-swipe.left');
        const btnRight = document.querySelector('.btn-swipe.right');

        btnLeft.onclick = () => this.applyChoice(false);
        btnRight.onclick = () => this.applyChoice(true);
    },

    // --- ИСТОРИЯ ---
    startStory: function() {
        StoryEngine.start();
    }
};

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
