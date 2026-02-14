const tg = window.Telegram.WebApp;

// Сообщаем Телеграму, что приложение готово
tg.ready();
// Разворачиваем на весь экран
tg.expand();

// --- КОНФИГУРАЦИЯ АРКАДЫ ---

// Ресурсы игрока
const RESOURCES = {
    hp: 50,
    money: 50,
    study: 50,
    sanity: 50
};

// База данных карточек для Аркады
const CARDS = [
    {
        id: 1,
        text: "Макс зовет прогулять первую пару и пойти в бар.",
        image: "https://placehold.co/300x200/333/FFF?text=Bar",
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
            effect: { money: 0, study: +5, sanity: -5 } 
        }
    }
];
// --- ГЛАВНЫЙ ОБЪЕКТ ИГРЫ ---

const Game = {
    currentScreen: 'menu',
    currentCard: null, // Текущая карточка в аркаде

    // Инициализация
    init: function() {
        // Настройка кнопки "Назад" (системная кнопка Телеграма)
        tg.BackButton.onClick(() => {
            this.showScreen('menu');
        });

        // Навешиваем обработчики на кнопки Аркады (Свайпы)
        const btnLeft = document.querySelector('.btn-swipe.left');
        const btnRight = document.querySelector('.btn-swipe.right');

        if (btnLeft) btnLeft.onclick = () => this.makeChoice('left');
        if (btnRight) btnRight.onclick = () => this.makeChoice('right');
    },

    // Переключение экранов
    showScreen: function(screenName) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        
        // Показываем нужный
        const screenId = 'screen-' + screenName;
        const screenEl = document.getElementById(screenId);
        
        if (screenEl) {
            screenEl.classList.add('active');
        } else {
            console.error(`Экран ${screenName} не найден!`);
            return;
        }
        
        this.currentScreen = screenName;

        // Управление кнопкой "Назад"
        if (screenName === 'menu') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    },

    // --- ЛОГИКА ИСТОРИИ (НОВЕЛЛЫ) ---
    startStory: function() {
        console.log("Запуск Истории...");
        // Проверяем, подключен ли story.js
        if (typeof StoryEngine !== 'undefined') {
            StoryEngine.start(); // Вызываем движок из соседнего файла
        } else {
            alert("Ошибка: файл story.js не подключен!");
        }
    },

    // --- ЛОГИКА АРКАДЫ (REIGNS) ---
    startArcade: function() {
        console.log("Запуск Аркады...");
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
        if (!cardEl) return;

        cardEl.querySelector('.card-text').innerText = this.currentCard.text;
        
        // Картинка
        const imgEl = cardEl.querySelector('.card-image');
imgEl.style.backgroundImage = `url('${this.currentCard.image}')`;
        imgEl.style.backgroundSize = 'cover';

        // Текст кнопок
        document.querySelector('.btn-swipe.left').innerText = this.currentCard.left.text;
        document.querySelector('.btn-swipe.right').innerText = this.currentCard.right.text;
    },

    makeChoice: function(side) {
        if (!this.currentCard) return;

        const cardEl = document.querySelector('.card');
        
        // 1. Запускаем анимацию улетания
        if (side === 'left') {
            cardEl.classList.add('swipe-left');
        } else {
            cardEl.classList.add('swipe-right');
        }

        // 2. Применяем эффекты
        const choice = side === 'left' ? this.currentCard.left : this.currentCard.right;
        const effects = choice.effect;

        for (let key in effects) {
            if (RESOURCES.hasOwnProperty(key)) {
                const val = effects[key];
                RESOURCES[key] += val;
                
                // Ограничиваем от 0 до 100
                if (RESOURCES[key] > 100) RESOURCES[key] = 100;
                if (RESOURCES[key] < 0) RESOURCES[key] = 0;

                // Показываем всплывающий текст
                this.showFloatingText(key, val);
            }
        }

        this.updateUI();

        // 3. Ждем окончания анимации и меняем карту
        setTimeout(() => {
            // Снимаем классы анимации
            cardEl.classList.remove('swipe-left', 'swipe-right');
            
            // Проверка на проигрыш
            if (this.checkGameOver()) return;

            // Следующая карта
            this.nextCard();
            
            // --- ПЕРЕЗАПУСК АНИМАЦИИ ПОЯВЛЕНИЯ ---
            cardEl.style.animation = 'none';
            void cardEl.offsetWidth; // Хак для перерисовки
            cardEl.style.animation = 'slideIn 0.4s ease-out';

        }, 400);
    },

    updateUI: function() {
        document.getElementById('res-hp').innerText = RESOURCES.hp;
        document.getElementById('res-money').innerText = RESOURCES.money;
        document.getElementById('res-study').innerText = RESOURCES.study;
        document.getElementById('res-sanity').innerText = RESOURCES.sanity;
    },

    showFloatingText: function(resourceKey, value) {
        if (value === 0) return;
        
        const el = document.getElementById('res-' + resourceKey);
        if (!el) return;

        const floatEl = document.createElement('div');
        floatEl.className = 'floating-text ' + (value > 0 ? 'heal' : 'damage');
        floatEl.innerText = (value > 0 ? '+' : '') + value;
        
        const rect = el.getBoundingClientRect();
        floatEl.style.left = rect.left + 'px';
        floatEl.style.top = rect.top + 'px';
        
        document.body.appendChild(floatEl);
        
        setTimeout(() => floatEl.remove(), 1000);
    },

    checkGameOver: function() {
        let reason = "";
        if (RESOURCES.hp <= 0) reason = "Вы умерли от истощения.";
        if (RESOURCES.money <= 0) reason = "Вы банкрот.";
        if (RESOURCES.study <= 0) reason = "Вас отчислили.";
        if (RESOURCES.sanity <= 0) reason = "Вы сошли с ума.";

        if (reason) {
            alert("GAME OVER: " + reason);
            this.showScreen('menu');
            return true;
        }
        return false;
    }
};

// Запускаем логику при загрузке
Game.init();
