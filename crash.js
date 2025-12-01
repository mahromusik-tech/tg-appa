const Crash = {
    isRunning: false,
    multiplier: 1.00,
    crashPoint: 0,
    bet: 0,
    hasBet: false,
    interval: null,

    init: function() {
        this.renderHistory();
    },

    action: function() {
        if(this.isRunning) {
            // Забрать
            if(this.hasBet) this.cashout();
        } else {
            // Старт
            this.startRound();
        }
    },

    startRound: function() {
        const betInput = parseInt(document.getElementById('crash-bet').value);
        if(isNaN(betInput) || betInput <= 0) return App.showAlert("Неверная ставка");
        if(betInput > App.state.balance) return App.showAlert("Недостаточно средств");

        App.updateBalance(-betInput, false);
        this.bet = betInput;
        this.hasBet = true;
        
        // Определяем точку краша (RTP)
        this.crashPoint = this.getCrashPoint();
        
        this.isRunning = true;
        this.multiplier = 1.00;
        
        // UI
        const btn = document.getElementById('btn-crash-action');
        btn.innerText = "ЗАБРАТЬ";
        btn.style.background = "#00ff88";
        btn.style.color = "#000";
        document.getElementById('crash-bet').disabled = true;
        document.getElementById('crash-number').classList.remove('crashed'); // (если добавите класс красного текста)

        this.interval = setInterval(() => this.tick(), 50);
    },

    tick: function() {
        this.multiplier += 0.01 + (this.multiplier * 0.004); // Экспоненциальный рост
        
        document.getElementById('crash-number').innerText = this.multiplier.toFixed(2) + 'x';
        
        // Двигаем ракету
        const rocket = document.getElementById('crash-rocket');
        // Простая визуализация: чем больше кэф, тем выше и правее
        // Ограничиваем движение 90% контейнера
        let progress = Math.min(1, (this.multiplier - 1) / 5); // 5x - это "потолок" анимации
        rocket.style.bottom = (10 + progress * 200) + 'px';
        rocket.style.left = (10 + progress * 250) + 'px';

        if(this.multiplier >= this.crashPoint) {
            this.crash();
        }
    },

    crash: function() {
        clearInterval(this.interval);
        this.isRunning = false;
        
        document.getElementById('crash-number').style.color = '#ff4757';
        document.getElementById('crash-number').innerText = `CRASHED @ ${this.crashPoint.toFixed(2)}x`;
        
        if(this.hasBet) {
            App.updateBalance(0, false); // Луз
            App.showAlert(`Вы разбились! -${this.bet}`);
        }
        this.hasBet = false;

        // Сохраняем историю
        if(!App.state.crashHistory) App.state.crashHistory = [];
        App.state.crashHistory.unshift(this.crashPoint);
        if(App.state.crashHistory.length > 10) App.state.crashHistory.pop();
        App.saveData(); // Сохраняем в облако
        
        this.renderHistory();
        this.resetUI();
    },

    cashout: function() {
        if(!this.hasBet || !this.isRunning) return;
        
        const win = Math.floor(this.bet * this.multiplier);
        App.updateBalance(win, true);
        App.showAlert(`Забрал: ${win} (${this.multiplier.toFixed(2)}x)`);
        
        this.hasBet = false;
        document.getElementById('btn-crash-action').innerText = "ЖДЕМ КРАШ...";
        document.getElementById('btn-crash-action').disabled = true;
    },

    getCrashPoint: function() {
        // RTP логика
        // 1. Шанс мгновенного краша (1.00 - 1.10)
        if(Math.random() < 0.3) return 1.00 + Math.random() * 0.1;
        
        // 2. Если RTP говорит "не давать выиграть много"
        if(!App.checkRtp(this.bet * 2)) {
            return 1.1 + Math.random() * 0.8; // Краш до 1.9x
        }

        // 3. Нормальный рандом (экспоненциальное распределение)
        // Генерируем число от 1 до 100+
        // E = 1 / (1-p)
        const r = Math.random();
        let crash = 0.99 / (1 - r);
        if(crash > 100) crash = 100; // Кап
        
        return Math.max(1.01, crash);
    },

    resetUI: function() {
        const btn = document.getElementById('btn-crash-action');
        btn.innerText = "СТАРТ";
        btn.style.background = "";
        btn.style.color = "";
        btn.disabled = false;
        document.getElementById('crash-bet').disabled = false;
        document.getElementById('crash-number').style.color = '#fff';
        
        // Сброс ракеты
        const rocket = document.getElementById('crash-rocket');
        rocket.style.transition = '0.5s';
        rocket.style.bottom = '10px';
        rocket.style.left = '10px';
        setTimeout(() => rocket.style.transition = '0.1s linear', 500);
    },

    renderHistory: function() {
        const list = document.getElementById('crash-history-list');
        if(!App.state.crashHistory) return;
        
        list.innerHTML = '';
        App.state.crashHistory.forEach(val => {
            let el = document.createElement('div');
            el.className = `crash-badge ${val >= 2 ? 'good' : 'bad'}`;
            el.innerText = val.toFixed(2) + 'x';
            list.appendChild(el);
        });
    }
};
