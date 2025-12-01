const Profile = {
    render: function() {
        console.log("Profile render called");
        
        // Проверяем, загрузилось ли ядро
        if (!window.App || !App.user) {
            console.error("App not ready for profile");
            return;
        }

        const s = App.state;
        const u = App.user;

        // Функция для безопасной вставки текста
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
            else console.warn(`Element #${id} not found in Profile`);
        };

        setText('p-name', u.first_name || 'Игрок');
        setText('p-id', `ID: ${u.id}`);
        
        // Статистика (добавляем || 0 на случай undefined)
        setText('p-balance', Math.floor(s.balance || 0));
        setText('p-games', s.gamesPlayed || 0);
        setText('p-wins', s.wins || 0);
        setText('p-loses', s.loses || 0);

        // Аватар
        const ava = document.getElementById('p-avatar');
        if (ava) {
            if (u.photo_url) {
                ava.style.backgroundImage = `url(${u.photo_url})`;
                ava.style.backgroundSize = 'cover';
            } else {
                ava.style.backgroundColor = '#555';
                ava.innerText = u.first_name ? u.first_name[0] : '?';
                ava.style.display = 'flex';
                ava.style.alignItems = 'center';
                ava.style.justifyContent = 'center';
                ava.style.fontSize = '30px';
                ava.style.color = '#fff';
            }
        }
    }
};
