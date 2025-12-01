Game.Roulette = {
    isSpinning: false,
    cardWidth: 60,
    wheelPattern: [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4], // 15 чисел

    init: function() {
        this.generateStrip();
    },

    generateStrip: function() {
        const strip = document.getElementById('strip');
        let html = '';
        // Генерируем 20 повторений паттерна (достаточно длинная лента)
        for(let i=0; i<20; i++) { 
            this.wheelPattern.forEach(num => {
                let color = (num === 0) ? 'bg-green' : (num % 2 === 0 ? 'bg-red' : 'bg-black');
                html += `<div class="r-card ${color}">${num}</div>`;
            });
        }
        strip.innerHTML = html;
    },

    spin: function(choice) {
        if(this.isSpinning) return;
        const bet = parseInt(document.getElementById('r-bet').value);
        if(bet > Game.data.balance || bet <= 0) return Game.showAlert("Ошибка ставки");

        Game.updateBalance(-bet, false); // Списываем
        this.isSpinning = true;

        // 1. ОПРЕДЕЛЯЕМ РЕЗУЛЬТАТ (Логика + Подкрутка)
        let winNum;
        
        // Если включена подкрутка
        if (Game.rigMode === 'lose') {
            // Генерируем число, цвет которого НЕ совпадает с выбором игрока
            do {
                winNum = Math.floor(Math.random() * 15);
                let color = (winNum === 0) ? 'green' : (winNum % 2 === 0 ? 'red' : 'black');
            } while (color === choice); // Ищем пока не найдем проигрышный
        } else if (Game.rigMode === 'win') {
            // Генерируем число, цвет которого СОВПАДАЕТ
             do {
                winNum = Math.floor(Math.random() * 15);
                let color = (winNum === 0) ? 'green' : (winNum % 2 === 0 ? 'red' : 'black');
            } while (color !== choice);
        } else {
            // Честный рандом
            winNum = Math.floor(Math.random() * 15);
        }

        // 2. ВИЗУАЛИЗАЦИЯ (Едем к конкретному числу)
        // Находим это число в ленте где-то далеко (например, в 10-м повторении паттерна)
        // Индекс числа в паттерне:
        const patternIdx = this.wheelPattern.indexOf(winNum);
        // Глобальный индекс карточки (15 чисел * 10 кругов + смещение)
        // Добавляем рандомное кол-во полных кругов (от 8 до 12), чтобы каждый раз разное расстояние
        const rounds = 8 + Math.floor(Math.random() * 4);
        const targetIndex = (15 * rounds) + patternIdx;

        // Считаем пиксели
        const wrapperW = document.querySelector('.roulette-wrapper').offsetWidth;
        // Центрируем карточку: (индекс * ширина) - пол_экрана + пол_карточки
        // Добавляем микро-сдвиг внутри карточки (+/- 20px) для реализма
        const randomOffset = Math.floor(Math.random() * 40) - 20;
        const pixelOffset = (targetIndex * this.cardWidth) - (wrapperW / 2) + (this.cardWidth / 2) + randomOffset;

        const strip = document.getElementById('strip');
        strip.style.transition = "transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)";
        strip.style.transform = `translateX(-${pixelOffset}px)`;

        setTimeout(() => {
            this.isSpinning = false;
            
            // Проверка победы
            let winColor = (winNum === 0) ? 'green' : (winNum % 2 === 0 ? 'red' : 'black');
            let multiplier = (winColor === 'green') ? 14 : 2;

            if(choice === winColor) {
                const winAmount = bet * multiplier;
                Game.updateBalance(winAmount, true); // Начисляем выигрыш
                Game.showAlert(`Выпало ${winNum}! Победа +${winAmount}`);
            }

            // История
            const h = document.getElementById('history');
            h.innerHTML = `<span style="color:${winColor}; margin-right:5px;">${winNum}</span>` + h.innerHTML;

            // Сброс ленты (хитрый трюк)
            // Чтобы лента не уезжала в бесконечность, мы тихо возвращаем её назад,
            // но так, чтобы визуально позиция не изменилась (находим такой же номер ближе к началу)
            // Но для простоты здесь просто оставим как есть, или сбросим при следующем спине.
            
        }, 4000);
    }
};
