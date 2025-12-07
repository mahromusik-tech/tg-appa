// app.js

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand(); // разворачиваем миниапп на максимум
}

const loadBtn = document.getElementById("loadBtn");
const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches");

// Заглушка: пример структуры данных, которые должен вернуть ваш backend
// В реальном приложении вы будете делать fetch() на свой сервер
async function fetchDotaMatchesMock() {
    // Имитируем задержку сети
    await new Promise(r => setTimeout(r, 600));

    const now = Date.now();
    return [
        {
            id: "match_1",
            team1: "Team Spirit",
            team2: "Gaimin Gladiators",
            startTime: new Date(now + 30 * 60 * 1000).toISOString(), // через 30 минут
            tournament: "DreamLeague Season 25",
            odds: {
                // простейший пример: победа первой/второй
                team1_win: 1.85,
                team2_win: 1.95,
                draw: null
            }
        },
        {
            id: "match_2",
            team1: "PSG.LGD",
            team2: "Xtreme Gaming",
            startTime: new Date(now + 2 * 60 * 60 * 1000).toISOString(), // через 2 часа
            tournament: "The International 2025 Qualifier",
            odds: {
                team1_win: 2.10,
                team2_win: 1.70,
                draw: null
            }
        }
    ];
}

// Реальный запрос к вашему backend’у (пример)
// Замените URL на ваш
async function fetchDotaMatchesFromBackend() {
    const resp = await fetch("https://your-backend.com/api/dota-matches", {
        method: "GET"
    });
    if (!resp.ok) {
        throw new Error("Backend error: " + resp.status);
    }
    // Ожидаем, что backend вернет массив матчей в формате, похожем на mock
    return await resp.json();
}

// Выберите, что использовать: mock или реальный backend
const fetchDotaMatches = fetchDotaMatchesMock;
// const fetchDotaMatches = fetchDotaMatchesFromBackend;

function formatTime(isoString) {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "время неизвестно";

    const pad = n => String(n).padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${day}.${month} ${hours}:${minutes}`;
}

function renderMatches(matches) {
    matchesEl.innerHTML = "";

    if (!matches || matches.length === 0) {
        matchesEl.innerHTML = `<div class="empty">Матчей не найдено.</div>`;
        return;
    }

    for (const m of matches) {
        const card = document.createElement("div");
        card.className = "match-card";

        const header = document.createElement("div");
        header.className = "match-header";

        const teams = document.createElement("div");
        teams.className = "teams";
        teams.textContent = `${m.team1} vs ${m.team2}`;

        const time = document.createElement("div");
        time.className = "time";
        time.textContent = formatTime(m.startTime);

        header.appendChild(teams);
        header.appendChild(time);

        const tournament = document.createElement("div");
        tournament.className = "tournament";
        tournament.textContent = m.tournament || "Турнир неизвестен";

        const oddsRow = document.createElement("div");
        oddsRow.className = "odds-row";

        const odds = m.odds || {};

        const addOdd = (label, value) => {
            if (value == null) return;
            const pill = document.createElement("div");
            pill.className = "odd-pill";
            pill.innerHTML = `<span class="odd-label">${label}:</span> <span>${value.toFixed(2)}</span>`;
            oddsRow.appendChild(pill);
        };

        addOdd(m.team1, odds.team1_win);
        addOdd(m.team2, odds.team2_win);
        addOdd("Ничья", odds.draw);

        card.appendChild(header);
        card.appendChild(tournament);
        card.appendChild(oddsRow);

        matchesEl.appendChild(card);
    }
}

async function loadMatches() {
    loadBtn.disabled = true;
    statusEl.textContent = "Загружаем матчи...";
    try {
        const matches = await fetchDotaMatches();
        renderMatches(matches);
        statusEl.textContent = `Найдено матчей: ${matches.length}`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Ошибка при загрузке матчей.";
        if (tg) {
            tg.showAlert("Не удалось загрузить матчи. Попробуйте позже.");
        }
    } finally {
        loadBtn.disabled = false;
      }
  }

loadBtn.addEventListener("click", loadMatches);

// Можно сразу загружать при открытии
// loadMatches();
