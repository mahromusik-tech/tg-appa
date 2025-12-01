const App = {
    tg: window.Telegram.WebApp,
    user: null,
    state: {
        balance: 1000,
        gamesPlayed: 0,
        wins: 0,
        loses: 0
    },

    init: async function() {
        // 1. Получаем пользователя
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
            this.user = this.tg.initDataUnsafe.user;
        } else {
            // Тестовый режим для браузера
            this.user = { id: 123456, first_name: "Test User", photo_url: null };
        }

        // 2. Загружаем данные
        const saved = localStorage.getItem(`user_${this.user.id}`);
        if (saved) {
            this.state = JSON.parse(saved);
        }

        // 3. Обновляем UI
        this.updateUI();
        
        // 4. Инициализируем рулетку (ВАЖНО)
        if(window.Roulette) window.Roulette.init();

        this.tg.expand();
    },

    saveData: function() {
        localStorage.setItem(`user_${this.user.id}`, JSON.stringify(this.state));
    },

    updateBalance: function(amount, isWin) {
        this.state.balance += amount;
        if(amount !== 0) this.state.gamesPlayed++;
        if(isWin) this.state.wins++;
        else if(amount === 0 && !isWin) this.state.loses++;
        
        this.saveData();
        this.updateUI();
    },

    updateUI: function() {
        // Шапка
        document.getElementById('balance-display').innerText = Math.floor(this.state.balance);
        document.getElementById('header-username').innerText = this.user.first_name;
        
        const ava = document.getElementById('header-avatar');
        if(this.user.photo_url) {
            ava.src = this.user.photo_url;
            ava.style.display = 'block';
        }

        // Если мы в профиле - обновляем его принудительно
        if(document.getElementById('view-profile').classList.contains('active')) {
            Profile.render();
        }
    },

    nav: function(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        
        if(viewId === 'profile') Profile.render();
    },

    showAlert: function(msg) {
        this.tg.showAlert ? this.tg.showAlert(msg) : alert(msg);
    },

    checkRtp: function(win) {
        return Math.random() > 0.3; // 70% шанс на успех (упрощено)
    },

    // --- ПОПОЛНЕНИЕ ---
    openDepositModal: function() {
        document.getElementById('deposit-modal').style.display = 'flex';
    },

    createInvoice: function() {
        const amount = parseInt(document.getElementById('dep-amount').value);
        if(!amount || amount <= 0) return;

        // В РЕАЛЬНОМ ПРИЛОЖЕНИИ: Здесь запрос к вашему серверу -> CryptoBot API -> Получение ссылки
        // СЕЙЧАС (СИМУЛЯЦИЯ):
        
        this.showAlert(`Создан счет на ${amount} монет. (Симуляция)`);
        
        // Открываем CryptoBot (ссылка на бота)
        this.tg.openTelegramLink("https://t.me/CryptoBot");
        
        // Начисляем баланс (для теста)
        setTimeout(() => {
            if(confirm("Симуляция: Оплата прошла успешно?")) {
                this.updateBalance(amount, false); // false = не считается победой в стате
                document.getElementById('deposit-modal').style.display = 'none';
            }
        }, 2000);
    }
};

window.onload = () => App.init();
