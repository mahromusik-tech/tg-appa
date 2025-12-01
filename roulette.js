Game.Roulette = {
    isSpinning: false,
    cardWidth: 60,
    // Паттерн колеса (0-14) перемешанный так, чтобы 0 был один на круг.
    // Это решает проблему "0 рядом друг с другом".
    wheelPattern: [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4],

    init: function() {
        this.generateStrip();
    },

    generateStrip: function() {
        const strip = document.getElementById('strip');
        let html = '';
        // Генерируем длинную ленту, повторяя паттерн
        for(let i=0; i<10; i++) { 
            this.wheelPattern.forEach(num => {
                let color = (num === 0) ? 'bg-green' : (num % 2 === 0 ? 'bg-red' : 'bg-black');
                html += `<div class="r-card ${color}">${num}</div>`;
            });
        }
        strip.innerHTML = html;
    },

    spin: function(choice) {
        if(this.isSpinning) return;
        
        const betInput = document.getElementById('r-bet');
        const bet = parseInt(betInput.value);

        if(isNaN(bet) || bet <= 0) return Game.showAlert("Неверная ставка");
        if(bet > Game.balance) return Game.showAlert("Не хватает денег");

        Game.saveBalance(Game.balance - bet);
        this.isSpinning = true;
        Game.haptic('light');

        // Логика выигрыша
        const winNum = Math.floor(Math.random() * 15);
        let winColor = (winNum === 0) ? 'green' : (winNum % 2 === 0 ? 'red' : 'black');

        // Визуализация: находим нужную карточку в ленте (где-то в середине)
        // Паттерн длиной 15. Ищем индекс в 5-м повторении паттерна
        const patternIndex = this.wheelPattern.indexOf(winNum);
        const targetIndex = (15 * 5) + patternIndex; 
        
        // Сдвиг
        const wrapperWidth = document.querySelector('.roulette-wrapper').offsetWidth;
        // Добавляем случайный сдвиг внутри карточки для реализма (+/- 20px)
        const randomOffset = Math.floor(Math.random() * 40) - 20;
        const offset = (targetIndex * this.cardWidth) - (wrapperWidth / 2) + (this.cardWidth / 2) + randomOffset;

        const strip = document.getElementById('strip');
        strip.style.transition = "transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)";
        strip.style.transform = `translateX(-${offset}px)`;

        setTimeout(() => {
            this.isSpinning = false;
            
            // Маржинальные коэффициенты (House Edge)
            // Было: 2 и 14. Стало: 1.9 и 13.
            let multiplier = 0;
            if (winColor === 'green') multiplier = 13;
            else multiplier = 1.9;

            if(choice === winColor) {
                const winAmount = Math.floor(bet * multiplier);
                Game.saveBalance(Game.balance + winAmount);
                Game.showAlert(`ПОБЕДА! +${winAmount}`);
                Game.haptic('success');
            } else {
                Game.haptic('error');
            }

            // История
            const hist = document.getElementById('history');
            const span = document.createElement('span');
            span.innerText = winNum + " ";
            span.style.color = winColor === 'green' ? '#34c759' : (winColor === 'red' ? '#ff3b30' : '#888');
            hist.prepend(span);

            // Сброс ленты (без анимации)
            setTimeout(() => {
                strip.style.transition = "none";
                strip.style.transform = "translateX(0px)";
            }, 1000);

        }, 4000);
    }
};
