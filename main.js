// Глобальный объект игры
window.Game = {
    tg: window.Telegram.WebApp,
    balance: 100,
    user: null,

    init: function() {
        this.tg.expand();
        this.user = this.tg.initDataUnsafe.user || { first_name: 'Test User' };
        document.getElementById('username').innerText = this.user.first_name;
        
        this.loadBalance();
        
        // Инициализация модулей
        if(this.Roulette) this.Roulette.init();
        if(this.Mines) this.Mines.init();
    },

    loadBalance: function() {
        this.tg.CloudStorage.getItem('balance', (err, value) => {
            if (!err && value) {
                this.balance = parseFloat(value);
            } else {
                this.saveBalance(100); // Стартовый баланс
            }
            this.updateUI();
        });
    },

    saveBalance: function(newVal) {
        this.balance = newVal;
        this.tg.CloudStorage.setItem('balance', newVal.toString(), (err) => {
            if (err) console.error('Save error', err);
        });
        this.updateUI();
    },

    updateUI: function() {
        document.getElementById('balance').innerText = Math.floor(this.balance);
    },

    nav: function(screenName, btn) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenName}`).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        if(btn) btn.classList.add('active');
    },

    showAlert: function(msg) {
        this.tg.showAlert(msg);
    },
    
    haptic: function(type) {
        if(type === 'success') this.tg.HapticFeedback.notificationOccurred('success');
        else if(type === 'error') this.tg.HapticFeedback.notificationOccurred('error');
        else this.tg.HapticFeedback.impactOccurred('light');
    }
};

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => Game.init());
