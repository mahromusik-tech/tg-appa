// Конфигурация ресурсов
const RESOURCES = {
    hp: 50,
    money: 50,
    study: 50,
    sanity: 50
};

// База данных карточек
const CARDS = [
    {
        id: 1,
        text: "Макс зовет прогулять первую пару и пойти в бар.",
        image: "https://placehold.co/300x200/333/FFF?text=Bar", // Заглушка
        left: { 
            text: "Отказаться", 
            effect: { study: +5, sanity: -5 } 
        },
        right: { 
            text: "Пойти", 
            effect: { study: -10, sanity: +10, money: -5 } 
        }
    },
    {
        id: 2,
        text: "Ты нашел кошелек в коридоре. Там 5000 рублей.",
        image: "https://placehold.co/300x200/333/FFF?text=Wallet",
        left: { 
            text: "Оставить себе", 
            effect: { money: +20, sanity: -10 } 
        },
        right: { 
            text: "Отдать вахтерше", 
            effect: { money: 0, sanity: +5, study: +5 } 
        }
    },
    {
        id: 3,
        text: "Скоро сессия. Нужно купить учебники или скачать их пиратскую версию?",
        image: "https://placehold.co/300x200/333/FFF?text=Books",
        left: { 
            text: "Купить", 
            effect: { money: -15, study: +10 } 
        },
        right: { 
            text: "Скачать", 
            effect: { money: 0, study: +5, sanity: -5 } // Вирус на компе?
        }
    }
    ];

const tg = window.Telegram.WebApp;

// Сообщаем Телеграму, что приложение готово
tg.ready();
// Разворачиваем на весь экран
tg.expand();

const Game = {
    currentScreen: 'menu',
    currentCard: null, // Какая карточка сейчас на экране

    // ... (твои старые функции init и showScreen оставляем как есть) ...

    init: function() {
        // Настройка кнопки "Назад"
        tg.BackButton.onClick(() => {
            this.showScreen('menu');
        });
        
        // Навешиваем обработчики на кнопки Аркады
        document.querySelector('.btn-swipe.left').onclick = () => this.makeChoice('left');
        document.querySelector('.btn-swipe.right').onclick = () => this.makeChoice('right');
    },

    showScreen: function(screenName) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        
        // Показываем нужный
        const screenId = 'screen-' + screenName;
        document.getElementById(screenId).classList.add('active');
        
        this.currentScreen = screenName;

        // Управление кнопкой "Назад"
        if (screenName === 'menu') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    },

    // --- ЛОГИКА АРКАДЫ ---

    startArcade: function() {
        this.showScreen('arcade');
        // Сброс ресурсов
        RESOURCES.hp = 50;
        RESOURCES.money = 50;
        RESOURCES.study = 50;
        RESOURCES.sanity = 50;
        this.updateUI();
        this.nextCard();
    },

    nextCard: function() {
        // Берем случайную карточку
        const randomIndex = Math.floor(Math.random() * CARDS.length);
        this.currentCard = CARDS[randomIndex];

        // Обновляем интерфейс
        const cardEl = document.querySelector('.card');
        cardEl.querySelector('.card-text').innerText = this.currentCard.text;
        // Если есть картинка, меняем src (пока заглушка цветом)
        cardEl.querySelector('.card-image').style.backgroundImage = `url('${this.currentCard.image}')`;
        cardEl.querySelector('.card-image').style.backgroundSize = 'cover';

        // Обновляем текст на кнопках
        document.querySelector('.btn-swipe.left').innerText = this.currentCard.left.text;
        document.querySelector('.btn-swipe.right').innerText = this.currentCard.right.text;
    },

    makeChoice: function(side) {
        if (!this.currentCard) return;

        const choice = this.currentCard[side]; // left или right
        const effects = choice.effect;

        // Применяем эффекты
        for (let key in effects) {
            if (RESOURCES.hasOwnProperty(key)) {
                RESOURCES[key] += effects[key];
                // Ограничиваем от 0 до 100
                if (RESOURCES[key] > 100) RESOURCES[key] = 100;
            }
        }

        this.updateUI();
        this.checkGameOver();
        
        // Если игра не закончилась, следующая карта
        if (this.currentScreen === 'arcade') {
            this.nextCard();
        }
    },

    updateUI: function() {
        document.getElementById('res-hp').innerText = RESOURCES.hp;
        document.getElementById('res-money').innerText = RESOURCES.money;
        document.getElementById('res-study').innerText = RESOURCES.study;
        document.getElementById('res-sanity').innerText = RESOURCES.sanity;
    },

    checkGameOver: function() {
        let reason = "";
        if (RESOURCES.hp <= 0) reason = "Вы умерли от истощения.";
        if (RESOURCES.money <= 0) reason = "Вы банкрот. Вас выгнали из общаги.";
        if (RESOURCES.study <= 0) reason = "Вас отчислили за неуспеваемость.";
        if (RESOURCES.sanity <= 0) reason = "Вы сошли с ума.";

        if (reason) {
            alert("GAME OVER: " + reason); // Пока просто алерт
            this.showScreen('menu'); // Возврат в меню
        }
    }
};

// Запуск
Game.init () ;
