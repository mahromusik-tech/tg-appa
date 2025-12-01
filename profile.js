const Profile = {
    render: function() {
        // Проверка на готовность App
        if (!App || !App.user || !App.state) return;

        const s = App.state;
        const u = App.user;

        // Безопасное обновление DOM элементов
        const setSafe = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.innerText = val;
        };

        setSafe('p-name', u.first_name || 'Unknown');
        setSafe('p-id', `ID: ${u.id}`);
        setSafe('p-balance', Math.floor(s.balance));
        setSafe('p-games', s.gamesPlayed || 0);
        setSafe('p-wins', s.wins || 0);
        setSafe('p-loses', s.loses || 0);

        const ava = document.getElementById('p-avatar');
        if(ava) {
            if(u.photo_url) {
                ava.style.backgroundImage = `url(${u.photo_url})`;
            } else {
                ava.style.backgroundImage = 'none';
                ava.style.backgroundColor = '#333';
            }
        }
    }
};
