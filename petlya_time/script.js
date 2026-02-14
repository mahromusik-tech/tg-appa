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
startStory: function() {
        console.log("Запуск Истории...");
        // Делегируем управление движку истории
        StoryEngine.start();
    },
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

        const cardEl = document.querySelector('.card');
        
        // 1. Запускаем анимацию улетания
        if (side === 'left') {
            cardEl.classList.add('swipe-left');
        } else {
            cardEl.classList.add('swipe-right');
        }

        // 2. Применяем эффекты (математика)
        const choice = side === 'left' ? this.currentCard.left : this.currentCard.right;
        const effects = choice.effect;

        for (let key in effects) {
            if (RESOURCES.hasOwnProperty(key)) {
                const val = effects[key];
                RESOURCES[key] += val;
                
                // Ограничиваем
                if (RESOURCES[key] > 100) RESOURCES[key] = 100;
                if (RESOURCES[key] < 0) RESOURCES[key] = 0;

                // Показываем всплывающий текст (визуальный эффект)
                this.showFloatingText(key, val);
            }
        }

        this.updateUI();

        / 3. Ждем окончания анимации (400мс)
    setTimeout(() => {
        // Сначала убираем классы свайпа
        cardEl.classList.remove('swipe-left', 'swipe-right');
        
        // Проверка на проигрыш
        if (this.checkGameOver()) return;

        // Генерируем следующую карту (меняем текст и картинку)
        this.nextCard();
        
        // --- ВОТ ЗДЕСЬ МАГИЯ ПЕРЕЗАПУСКА АНИМАЦИИ ---
        
        // 1. Удаляем анимацию полностью
        cardEl.style.animation = 'none';
        
        // 2. Форсируем перерисовку (браузер обязан это сделать)
        void cardEl.offsetWidth; 
        
        // 3. Возвращаем анимацию появления
        cardEl.style.animation = 'slideIn 0.4s ease-out';

    }, 400); }, // Время должно совпадать с длительностью анимации в CSS (0.4s

    // Новая функция для всплывающих цифр
    showFloatingText: function(resourceKey, value) {
        if (value === 0) return;
        
        const el = document.getElementById('res-' + resourceKey);
        if (!el) return;

        const floatEl = document.createElement('div');
        floatEl.className = 'floating-text ' + (value > 0 ? 'heal' : 'damage');
        floatEl.innerText = (value > 0 ? '+' : '') + value;
        
        // Позиционируем над иконкой ресурса
        const rect = el.getBoundingClientRect();
        floatEl.style.left = rect.left + 'px';
        floatEl.style.top = rect.top + 'px';
        
        document.body.appendChild(floatEl);
        
        // Удаляем элемент через 1 секунду
        setTimeout(() => floatEl.remove(), 1000);
    },

    // Обнови checkGameOver, чтобы он возвращал true/false
    checkGameOver: function() {
        let reason = "";
        if (RESOURCES.hp <= 0) reason = "Вы умерли от истощения.";
        if (RESOURCES.money <= 0) reason = "Вы банкрот.";
        if (RESOURCES.study <= 0) reason = "Вас отчислили.";
        if (RESOURCES.sanity <= 0) reason = "Вы сошли с ума.";

        if (reason) {
            alert("GAME OVER: " + reason);
            this.showScreen('menu');
            return true; // Игра окончена
        }
        return false; // Игра продолжается
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
