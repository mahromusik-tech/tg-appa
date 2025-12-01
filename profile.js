Game.Profile = {
    init: function() {
        this.render();
    },
    render: function() {
        const u = Game.user;
        const d = Game.data;
        
        document.getElementById('p-name').innerText = u.first_name;
        document.getElementById('p-id').innerText = `ID: ${u.id}`;
        document.getElementById('p-balance').innerText = Math.floor(d.balance);
        document.getElementById('p-games').innerText = d.gamesPlayed;
        document.getElementById('p-wins').innerText = d.wins;
        document.getElementById('p-profit').innerText = d.totalProfit;

        if(u.photo_url) {
            document.getElementById('p-avatar').style.backgroundImage = `url(${u.photo_url})`;
        }
    }
};
