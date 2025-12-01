window.Game = {
    tg: window.Telegram.WebApp,
    user: null,
    // Данные текущего игрока
    data: {
        balance: 100,
        gamesPlayed: 0,
        wins: 0,
        totalProfit: 0,
        isBanned: false
    },
    // Глобальный флаг подкрутки: 'none', 'win', 'lose'
    rigMode: 'none',

    init: function() {
        this.tg.expand();
        // Имитация данных пользователя
        this.user = this.tg.initDataUnsafe.user || { id: 111111, first_name: 'Test User', username: 'tester' };
        
        // Загрузка данных
        this.loadData();

        // Инициализация модулей
        if(this.Roulette) this.Roulette.init();
        if(this.Profile) this.Profile.init();
        if(this.Admin) this.Admin.checkAccess();
    },

    loadData: function() {
        // В реальном приложении здесь запрос к серверу
        const saved = localStorage.getItem(`user_${this.user.id}`);
        if(saved) {
            this.data = JSON.parse(saved);
        } else {
            this.saveData(); // Сохраняем дефолт
        }
        
        if(this.data.isBanned) {
            document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50px;">АККАУНТ ЗАБЛОКИРОВАН</h1>';
            throw new Error("Banned");
        }
        this.updateUI();
    },

    saveData: function() {
        localStorage.setItem(`user_${this.user.id}`, JSON.stringify(this.data));
        this.updateUI();
        if(this.Profile) this.Profile.render();
    },

    updateBalance: function(amount, isWin) {
        this.data.balance += amount;
        this.data.gamesPlayed++;
        if(amount > 0) {
            this.data.wins++;
            this.data.totalProfit += amount;
        } else {
            this.data.totalProfit -= Math.abs(amount);
        }
        this.saveData();
    },

    updateUI: function() {
        // Обновляем баланс везде, где он есть
        const els = document.querySelectorAll('#balance, #p-balance');
        els.forEach(el => el.innerText = Math.floor(this.data.balance));
    },

    nav: function(screen, btn) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screen}`).classList.add('active');
        if(btn) {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            btn.classList.add('active');
        }
    },

    showAlert: function(msg) { this.tg.showAlert(msg); }
};

document.addEventListener('DOMContentLoaded', () => Game.init());
