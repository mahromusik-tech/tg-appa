Game.Mines = {
    isPlaying: false,
    minesLoc: [],
    
    startGame: function() {
        if(this.isPlaying) return;
        const bet = parseInt(document.getElementById('m-bet').value);
        if(bet > Game.data.balance) return Game.showAlert("Мало денег");
        
        Game.updateBalance(-bet, false);
        this.isPlaying = true;
        this.currentBet = bet;
        this.renderGrid();
        
        // Генерация мин
        const count = parseInt(document.getElementById('mines-count').value);
        this.minesLoc = [];
        
        // Если режим СЛИВА - мины везде, кроме 1 клетки (шутка), или просто много мин
        // Но сделаем честнее: просто генерируем как обычно, но при клике подменим
        while(this.minesLoc.length < count) {
            let r = Math.floor(Math.random() * 25);
            if(!this.minesLoc.includes(r)) this.minesLoc.push(r);
        }
        
        document.getElementById('mines-btn').innerText = "Забрать (нельзя)";
        document.getElementById('mines-btn').onclick = () => this.cashout();
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
        
        // ПОДКРУТКА
        let isMine = this.minesLoc.includes(i);
        
        if (Game.rigMode === 'lose') {
            isMine = true; // Всегда взрыв
            if(!this.minesLoc.includes(i)) this.minesLoc.push(i); // Добавляем мину сюда визуально
        } else if (Game.rigMode === 'win') {
            isMine = false; // Никогда не взрыв (если это не последняя клетка)
        }

        el.classList.add('active');
        
        if(isMine) {
            el.classList.add('revealed-mine');
            el.innerText = '💣';
            this.gameOver();
        } else {
            el.classList.add('revealed-gem');
            el.innerText = '💎';
            // Упрощенная логика множителя для примера
            document.getElementById('mines-btn').innerText = "Забрать деньги";
        }
    },

    cashout: function() {
        if(!this.isPlaying) return;
        // Расчет выигрыша (упрощенно x1.2)
        let win = Math.floor(this.currentBet * 1.5); 
        Game.updateBalance(win, true);
        Game.showAlert(`Забрали: ${win}`);
        this.isPlaying = false;
        this.renderGrid();
        document.getElementById('mines-btn').innerText = "Играть";
        document.getElementById('mines-btn').onclick = () => this.startGame();
    },

    gameOver: function() {
        this.isPlaying = false;
        Game.showAlert("Взрыв!");
        // Показать все мины
        this.minesLoc.forEach(idx => {
            document.querySelectorAll('.mine-cell')[idx].classList.add('revealed-mine');
            document.querySelectorAll('.mine-cell')[idx].innerText = '💣';
        });
        document.getElementById('mines-btn').innerText = "Играть";
        document.getElementById('mines-btn').onclick = () => this.startGame();
    }
};
