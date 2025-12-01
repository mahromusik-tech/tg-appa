Game.Admin = {
    // Инициализация админ-панели
    init: function() {
        this.renderUserList();
        this.updateRigStatus();
        
        // Навешиваем обработчики на кнопки режимов
        document.getElementById('btn-rig-random').onclick = () => this.setRigMode('random');
        document.getElementById('btn-rig-win').onclick = () => this.setRigMode('win');
        document.getElementById('btn-rig-lose').onclick = () => this.setRigMode('lose');
    },

    // Получение всех пользователей из LocalStorage
    getAllUsers: function() {
        let users = [];
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.startsWith('user_')) {
                try {
                    let userData = JSON.parse(localStorage.getItem(key));
                    // Добавляем ID из ключа, если его нет внутри
                    userData.id = key.split('_')[1]; 
                    users.push(userData);
                } catch (e) {
                    console.error("Ошибка чтения данных пользователя", key);
                }
            }
        }
        return users;
    },

    // Отрисовка таблицы пользователей
    renderUserList: function() {
        const list = document.getElementById('admin-user-list');
        if (!list) return;

        list.innerHTML = '';
        const users = this.getAllUsers();

        users.forEach(u => {
            let row = document.createElement('div');
            row.className = 'admin-user-row';
            row.innerHTML = `
                <span>ID: ${u.id}</span>
                <span>Баланс: <b>${Math.floor(u.balance)}</b></span>
                <button onclick="Game.Admin.promptBalance('${u.id}')">✏️</button>
            `;
            list.appendChild(row);
        });
    },

    // Изменение баланса пользователя
    promptBalance: function(userId) {
        let amount = prompt(`Введите новый баланс для ID ${userId}:`);
        if (amount !== null) {
            amount = parseInt(amount);
            if (isNaN(amount)) return alert("Неверное число");

            // Обновляем в хранилище
            let key = `user_${userId}`;
            let data = JSON.parse(localStorage.getItem(key));
            data.balance = amount;
            localStorage.setItem(key, JSON.stringify(data));

            // Если меняем баланс себе же — обновляем интерфейс сразу
            if (Game.user && String(Game.user.id) === String(userId)) {
                Game.data.balance = amount;
                Game.updateBalance(0); // Триггер обновления UI
            }

            this.renderUserList();
            Game.showAlert(`Баланс ID ${userId} изменен!`);
        }
    },

    // Установка режима подкрутки
    setRigMode: function(mode) {
        Game.rigMode = mode; // Меняем глобальную переменную в main.js
        this.updateRigStatus();
        
        let text = "";
        if(mode === 'win') text = "Включен режим ПОБЕДЫ 🤑";
        else if(mode === 'lose') text = "Включен режим СЛИВА 📉";
        else text = "Включен ЧЕСТНЫЙ режим 🎲";
        
        Game.showAlert(text);
    },

    // Визуальное обновление кнопок
    updateRigStatus: function() {
        // Сброс классов
        ['random', 'win', 'lose'].forEach(m => {
            let btn = document.getElementById(`btn-rig-${m}`);
            if(btn) btn.classList.remove('active-mode');
        });

        // Подсветка активного
        let activeBtn = document.getElementById(`btn-rig-${Game.rigMode}`);
        if(activeBtn) activeBtn.classList.add('active-mode');
    }
};
