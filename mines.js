Game.Mines = {
    isPlaying: false,
    minesLoc: [],
    openedCells: 0,
    currentBet: 0,
    minesCount: 3,
    
    // Более жадные коэффициенты (примерно +15-20% за шаг, а не x2)
    multipliers: {
        3: [1.1, 1.25, 1.45, 1.65, 1.9, 2.2, 2.5, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0],
        5: [1.2, 1.4, 1.7, 2.0, 2.5, 3.2, 4.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0, 23.0, 25.0, 27.0, 29.0],
        10: [1.5, 2.0, 2.8, 3.8, 5.0, 7.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0],
        24: [8.0, 15.0, 24.0] // Хардкор
    },

    startGame: function() {
        if(this.isPlaying) return;
        const bet = parseInt(document.getElementById('m-bet').value);
        if(isNaN(bet) || bet <= 0) return Game.showAlert("Неверная ставка");
        if(bet > Game.data.balance) return Game.showAlert("Мало денег");
        
        Game.updateBalance(-bet, false);
        this.isPlaying = true;
        this.currentBet = bet;
        this.openedCells = 0;
        this.minesCount = parseInt(document.getElementById('mines-count').value);
        
        this.generateMines();
        this.renderGrid();
        this.updateNextCoeff();
        
        const btn = document.getElementById('mines-btn');
        btn.innerText = "Забрать (нельзя)";
        btn.onclick = () => this.cashout();
        btn.disabled = true; // Нельзя забрать до первого хода
    },

    generateMines: function() {
        this.minesLoc = [];
        while(this.minesLoc.length < this.minesCount) {
            let r = Math.floor(Math.random() * 25);
            if(!this.minesLoc.includes(r)) this.minesLoc.push(r);
        }
    },

    renderGrid: function() {
        const g = document.getElementById('mines-grid');
        g.innerHTML = '';
        for(let i=0; i<25; i++) {
            let c = document.createElement('div');
            c.className = 'mine-cell';
            c.onclick = () => this.check(i, c);
            g.appendChild(c);
        }
    },

    check: function(i, el) {
        if(!this.isPlaying || el.classList.contains('active')) return;

        // --- ЛОГИКА RTP И ПОДКРУТКИ ---
        let isMine = this.minesLoc.includes(i);
        
        // Если режим СЛИВА - всегда взрыв
        if (Game.rigMode === 'lose') isMine = true;
        
        // Если режим ПОБЕДЫ - всегда гем (если это не последняя клетка)
        if (Game.rigMode === 'win') isMine = false;

        // Если режим РАНДОМ (RTP), проверяем, не слишком ли много игрок выигрывает
        if (Game.rigMode === 'random' && !isMine) {
            // Рассчитываем потенциальный выигрыш на ЭТОМ шаге
            let nextMult = this.getMultiplier(this.openedCells + 1);
            let potentialWin = this.currentBet * nextMult;
            
            // Спрашиваем у RTP менеджера, можно ли дать выиграть
            let allowed = Game.checkRtp(potentialWin);
            if (!allowed) {
                isMine = true; // Форсируем взрыв
                // Визуально перемещаем мину сюда, если её тут не было
                if(!this.minesLoc.includes(i)) this.minesLoc.push(i);
            }
        }
        // -----------------------------

        el.classList.add('active');
        
        if(isMine) {
            el.classList.add('revealed-mine');
            el.innerText = '💣';
            this.gameOver();
        } else {
            el.classList.add('revealed-gem');
            el.innerText = '💎';
            this.openedCells++;
            
            const btn = document.getElementById('mines-btn');
            let currentWin = Math.floor(this.currentBet * this.getMultiplier(this.openedCells));
            btn.innerText = `Забрать ${currentWin}`;
            btn.disabled = false;
            
            this.updateNextCoeff();
        }
    },

    getMultiplier: function(step) {
        let arr = this.multipliers[this.minesCount] || [];
        // Если шагов больше, чем в массиве, просто возвращаем последний множитель
        if (step > arr.length) return arr[arr.length-1] || 1.0;
        return arr[step-1] || 1.0;
    },

    updateNextCoeff: function() {
        let nextMult = this.getMultiplier(this.openedCells + 1);
        document.getElementById('mines-next-x').innerText = `x${nextMult.toFixed(2)}`;
    },

    cashout: function() {
        if(!this.isPlaying) return;
        let win = Math.floor(this.currentBet * this.getMultiplier(this.openedCells));
        Game.updateBalance(win, true);
        Game.showAlert(`Выигрыш: ${win}`);
        this.isPlaying = false;
        this.renderGrid(); // Сброс поля
        document.getElementById('mines-btn').innerText = "Играть";
        document.getElementById('mines-btn').onclick = () => this.startGame();
        document.getElementById('mines-next-x').innerText = "x1.00";
    },

    gameOver: function() {
        this.isPlaying = false;
        Game.showAlert("Взрыв!");
        // Показать все мины
        this.minesLoc.forEach(idx => {
            let cell = document.querySelectorAll('.mine-cell')[idx];
            if(cell) {
                cell.classList.add('revealed-mine');
                cell.innerText = '💣';
            }
        });
        document.getElementById('mines-btn').innerText = "Играть";
        document.getElementById('mines-btn').onclick = () => this.startGame();
        document.getElementById('mines-next-x').innerText = "x1.00";
    }
};
