const tg = window.Telegram.WebApp;
tg.expand();

const Game = {
    state: {
        hp: 50,
        money: 50,
        study: 50,
        sanity: 50,
        day: 1
    },
    currentCard: null,
    isAnimating: false, // Блокировка нажатий во время анимации

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
        this.state = { hp: 50, money: 50, study: 50, sanity: 50, day: 1 };
        this.showScreen('arcade');
        this.updateResources();
        this.nextCard();
    },

    restartArcade: function() {
        document.getElementById('modal-gameover').classList.remove('active');
        this.startArcade();
    },

    updateResources: function() {
        // Просто обновляем текст
        document.getElementById('res-hp').innerText = Math.floor(this.state.hp);
        document.getElementById('res-money').innerText = Math.floor(this.state.money);
        document.getElementById('res-study').innerText = Math.floor(this.state.study);
        document.getElementById('res-sanity').innerText = Math.floor(this.state.sanity);
        document.getElementById('day-count').innerText = this.state.day;
    },

    nextCard: function() {
        const scenarios = [
            { text: "Пара в 8 утра. Идти?", yes: { study: 10, sanity: -10 }, no: { study: -10, sanity: 5 } },
            { text: "Друзья зовут в бар.", yes: { money: -20, sanity: 20 }, no: { money: 0, sanity: -5 } },
            { text: "Купить доширак?", yes: { money: -5, hp: 5 }, no: { hp: -5 } },
            { text: "Сессия близко. Ботать всю ночь?", yes: { study: 15, sanity: -15, hp: -5 }, no: { study: -10, hp: 5 } },
            { text: "Нашел 1000 рублей!", yes: { money: 20 }, no: { sanity: -5 } }
        ];
        
        this.currentCard = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        const card = document.querySelector('.card');
        // Сброс анимации перед показом новой карты
        card.style.transition = 'none';
        card.classList.remove('swipe-left', 'swipe-right');
        card.style.transform = 'translateY(50px)';
        card.style.opacity = '0';

        // Небольшая задержка для плавного появления
        setTimeout(() => {
            card.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
            document.querySelector('.card-text').innerText = this.currentCard.text;
        }, 50);
        
        this.isAnimating = false;
    },

    applyChoice: function(isYes) {
        if (this.isAnimating) return; // Защита от двойного клика
        this.isAnimating = true;

        const card = document.querySelector('.card');
        
        // 1. Анимация улетания
        if (isYes) {
            card.classList.add('swipe-right');
        } else {
            card.classList.add('swipe-left');
        }

        // 2. Ждем пока улетит, потом считаем математику
        setTimeout(() => {
            this.processTurn(isYes);
        }, 300);
    },

    processTurn: function(isYes) {
        const effects = isYes ? this.currentCard.yes : this.currentCard.no;
        
        // Применяем эффекты
        for (let key in effects) {
            if (this.state.hasOwnProperty(key)) {
                const change = effects[key];
                this.state[key] += change;
                
                // Визуализация (+5 / -10)
                this.showFloatingText(key, change);

                // Ограничения
                if (this.state[key] > 100) this.state[key] = 100;
                if (this.state[key] < 0) this.state[key] = 0;
            }
        }

        this.state.day += 1;
        this.updateResources(); // Сначала обновляем цифры (чтобы увидеть 0)

        // Проверка на смерть с небольшой задержкой, чтобы игрок осознал, что случилось
        if (this.checkGameOver()) {
            return;
        }

        this.nextCard();
    },

    showFloatingText: function(resourceKey, value) {
        if (value === 0) return;

        // Находим иконку ресурса на экране
        const iconId = 'res-' + resourceKey;
        const iconElement = document.getElementById(iconId);
        
        if (!iconElement) return;

        const rect = iconElement.getBoundingClientRect();
        
        // Создаем летающий текст
        const el = document.createElement('div');
        el.className = `floating-text ${value > 0 ? 'positive' : 'negative'}`;
        el.innerText = (value > 0 ? '+' : '') + value;
        
        // Позиционируем прямо над иконкой
        el.style.left = (rect.left + 10) + 'px';
        el.style.top = (rect.top - 20) + 'px';
        
        document.body.appendChild(el);

        // Удаляем элемент после анимации
        setTimeout(() => {
            el.remove();
        }, 1500);
    },

    checkGameOver: function() {
        let reason = "";
        
        // Важно: проверяем текущее состояние
        if (this.state.hp <= 0) reason = "Здоровье кончилось. Ты в реанимации.";
        else if (this.state.money <= 0) reason = "Деньги кончились. Ты умер от голода под мостом.";
        else if (this.state.sanity <= 0) reason = "Рассудок потерян. Привет, дурка.";
        else if (this.state.study <= 0) reason = "Отчислен. Сапоги уже ждут тебя.";

        if (reason) {
            // Задержка перед показом окна смерти, чтобы увидеть нули
            setTimeout(() => {
                this.showGameOver(reason);
            }, 500);
            return true;
        }
        return false;
    },

    showGameOver: function(reason) {
        document.getElementById('gameover-reason').innerText = reason;
        document.getElementById('final-days').innerText = this.state.day;
        document.getElementById('modal-gameover').classList.add('active');
    },

    initSwipe: function() {
        const btnLeft = document.querySelector('.btn-swipe.left');
        const btnRight = document.querySelector('.btn-swipe.right');

        btnLeft.onclick = () => this.applyChoice(false);
        btnRight.onclick = () => this.applyChoice(true);
    },

    // --- ИСТОРИЯ ---
        // --- ИСТОРИЯ ---
    startStory: function() {
        // Сначала показываем экран
        this.showScreen('story');
        // Потом запускаем движок
        if (typeof StoryEngine !== 'undefined') {
            StoryEngine.start();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
