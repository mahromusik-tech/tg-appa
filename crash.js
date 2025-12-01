Game.Crash = {
    isRunning: false,
    multiplier: 1.00,
    interval: null,
    bet: 0,
    crashedAt: 0,
    hasBet: false, // Сделал ли игрок ставку в этом раунде
    isWaiting: false, // Ожидаем ли мы начала нового раунда

    action: function() {
        const btn = document.getElementById('crash-btn');
        
        if (this.isWaiting) {
            Game.showAlert("Дождитесь начала нового раунда.");
            return;
        }

        if (!this.isRunning) {
            // СТАРТ ИГРЫ / СТАВКА НА СЛЕДУЮЩИЙ РАУНД
            let betInput = parseInt(document.getElementById('c-bet').value);
            if (isNaN(betInput) || betInput <= 0) return Game.showAlert("Неверная ставка");
            if (betInput > Game.data.balance) return Game.showAlert("Нет денег");

            Game.updateBalance(-betInput, false);
            this.bet = betInput;
            this.hasBet = true;
            btn.innerText = "Ожидание старта...";
            btn.disabled = true;
            this.isWaiting = true; // Игрок сделал ставку и ждет
            
            // Если игра не запущена, запускаем её (или ждем)
            if (!this.interval) {
                this.startNewRoundDelay();
            }

        } else {
            // ЗАБРАТЬ (CASHOUT)
            if (this.hasBet) {
                let win = Math.floor(this.bet * this.multiplier);
                Game.updateBalance(win, true);
                Game.showAlert(`Забрал: ${win} (x${this.multiplier.toFixed(2)})`);
                this.hasBet = false; // Больше забрать нельзя
                btn.innerText = "Забрано!";
                btn.disabled = true;
            }
        }
    },

    startNewRoundDelay: function() {
        document.getElementById('crash-counter').innerText = "Ожидание...";
        document.getElementById('crash-rocket').style.bottom = '10px';
        document.getElementById('crash-rocket').style.left = '10px';
        document.querySelector('.crash-screen').classList.remove('crashed');

        setTimeout(() => {
            this.startGame();
        }, 3000); // Задержка 3 секунды перед стартом
    },

    startGame: function() {
        this.isRunning = true;
        this.multiplier = 1.00;
        this.isWaiting = false; // Раунд начался, ожидание закончилось
        
        const btn = document.getElementById('crash-btn');
        if (this.hasBet) { // Если игрок сделал ставку
            btn.innerText = "ЗАБРАТЬ";
            btn.style.background = "#2ecc71";
            btn.disabled = false;
        } else { // Если игрок не делал ставку, кнопка "Ставка"
            btn.innerText = "Ставка";
            btn.style.background = "#3498db";
            btn.disabled = false;
        }

        // ОПРЕДЕЛЕНИЕ ТОЧКИ КРАША (RTP ЛОГИКА)
        // Формула: 0.99 / (random) - простая формула краша
        // Но мы добавим контроль
        let randomCrashPoint = (0.95 / Math.random()); 
        if (randomCrashPoint < 1.0) randomCrashPoint = 1.0; // Минимум 1.0x

        this.crashedAt = randomCrashPoint;
        
        // Подкрутка
        if (Game.rigMode === 'lose') this.crashedAt = 1.01 + Math.random() * 0.5; // Краш быстро
        if (Game.rigMode === 'win') this.crashedAt = 5.0 + Math.random() * 10.0; // Даем полетать высоко

        // Если игрок сделал ставку и режим random, проверяем RTP
        if (this.hasBet && Game.rigMode === 'random') {
            let allowed = Game.checkRtp(this.bet * this.crashedAt); // Проверяем потенциальный выигрыш
            if (!allowed) {
                // Если RTP не позволяет, форсируем ранний краш
                this.crashedAt = 1.01 + Math.random() * 1.5; // Краш до 2.5x
            }
        }

        // Анимация
        const counter = document.getElementById('crash-counter');
        const rocket = document.getElementById('crash-rocket');
        
        let time = 0;
        this.interval = setInterval(() => {
            time += 50; // Обновление каждые 50мс
            // Экспоненциальный рост
            this.multiplier += 0.01 + (this.multiplier * 0.0008); 
            
            counter.innerText = this.multiplier.toFixed(2) + 'x';
            
            // Движение ракеты (визуально)
            let bottom = Math.min(150, time / 20);
            let left = Math.min(250, time / 15);
            rocket.style.bottom = `${10 + bottom}px`;
            rocket.style.left = `${10 + left}px`;

            if (this.multiplier >= this.crashedAt) {
                this.crash();
            }
        }, 50); 
    },

    crash: function() {
        clearInterval(this.interval);
        this.interval = null; // Сбрасываем интервал
        this.isRunning = false;
        document.querySelector('.crash-screen').classList.add('crashed');
        document.getElementById('crash-counter').innerText = `CRASH @ ${this.multiplier.toFixed(2)}x`;
        
        const btn = document.getElementById('crash-btn');
        btn.innerText = "Ставка";
        btn.style.background = "#3498db";
        btn.disabled = false;
        
        if (this.hasBet) {
            Game.showAlert("Ракета взорвалась! Вы не успели.");
            this.hasBet = false;
        }
        
        // Запускаем новый раунд после небольшой задержки
        this.startNewRoundDelay();
    }
};
