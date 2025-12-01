const Game = {
    user: null,
    // ID Админа (только этот ID видит панель)
    ADMIN_ID: 7845891364, 
    
    data: {
        balance: 1000,
        gamesPlayed: 0,
        wins: 0,
        mode: 'random', // 'random', 'win', 'lose'
        isBanned: false
    },

    init: function() {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        // Получаем данные пользователя из Telegram
        this.user = tg.initDataUnsafe.user || { id: 12345, first_name: "Test User" };
        
        // Если это админ, подменяем ID для теста (если нужно) или используем реальный
        // this.user.id = 7845891364; // Раскомментируйте для теста админки в браузере

        // Загрузка данных
        this.load();

        // Проверка бана
        if (this.data.isBanned) {
            document.getElementById('banned-screen').style.display = 'flex';
            return; // Останавливаем выполнение
        }

        // Обновляем UI
        document.getElementById('header-username').innerText = this.user.first_name;
        this.updateBalance(0);

        // Проверка на админа
        if (this.user.id == this.ADMIN_ID) {
            document.getElementById('admin-entry-btn').style.display = 'block';
        }
        
        // Инициализация модулей
        if(this.Profile) this.Profile.init();
    },

    nav: function(tabName) {
        if (this.data.isBanned) return;
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        if(tabName === 'profile' && this.Profile) this.Profile.render();
        if(tabName === 'admin' && this.Admin) this.Admin.init();
    },

    updateBalance: function(amount, isWin = false) {
        this.data.balance += amount;
        if(isWin && amount > 0) this.data.wins++;
        if(amount !== 0) this.data.gamesPlayed++;
        
        this.save();
        
        // Обновление UI
        document.getElementById('global-balance').innerText = Math.floor(this.data.balance);
        if(document.getElementById('p-balance')) document.getElementById('p-balance').innerText = Math.floor(this.data.balance);
    },

    save: function() {
        localStorage.setItem(`user_${this.user.id}`, JSON.stringify(this.data));
    },

    load: function() {
        const saved = localStorage.getItem(`user_${this.user.id}`);
        if(saved) {
            this.data = JSON.parse(saved);
            // Миграция старых данных (если не было поля mode)
            if(!this.data.mode) this.data.mode = 'random';
            if(this.data.isBanned === undefined) this.data.isBanned = false;
        } else {
            this.save();
        }
    },

    showAlert: function(msg) {
        window.Telegram.WebApp.showAlert(msg);
    },

    // ПРОВЕРКА РЕЗУЛЬТАТА (RTP)
    // Теперь зависит от this.data.mode конкретного игрока
    checkWinCondition: function(potentialWin) {
        const mode = this.data.mode;

        if (mode === 'win') return true;  // Всегда победа
        if (mode === 'lose') return false; // Всегда проигрыш

        // Режим Random (Честный)
        // Если выигрыш очень большой, уменьшаем шанс
        if (potentialWin > this.data.balance * 3) {
            return Math.random() > 0.7;
        }
        return Math.random() > 0.1; // 90% RTP
    }
};

window.onload = () => Game.init();
