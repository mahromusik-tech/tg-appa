const Profile = {
    render: function() {
        const s = App.state;
        const u = App.user;

        // Аватар и имя
        if(u.photo_url) {
            document.getElementById('p-avatar').style.backgroundImage = `url(${u.photo_url})`;
        }
        document.getElementById('p-name').innerText = u.first_name;
        document.getElementById('p-id').innerText = `ID: ${u.id}`;

        // Статистика
        document.getElementById('p-balance').innerText = Math.floor(s.balance);
        document.getElementById('p-games').innerText = s.gamesPlayed;
        document.getElementById('p-wins').innerText = s.wins;
        document.getElementById('p-loses').innerText = s.loses;
    }
};
