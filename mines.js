const Mines = {
    active: false,
    grid: [], // 0 - пусто, 1 - мина
    minesCount: 3,
    bet: 0,
    step: 0,
    
    // Коэффициенты для 3, 5, 10, 24 мин
    multipliers: {
        3: [1.13, 1.3, 1.5, 1.75, 2.1, 2.5, 3.0, 4.0, 5.0, 6.0],
        5: [1.25, 1.5, 1.9, 2.4, 3.1, 4.0, 5.5, 7.5, 10.0, 15.0],
        10: [1.6, 2.3, 3.3, 5.0, 7.5, 11.0, 16.0, 25.0, 40.0, 60.0],
        24: [23.75, 47.5, 95.0] // Хардкор
    },

    action: function() {
        if(this.active) this.cashout();
        else this.startGame();
    },

    startGame: function() {
        const betInput = parseInt(document.getElementById('mines-bet').value);
        if(isNaN(betInput) || betInput <= 0) return App.showAlert("Неверная ставка");
        if(betInput > App.state.balance) return App.showAlert("Недостаточно средств");

        // Списание ставки
        App.updateBalance(-betInput, false);
        
        this.bet = betInput;
        this.minesCount = parseInt(document.getElementById('mines-count').value);
        this.active = true;
        this.step = 0;
        
        // Генерация поля (логическая)
        this.grid = Array(25).fill(0);
        let placed = 0;
        while(placed < this.minesCount) {
            let r = Math.floor(Math.random() * 25);
            if(this.grid[r] === 0) {
                this.grid[r] = 1;
                placed++;
            }
        }

        // Обновление UI
        this.renderGrid();
        this.updateBtn(true);
        document.getElementById('mines-coeff').innerText = "x1.00";
        
        // Блокируем инпуты
        document.getElementById('mines-bet').disabled = true;
        document.getElementById('mines-count').disabled = true;
    },

    renderGrid: function() {
        const container = document.getElementById('mines-grid');
        container.innerHTML = '';
        for(let i=0; i<25; i++) {
            let cell = document.createElement('div');
            cell.className = 'mine-cell';
            cell.onclick = () => this.clickCell(i, cell);
            container.appendChild(cell);
        }
    },

    clickCell: function(idx, el) {
        if(!this.active || el.classList.contains('active')) return;

        let isMine = this.grid[idx] === 1;
        
        // --- RTP ВМЕШАТЕЛЬСТВО ---
        // Если это не мина, но RTP говорит "слить", и это не первый ход
        if (!isMine && this.step > 1) {
            let potentialWin = this.bet * this.getCoeff(this.step + 1);
            if (!App.checkRtp(potentialWin)) {
                // Подменяем на мину
                isMine = true;
                this.grid[idx] = 1; 
            }
        }
        // -------------------------

        el.classList.add('active');

        if(isMine) {
            // Взрыв
            el.classList.add('bomb');
            el.innerText = '💣';
            this.gameOver(false);
        } else {
            // Успех
            el.classList.add('gem');
            el.innerText = '💎';
            this.step++;
            
            const nextCoeff = this.getCoeff(this.step);
            document.getElementById('mines-coeff').innerText = `x${nextCoeff.toFixed(2)}`;
            
            // Обновляем кнопку
            const winAmount = Math.floor(this.bet * nextCoeff);
            const btn = document.getElementById('btn-mines-action');
            btn.innerText = `ЗАБРАТЬ ${winAmount}`;
            btn.style.background = "#00ff88";
            btn.style.color = "#000";
        }
    },

    getCoeff: function(step) {
        const arr = this.multipliers[this.minesCount];
        if(step > arr.length) return arr[arr.length-1];
        return arr[step-1] || 1.0;
    },

    cashout: function() {
        if(!this.active) return;
        const win = Math.floor(this.bet * this.getCoeff(this.step));
        App.updateBalance(win, true);
        App.showAlert(`Выигрыш: ${win}`);
        this.gameOver(true);
    },

    gameOver: function(win) {
        this.active = false;
        
        // Показать все мины
        const cells = document.querySelectorAll('.mine-cell');
        this.grid.forEach((val, i) => {
            if(val === 1) {
                cells[i].classList.add('active', 'bomb');
                cells[i].innerText = '💣';
            } else if (!cells[i].classList.contains('active')) {
                cells[i].style.opacity = '0.3'; // Затемнить остальные
            }
        });

        if(!win) {
            App.updateBalance(0, false); // Запись проигрыша в стату
            App.showAlert("Взрыв! Попробуйте снова.");
        }

        this.updateBtn(false);
        document.getElementById('mines-bet').disabled = false;
        document.getElementById('mines-count').disabled = false;
    },

    updateBtn: function(isPlaying) {
        const btn = document.getElementById('btn-mines-action');
        if(isPlaying) {
            btn.innerText = "ЗАБРАТЬ (Рано)";
            btn.style.background = "#333";
            btn.style.color = "#fff";
        } else {
            btn.innerText = "СТАВКА";
            btn.style.background = ""; // Reset to CSS default
            btn.style.color = "";
        }
    }
};
