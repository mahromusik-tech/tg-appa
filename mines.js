Game.Mines = {
    gridSize: 25,
    minesCount: 3,
    isPlaying: false,
    currentBet: 0,
    currentMultiplier: 1.0,
    revealedCount: 0,
    minesLocations: [],

    init: function() {
        this.renderGrid();
    },

    renderGrid: function() {
        const grid = document.getElementById('mines-grid');
        grid.innerHTML = '';
        for(let i=0; i<this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'mine-cell';
            cell.dataset.index = i;
            cell.onclick = () => this.clickCell(i, cell);
            grid.appendChild(cell);
        }
    },

    startGame: function() {
        if(this.isPlaying) return;

        const betInput = document.getElementById('m-bet');
        const minesSelect = document.getElementById('mines-count');
        
        const bet = parseInt(betInput.value);
        this.minesCount = parseInt(minesSelect.value);

        if(isNaN(bet) || bet <= 0) return Game.showAlert("Неверная ставка");
        if(bet > Game.balance) return Game.showAlert("Не хватает денег");

        // Списание ставки
        Game.saveBalance(Game.balance - bet);
        this.currentBet = bet;
        
        // Сброс состояния
        this.isPlaying = true;
        this.currentMultiplier = 1.0;
        this.revealedCount = 0;
        this.generateMines();
        this.renderGrid(); // Очистка поля
        
        // UI
        document.getElementById('mines-controls').style.display = 'none';
        document.getElementById('mines-cashout').style.display = 'block';
        document.getElementById('mines-cashout').innerText = `Забрать ${bet}`;
        this.updateInfo();
    },

    generateMines: function() {
        this.minesLocations = [];
        while(this.minesLocations.length < this.minesCount) {
            let r = Math.floor(Math.random() * this.gridSize);
            if(!this.minesLocations.includes(r)) this.minesLocations.push(r);
        }
    },

    clickCell: function(index, cellElement) {
        if(!this.isPlaying) return;
        if(cellElement.classList.contains('active')) return; // Уже открыто

        cellElement.classList.add('active');

        if(this.minesLocations.includes(index)) {
            // БУМ!
            this.gameOver(false, index);
        } else {
            // Алмаз
            cellElement.classList.add('revealed-gem');
            cellElement.innerText = '💎';
            this.revealedCount++;
            this.calculateMultiplier();
            Game.haptic('light');
            
            // Проверка на полную победу
            if(this.revealedCount === (this.gridSize - this.minesCount)) {
                this.cashout();
            }
        }
    },

    calculateMultiplier: function() {
        // Формула с маржой казино (House Edge ~5%)
        // Вероятность успеха = (Осталось пустых) / (Осталось всего закрытых)
        const remainingCells = this.gridSize - (this.revealedCount - 1);
        const remainingSafe = this.gridSize - this.minesCount - (this.revealedCount - 1);
        
        const probability = remainingSafe / remainingCells;
        const fairMultiplier = 1 / probability;
        
        // Применяем маржу 3-5% на каждом шаге, чтобы казино было в плюсе
        const margin = 0.97; 
        this.currentMultiplier *= (fairMultiplier * margin);

        this.updateInfo();
    },

    updateInfo: function() {
        const winAmount = Math.floor(this.currentBet * this.currentMultiplier);
        document.getElementById('mines-current-win').innerText = `Выигрыш: ${winAmount}`;
        
        // Расчет следующего множителя для UI
        const remainingCells = this.gridSize - this.revealedCount;
        const remainingSafe = this.gridSize - this.minesCount - this.revealedCount;
        const nextProb = remainingSafe / remainingCells;
        const nextMult = this.currentMultiplier * (1 / nextProb) * 0.97;
        
        document.getElementById('mines-next-coeff').innerText = `След: x${nextMult.toFixed(2)}`;
        document.getElementById('mines-cashout').innerText = `Забрать ${winAmount}`;
    },

    cashout: function() {
        if(!this.isPlaying) return;
        const winAmount = Math.floor(this.currentBet * this.currentMultiplier);
        Game.saveBalance(Game.balance + winAmount);
        Game.showAlert(`Вы забрали ${winAmount}!`);
        Game.haptic('success');
        this.gameOver(true);
    },

    gameOver: function(win, badIndex) {
        this.isPlaying = false;
        document.getElementById('mines-controls').style.display = 'block';
        document.getElementById('mines-cashout').style.display = 'none';

        // Показать все мины
        const cells = document.querySelectorAll('.mine-cell');
        cells.forEach((cell, idx) => {
            if(this.minesLocations.includes(idx)) {
                cell.classList.add('revealed-mine');
                cell.innerText = '💣';
                if(idx === badIndex) cell.style.backgroundColor = '#ff3b30';
            } else if (!cell.classList.contains('active')) {
                cell.style.opacity = '0.5'; // Затенить остальные
            }
        });

        if(!win) Game.haptic('error');
    }
};
