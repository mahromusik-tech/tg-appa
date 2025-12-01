const Game = {
    user: null,
    data: {
        balance: 1000,
        gamesPlayed: 0,
        wins: 0,
        totalProfit: 0
    },
    // Режимы: 'random' (с RTP), 'win' (всегда победа), 'lose' (всегда слив)
    rigMode: 'random', 
    // RTP 0.9 = 90% возврата игроку в долгосроке (в режиме random)
    rtp: 0.9, 

    init: function() {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        // Имитация входа
        this.user = tg.initDataUnsafe.user || { id: 12345, first_name: "Test User" };
        
        // Загрузка сохранения
        const saved = localStorage.getItem(`user_${this.user.id}`);
        if(saved) this.data = JSON.parse(saved);
        else this.save();

        // Обновляем UI
        document.getElementById('header-username').innerText = this.user.first_name;
        this.updateBalance(0);
        
        // Инициализация модулей
        if(this.Profile) this.Profile.init();
        if(this.Admin) this.Admin.init();
    },

    nav: function(tabName) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // При переходе в профиль обновляем данные
        if(tabName === 'profile' && this.Profile) this.Profile.render();
        // При переходе в админку обновляем данные
        if(tabName === 'admin' && this.Admin) this.Admin.renderUserList();
    },

    updateBalance: function(amount, isWin = false) {
        this.data.balance += amount;
        if(isWin && amount > 0) {
            this.data.wins++;
            this.data.totalProfit += amount;
        }
        if(amount !== 0) this.data.gamesPlayed++;
        
        this.save();
        
        // Обновляем ВЕЗДЕ
        document.getElementById('global-balance').innerText = Math.floor(this.data.balance);
        if(document.getElementById('p-balance')) document.getElementById('p-balance').innerText = Math.floor(this.data.balance);
    },

    save: function() {
        localStorage.setItem(`user_${this.user.id}`, JSON.stringify(this.data));
    },

    showAlert: function(msg) {
        window.Telegram.WebApp.showAlert(msg);
    },

    // ГЛАВНАЯ ФУНКЦИЯ RTP
    // Возвращает true, если игроку "разрешено" выиграть этот раунд
    // potentialWinAmount - сколько игрок может выиграть в этом раунде
    checkRtp: function(potentialWinAmount) {
        if (this.rigMode === 'win') return true;
        if (this.rigMode === 'lose') return false;

        // Простая логика RTP:
        // Если выигрыш слишком большой относительно баланса, уменьшаем шанс
        // В реальном казино считается пул денег, здесь упростим:
        // Просто рандом, но если выигрыш > 50% текущего баланса, шанс режется
        
        let random = Math.random();
        
        // Если выигрыш огромный, шанс должен быть очень мал
        if (potentialWinAmount > this.data.balance * 2) {
            return random > 0.8; // 20% шанс на занос
        }
        
        // Стандартный RTP чек
        return random < this.rtp; 
    }
};

window.onload = () => Game.init();
