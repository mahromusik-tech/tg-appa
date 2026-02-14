const tg = window.Telegram.WebApp;
tg.expand();

const Game = {
    state: {
        hp: 50,
        money: 50,
        study: 50,
        sanity: 50,
        day: 1 // Добавили счетчик дней
    },
    currentCard: null,

    init: function() {
        tg.BackButton.onClick(() => {
            this.showScreen('menu');
        });
        this.initSwipe();
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
        // Сброс при старте новой игры
        this.state = { hp: 50, money: 50, study: 50, sanity: 50, day: 1 };
        this.showScreen('arcade');
        this.updateResources();
        this.nextCard();
    },

    // Перезапуск из окна Game Over
    restartArcade: function() {
        document.getElementById('modal-gameover').classList.remove('active');
        this.startArcade();
    },

    updateResources: function() {
        document.getElementById('res-hp').innerText = Math.floor(this.state.hp);
        document.getElementById('res-money').innerText = Math.floor(this.state.money);
        document.getElementById('res-study').innerText = Math.floor(this.state.study);
        document.getElementById('res-sanity').innerText = Math.floor(this.state.sanity);
        
        // Обновляем день
        document.getElementById('day-count').innerText = this.state.day;
    },

    nextCard: function() {
        const scenarios = [
            { text: "Пара в 8 утра. Идти?", yes: { study: 10, sanity: -10 }, no: { study: -10, sanity: 5 } },
            { text: "Друзья зовут пить пиво.", yes: { money: -20, sanity: 20 }, no: { money: 0, sanity: -5 } },
            { text: "Купить доширак?", yes: { money: -5, hp: 5 }, no: { hp: -5 } },
            { text: "Препод валит на экзамене. Дать взятку?", yes: { money: -30, study: 20 }, no: { study: -20 } },
            { text: "Нашел 100 рублей на полу.", yes: { money: 10 }, no: { sanity: -5 } }
        ];
        this.currentCard = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        document.querySelector('.card-text').innerText = this.currentCard.text;
        this.updateResources();
    },

    applyChoice: function(isYes) {
        const effects = isYes ? this.currentCard.yes : this.currentCard.no;
        
        for (let key in effects) {
            if (this.state.hasOwnProperty(key)) {
                this.state[key] += effects[key];
                if (this.state[key] > 100) this.state[key] = 100;
                if (this.state[key] < 0) this.state[key] = 0;
            }
        }

        // Увеличиваем день (каждая карта = полдня или день, давай считать как 1 день)
        this.state.day += 1;
        
        this.updateResources();

        if (this.checkGameOver()) {
            return;
        }
        
        this.nextCard();
    },

    checkGameOver: function() {
        let reason = "";
        if (this.state.hp <= 0) reason = "Здоровье на нуле. Ты попал в больницу и вылетел из универа.";
        else if (this.state.money <= 0) reason = "Ты банкрот. Пришлось бросить учебу и идти работать на завод.";
        else if (this.state.sanity <= 0) reason = "Кукуха поехала. Тебя увезли в желтый дом.";
        else if (this.state.study <= 0) reason = "Отчисление. Военком уже стучится в дверь.";

        if (reason) {
            this.showGameOver(reason);
            return true;
        }
        return false;
    },

    showGameOver: function(reason) {
        // Заполняем текст
        document.getElementById('gameover-reason').innerText = reason;
        document.getElementById('final-days').innerText = this.state.day;
        
        // Показываем окно
        document.getElementById('modal-gameover').classList.add('active');
    },

    initSwipe: function() {
        const btnLeft = document.querySelector('.btn-swipe.left');
        const btnRight = document.querySelector('.btn-swipe.right');

        // Удаляем старые обработчики, чтобы не дублировались (на всякий случай)
        btnLeft.onclick = null;
        btnRight.onclick = null;

        btnLeft.onclick = () => this.applyChoice(false);
        btnRight.onclick = () => this.applyChoice(true);
    },

    // --- ИСТОРИЯ ---
    startStory: function() {
        StoryEngine.start();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
