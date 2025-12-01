const Roulette = {
    isSpinning: false,
    order: [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4], 
    colors: {
        0: 'green',
        1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red',
        8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red'
    },
    
    init: function() {
        this.renderStrip();
    },

    renderStrip: function() {
        const strip = document.getElementById('roulette-strip');
        if(!strip) return;
        let html = '';
        // Генерируем ленту
        for(let i=0; i<100; i++) {
            this.order.forEach(num => {
                let colorClass = `bg-${this.colors[num]}`;
                html += `<div class="r-cell ${colorClass}">${num}</div>`;
            });
        }
        strip.innerHTML = html;
    },

    spin: function(choiceColor) {
        if(this.isSpinning) return;
        
        const betInput = document.getElementById('roulette-bet');
        const bet = parseInt(betInput.value);
        
        if(isNaN(bet) || bet <= 0) return App.showAlert("Неверная ставка");
        if(bet > App.state.balance) return App.showAlert("Недостаточно средств");

        // Списание
        App.updateBalance(-bet, false);
        this.isSpinning = true;

        // 1. СБРОС ПОЗИЦИИ (ВАЖНО!)
        const strip = document.getElementById('roulette-strip');
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(0px)';
        
        // Force Reflow (заставляем браузер применить сброс прямо сейчас)
        strip.offsetHeight; 

        // 2. Расчет результата
        let resultNum = this.getResult(bet, choiceColor);
        
        // 3. Вычисление смещения
        const cellSize = 60; 
        const offsetInPattern = this.order.indexOf(resultNum);
        const loops = 40 + Math.floor(Math.random() * 10); // Обороты
        const targetIndex = (loops * 15) + offsetInPattern;
        
        // Центрирование + рандом внутри ячейки
        const containerWidth = strip.parentElement.offsetWidth;
        const randomOffset = Math.floor(Math.random() * 40) - 20;
        
        // Формула: (Индекс * Ширина) - (Половина экрана) + (Половина ячейки)
        const pixelOffset = (targetIndex * cellSize) - (containerWidth / 2) + (cellSize / 2) + randomOffset;
        
        // 4. Запуск анимации
        strip.style.transition = "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)";
        strip.style.transform = `translateX(-${pixelOffset}px)`;

        // 5. Финиш
        setTimeout(() => {
            this.finish(resultNum, choiceColor, bet);
        }, 4000);
    },

    getResult: function(bet, choice) {
        let r = Math.floor(Math.random() * 15);
        let num = this.order[r];
        let color = this.colors[num];

        // RTP проверка
        let winMult = (color === 'green') ? 14 : 2;
        let potentialWin = bet * winMult;

        if (color === choice && !App.checkRtp(potentialWin)) {
            // Если RTP против, сдвигаем на 1 (меняем цвет)
            let idx = this.order.indexOf(num);
            num = this.order[(idx + 1) % 15];
        }
        return num;
    },

    finish: function(num, choice, bet) {
        this.isSpinning = false;
        const resultColor = this.colors[num];
        let win = 0;

        if(resultColor === choice) {
            let mult = (choice === 'green') ? 14 : 2;
            win = bet * mult;
            App.updateBalance(win, true);
            App.showAlert(`Победа! +${win}`);
        } else {
            App.updateBalance(0, false); // Луз
        }

        this.addToHistory(num, resultColor);
    },

    addToHistory: function(num, color) {
        const h = document.getElementById('roulette-history');
        if(!h) return;
        const badge = document.createElement('div');
        // Стили для истории
        badge.style.width = '25px';
        badge.style.height = '25px';
        badge.style.borderRadius = '4px';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = 'bold';
        badge.style.color = '#fff';
        badge.style.backgroundColor = (color === 'red') ? '#e74c3c' : (color === 'green' ? '#00b894' : '#2d3436');
        badge.innerText = num;
        
        h.prepend(badge);
        if(h.children.length > 10) h.lastChild.remove();
    }
};
