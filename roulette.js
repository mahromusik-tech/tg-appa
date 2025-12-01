const Roulette = {
    isSpinning: false,
    order: [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4], // Классический порядок
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
        let html = '';
        // Генерируем длинную ленту для анимации (повторяем паттерн)
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
        
        const bet = parseInt(document.getElementById('roulette-bet').value);
        if(isNaN(bet) || bet <= 0) return App.showAlert("Неверная ставка");
        if(bet > App.state.balance) return App.showAlert("Недостаточно средств");

        App.updateBalance(-bet, false);
        this.isSpinning = true;

        // 1. Определяем результат (RTP)
        let resultNum = this.getResult(bet, choiceColor);
        
        // 2. Вычисляем позицию для анимации
        // Ширина ячейки ~60px. Находим этот номер где-то далеко в ленте (например, после 50-го повтора)
        const cellSize = 60; 
        const offsetInPattern = this.order.indexOf(resultNum);
        const loops = 50 + Math.floor(Math.random() * 10); // Случайное кол-во оборотов
        const targetIndex = (loops * 15) + offsetInPattern;
        
        // Добавляем случайный сдвиг внутри ячейки (чтобы стрелка не всегда была по центру)
        const randomOffset = Math.floor(Math.random() * 40) - 20; 
        
        const pixelOffset = (targetIndex * cellSize) + (cellSize / 2) + randomOffset;
        
        // 3. Запуск анимации
        const strip = document.getElementById('roulette-strip');
        // Центр контейнера (ширина экрана / 2)
        const centerScreen = strip.parentElement.offsetWidth / 2;
        const finalTranslate = -(pixelOffset - centerScreen);

        strip.style.transition = "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)";
        strip.style.transform = `translateX(${finalTranslate}px)`;

        // 4. Завершение
        setTimeout(() => {
            this.finish(resultNum, choiceColor, bet);
        }, 4000);
    },

    getResult: function(bet, choice) {
        // Простой рандом
        let r = Math.floor(Math.random() * 15); // 0-14
        let num = this.order[r];
        let color = this.colors[num];

        // RTP проверка
        let winMult = (color === 'green') ? 14 : 2;
        let potentialWin = bet * winMult;

        // Если игрок угадал, но RTP против
        if (color === choice && !App.checkRtp(potentialWin)) {
            // Сдвигаем результат на 1 позицию (меняем цвет)
            let idx = this.order.indexOf(num);
            num = this.order[(idx + 1) % 15];
        }

        return num;
    },

    finish: function(num, choice, bet) {
        this.isSpinning = false;
        const strip = document.getElementById('roulette-strip');
        strip.style.transition = "none";
        strip.style.transform = "translateX(0px)"; // Сброс (визуально можно доработать)
        
        const resultColor = this.colors[num];
        let win = 0;

        if(resultColor === choice) {
            let mult = (choice === 'green') ? 14 : 2;
            win = bet * mult;
            App.updateBalance(win, true);
            App.showAlert(`Победа! +${win}`);
        } else {
            App.updateBalance(0, false); // Запись луза
        }

        this.addToHistory(num, resultColor);
    },

    addToHistory: function(num, color) {
        const h = document.getElementById('roulette-history');
        const badge = document.createElement('span');
        badge.className = `crash-badge bg-${color}`; // Используем стили crash-badge для простоты
        badge.style.marginRight = '5px';
        badge.innerText = num;
        h.prepend(badge);
        if(h.children.length > 10) h.lastChild.remove();
    }
};
