const App = {
    tg: window.Telegram.WebApp,
    user: null,
    
    // Состояние приложения
    state: {
        balance: 1000,
        gamesPlayed: 0,
        wins: 0,
        loses: 0,
        crashHistory: [] // Храним историю краша
    },

    init: async function() {
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        
        // Получаем данные юзера
        this.user = this.tg.initDataUnsafe.user || { id: 'test', first_name: 'Test User' };
        
        // Загружаем данные из CloudStorage
        await this.loadData();
        
        // Убираем лоадер
        document.getElementById('loader').style.display = 'none';
        
        // Рендер UI
        this.updateUI();
        
        // Инициализация модулей
        if(window.Roulette) Roulette.init();
        if(window.Crash) Crash.init();
    },

    // Обертка над CloudStorage (Promisified)
    storageGet: function(key) {
        return new Promise((resolve) => {
            this.tg.CloudStorage.getItem(key, (err, val) => {
                if(err) { console.error(err); resolve(null); }
                else resolve(val);
            });
        });
    },

    storageSet: function(key, val) {
        this.tg.CloudStorage.setItem(key, val, (err) => {
            if(err) console.error('Save error:', err);
        });
    },

    loadData: async function() {
        const raw = await this.storageGet(`user_data_${this.user.id}`);
        if(raw) {
            try {
                const data = JSON.parse(raw);
                this.state = { ...this.state, ...data };
            } catch(e) { console.error('Parse error', e); }
        } else {
            // Первый запуск - сохраняем дефолт
            this.saveData();
        }
    },

    saveData: function() {
        this.storageSet(`user_data_${this.user.id}`, JSON.stringify(this.state));
    },

    // Обновление баланса и статистики
    updateBalance: function(amount, isWin) {
        this.state.balance += amount;
        if(amount !== 0) this.state.gamesPlayed++;
        
        if(isWin) this.state.wins++;
        else if(amount < 0 && !isWin) { /* Ставка */ } 
        else if(amount === 0 && !isWin) this.state.loses++; // Проигрыш в игре

        this.saveData();
        this.updateUI();
    },

    updateUI: function() {
        // Шапка
        document.getElementById('balance-display').innerText = Math.floor(this.state.balance);
        document.getElementById('header-username').innerText = this.user.first_name;
        if(this.user.photo_url) document.getElementById('header-avatar').src = this.user.photo_url;

        // Профиль
        if(window.Profile) Profile.render();
    },

    nav: function(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        
        if(viewId === 'profile') Profile.render();
    },

    showAlert: function(msg) {
        this.tg.showAlert(msg);
    },

    // RTP SYSTEM (Anti-Infinite Win)
    // Возвращает true (можно выиграть) или false (слив)
    checkRtp: function(potentialWin) {
        // 1. Если баланс маленький, даем выиграть чаще
        if(this.state.balance < 500) return Math.random() > 0.3; 
        
        // 2. Если выигрыш огромный (> 50% баланса), шанс маленький
        if(potentialWin > this.state.balance * 0.5) return Math.random() > 0.7;

        // 3. Стандартный RTP 85%
        return Math.random() > 0.15;
    }
};

// Запуск
window.onload = () => App.init();
