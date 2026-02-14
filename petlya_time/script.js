const tg = window.Telegram.WebApp;

// Сообщаем Телеграму, что приложение готово
tg.ready();
// Разворачиваем на весь экран
tg.expand();

// Объект для управления состоянием игры
const Game = {
    currentScreen: 'menu',

    // Инициализация
    init: function() {
        // Настройка кнопки "Назад" (системная кнопка Телеграма)
        tg.BackButton.onClick(() => {
            this.showScreen('menu');
        });
    },

    // Переключение экранов
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

    // Запуск режима Истории
    startStory: function() {
        console.log("Запуск Истории...");
        this.showScreen('story');
        // Здесь потом будет код загрузки сценария
    },

    // Запуск режима Аркады
    startArcade: function() {
        console.log("Запуск Аркады...");
        this.showScreen('arcade');
        // Здесь потом будет код генерации карточек
    }
};

// Запускаем логику при загрузке
Game.init();
