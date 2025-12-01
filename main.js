const App = {
    tg: window.Telegram.WebApp,
    user: null,
    isTelegram: false, // Флаг: мы в телеграме или в браузере?
    
    // Состояние приложения по умолчанию
    state: {
        balance: 1000,
        gamesPlayed: 0,
        wins: 0,
        loses: 0,
        totalProfit: 0,
        crashHistory: []
    },

    init: async function() {
        console.log("App initializing...");
        
        // 1. Проверяем окружение
        if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
            this.isTelegram = true;
            this.user = this.tg.initDataUnsafe.user;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
        } else {
            console.warn("Telegram environment not detected. Using Mock Data.");
            this.isTelegram = false;
            this.user = { id: 'test_user', first_name: 'Test Player', photo_url: null };
        }

        // 2. Загружаем данные (Cloud или Local)
        await this.loadData();
        
        // 3. Убираем экран загрузки
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = 'none';
        
        // 4. Рендерим интерфейс
        this.updateUI();
        
        // 5. Инициализируем модули игр, если они загружены
        if(window.Roulette && window.Roulette.init) window.Roulette.init();
        if(window.Crash && window.Crash.init) window.Crash.init();

        console.log("App ready. Balance:", this.state.balance);
    },

    // --- СИСТЕМА ХРАНЕНИЯ ДАННЫХ ---

    storageGet: function(key) {
        return new Promise((resolve) => {
            if (this.isTelegram) {
                // Используем Telegram Cloud
                this.tg.CloudStorage.getItem(key, (err, val) => {
                    if(err) { 
                        console.error("CloudStorage Error:", err); 
                        resolve(null); 
                    } else {
                        resolve(val);
                    }
                });
            } else {
                // Используем LocalStorage браузера
                const val = localStorage.getItem(key);
                resolve(val);
            }
        });
    },

    storageSet: function(key, val) {
        if (this.isTelegram) {
            this.tg.CloudStorage.setItem(key, val, (err) => {
                if(err) console.error('Cloud Save error:', err);
            });
        } else {
            localStorage.setItem(key, val);
        }
    },

    loadData: async function() {
        const key = `user_data_${this.user.id}`;
        const raw = await this.storageGet(key);
        
        if(raw) {
            try {
                const data = JSON.parse(raw);
                // Объединяем с дефолтным состоянием (на случай добавления новых полей)
                this.state = { ...this.state, ...data };
                console.log("Data loaded:", this.state);
            } catch(e) { 
                console.error('JSON Parse error', e); 
            }
        } else {
            console.log("New user, saving default data.");
            this.saveData();
        }
    },

    saveData: function() {
        const key = `user_data_${this.user.id}`;
        this.storageSet(key, JSON.stringify(this.state));
    },

    // --- ЛОГИКА БАЛАНСА ---

    updateBalance: function(amount, isWin) {
        this.state.balance += amount;
        
        if(amount !== 0) {
            // Если это не просто обновление, а игровое действие
            if (amount < 0) {
                // Ставка
                // (игры сыграно увеличиваем только по факту результата, или здесь - зависит от логики)
            } else {
                // Выигрыш
                this.state.totalProfit += amount;
            }
        }

        // Обновляем счетчики статистики
        if (isWin) {
            this.state.wins++;
            this.state.gamesPlayed++;
        } else if (amount === 0 && isWin === false) {
            // Это маркер проигрыша (мы передаем 0, false)
            this.state.loses++;
            this.state.gamesPlayed++;
        }

        this.saveData();
        this.updateUI();
    },

    // --- ИНТЕРФЕЙС ---

    updateUI: function() {
        // Шапка
        const balEl = document.getElementById('balance-display');
        if(balEl) balEl.innerText = Math.floor(this.state.balance);

        const nameEl = document.getElementById('header-username');
        if(nameEl) nameEl.innerText = this.user.first_name;

        const avaEl = document.getElementById('header-avatar');
        if(avaEl) {
            if(this.user.photo_url) {
                avaEl.src = this.user.photo_url;
                avaEl.style.display = 'block';
            } else {
                avaEl.style.display = 'none';
            }
        }

        // Если открыт профиль, обновляем и его
        if(document.getElementById('view-profile').classList.contains('active')) {
            if(window.Profile) Profile.render();
        }
    },

    nav: function(viewId) {
        // Скрываем все view
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        
        // Показываем нужный
        const target = document.getElementById(`view-${viewId}`);
        if(target) {
            target.classList.add('active');
        } else {
            console.error(`View ${viewId} not found`);
        }
        
        // Спец. действия
        if(viewId === 'profile' && window.Profile) Profile.render();
    },

    showAlert: function(msg) {
        if (this.isTelegram) {
            this.tg.showAlert(msg);
        } else {
            alert(msg);
        }
    },

    // --- RTP (Return to Player) ---
    checkRtp: function(potentialWin) {
        // Защита от бесконечного фарма
        if(this.state.balance < 100) return Math.random() > 0.2; // Шанс 80% если бедный
        if(potentialWin > this.state.balance * 0.5) return Math.random() > 0.7; // Шанс 30% если крупный куш
        return Math.random() > 0.3; // Стандартный шанс 70%
    }
};

// Запуск при загрузке страницы
window.onload = () => App.init();
