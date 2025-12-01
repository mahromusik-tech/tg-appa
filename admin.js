Game.Admin = {
    clicks: 0,
    clickTimer: null,

    init: function() {
        this.renderUserList();
        this.updateRigStatus();
        
        // Обработчики кнопок режимов
        const modes = ['random', 'win', 'lose'];
        modes.forEach(m => {
            let btn = document.getElementById(`btn-rig-${m}`);
            if(btn) btn.onclick = () => this.setRigMode(m);
        });
    },

    // Секретный вход: 5 кликов за 2 секунды по ID в профиле
    secretClick: function() {
        this.clicks++;
        if(this.clicks === 1) {
            this.clickTimer = setTimeout(() => {
                this.clicks = 0;
            }, 2000);
        }
        
        if(this.clicks >= 5) {
            clearTimeout(this.clickTimer);
            this.clicks = 0;
            Game.nav('admin'); // Переход в админку
            Game.showAlert("Добро пожаловать, Админ!");
        }
    },

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

    promptBalance: function(userId) {
        let amount = prompt(`Введите новый баланс для ID ${userId}:`);
        if (amount !== null) {
            amount = parseInt(amount);
            if (isNaN(amount)) return alert("Неверное число");

            let key = `user_${userId}`;
            let data = JSON.parse(localStorage.getItem(key));
            data.balance = amount;
            localStorage.setItem(key, JSON.stringify(data));

            if (Game.user && String(Game.user.id) === String(userId)) {
                Game.data.balance = amount;
                Game.updateBalance(0); 
            }

            this.renderUserList();
            Game.showAlert(`Баланс ID ${userId} изменен!`);
        }
    },

    setRigMode: function(mode) {
        Game.rigMode = mode; 
        this.updateRigStatus();
        
        let text = "";
        if(mode === 'win') text = "Включен режим ПОБЕДЫ 🤑";
        else if(mode === 'lose') text = "Включен режим СЛИВА 📉";
        else text = "Включен ЧЕСТНЫЙ режим 🎲";
        
        Game.showAlert(text);
    },

    updateRigStatus: function() {
        ['random', 'win', 'lose'].forEach(m => {
            let btn = document.getElementById(`btn-rig-${m}`);
            if(btn) btn.classList.remove('active-mode');
        });

        let activeBtn = document.getElementById(`btn-rig-${Game.rigMode}`);
        if(activeBtn) activeBtn.classList.add('active-mode');
    }
};
