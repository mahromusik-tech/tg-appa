// js/state.js

// Ключ для localStorage (как кэш/фолбэк)
const STORAGE_KEY_PLAYER = "esports_journey_player_v1";

// Базовые настройки сезонов и календаря
const SEASONS_CONFIG = [
  {
    id: "season-1",
    name: "Сезон 1",
    start: "2025-01-01",
    end: "2025-03-31",
  },
  {
    id: "season-2",
    name: "Сезон 2",
    start: "2025-04-01",
    end: "2025-06-30",
  },
  {
    id: "season-3",
    name: "Сезон 3",
    start: "2025-07-01",
    end: "2025-09-30",
  },
  {
    id: "season-4",
    name: "Сезон 4",
    start: "2025-10-01",
    end: "2025-12-31",
  },
];

// Месяцы, которые считаем трансферными окнами
const TRANSFER_WINDOWS = {
  summer: [6, 7], // июнь, июль
  winter: [12, 1], // декабрь, январь
};

// Базовые ранги MM (упрощенно)
const MM_RANKS = [
  "Silver I",
  "Silver II",
  "Silver III",
  "Silver IV",
  "Silver Elite",
  "Silver Elite Master",
  "Gold Nova I",
  "Gold Nova II",
  "Gold Nova III",
  "Gold Nova Master",
  "Master Guardian I",
  "Master Guardian II",
  "Master Guardian Elite",
  "Distinguished Master Guardian",
  "Legendary Eagle",
  "Legendary Eagle Master",
  "Supreme Master First Class",
  "Global Elite",
];

// Максимальный уровень Faceit
const FACEIT_MAX_LEVEL = 10;

// Глобальное состояние игрока в рантайме
let playerState = null;

/**
 * Создание нового игрока
 * @param {Object} options
 * @param {string} options.nickname
 * @param {string} options.discipline
 */
function createNewPlayer({ nickname, discipline }) {
  const now = new Date().toISOString();

  const baseSkills = {
    aim: 40, // 0-100
    gameSense: 35,
    reaction: 40,
    teamplay: 30,
    mental: 30,
  };

  const player = {
    id: generatePlayerId(),
    nickname,
    discipline, // "cs2" (пока только она)
    createdAt: now,
    lastUpdatedAt: now,

    // Общий прогресс
    level: 1,
    xp: 0,
    xpToNextLevel: 100,

    // MM
    mm: {
      rankIndex: 0, // индекс в MM_RANKS
      rankName: MM_RANKS[0],
      mmr: 0, // внутренний рейтинг для матчмейкинга
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    },

    // Faceit
    faceit: {
      unlocked: false,
      level: 1,
      elo: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
    },

    // Навыки
    skills: {
      ...baseSkills,
      // Суммарный "скилл индекс" для матчмейкинга
      get total() {
        return (
          this.aim +
          this.gameSense +
          this.reaction +
          this.teamplay +
          this.mental
        );
      },
    },

    // Статистика матчей
    stats: {
      totalMatches: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      averageRating: 0, // условный рейтинг игрока
      trophies: [], // трофеи (победы на турнирах, достижения сезонов)
    },

    // Команда и статус
    team: {
      currentTeam: null, // { id, name, tier, joinedAt } или null
      offers: [], // предложения от команд
    },

    // Календарь и сезоны
    calendar: {
      // Список событий: тренировки, турниры, матчи, квалы
      events: [],
    },
    seasons: {
      currentSeasonId: getCurrentSeasonId(),
      history: [], // [{ seasonId, result, rankAtEnd, faceitLevelAtEnd, trophies }]
    },

    // Флаги прогресса
    milestones: {
      faceitUnlocked: false,
      openQualsUnlocked: false,
    },
  };
  playerState = player;
  return player;
}

/**
 * Генерация простого ID игрока
 */
function generatePlayerId() {
  const rand = Math.random().toString(36).substring(2, 8);
  const ts = Date.now().toString(36);
  return `pl_${ts}_${rand}`;
}

/**
 * Получить текущий сезон по дате
 */
function getCurrentSeasonId(date = new Date()) {
  const iso = date.toISOString().slice(0, 10);
  for (const season of SEASONS_CONFIG) {
    if (iso >= season.start && iso <= season.end) {
      return season.id;
    }
  }
  // Если не попали ни в один — вернем первый как дефолт
  return SEASONS_CONFIG[0].id;
}

/**
 * Проверка: сейчас трансферное окно?
 * Возвращает "summer" | "winter" | null
 */
function getCurrentTransferWindow(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  if (TRANSFER_WINDOWS.summer.includes(month)) return "summer";
  if (TRANSFER_WINDOWS.winter.includes(month)) return "winter";
  return null;
}

/**
 * Загрузка состояния игрока
 * (из localStorage; в реальном приложении здесь можно дергать бекенд Telegram)
 */
function loadPlayerState() {
  if (playerState) return playerState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYER);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Восстановим некоторые вычисляемые поля/дефолты
    normalizePlayerState(parsed);

    playerState = parsed;
    return playerState;
  } catch (e) {
    console.error("Ошибка парсинга состояния игрока:", e);
    return null;
  }
}

/**
 * Сохранение состояния игрока
 * (в localStorage; в реальном приложении — отправка на сервер)
 */
function savePlayerState(player) {
  if (!player) return;
  player.lastUpdatedAt = new Date().toISOString();
  playerState = player;

  try {
    const raw = JSON.stringify(player);
    localStorage.setItem(STORAGE_KEY_PLAYER, raw);
  } catch (e) {
    console.error("Ошибка сохранения состояния игрока:", e);
  }
}

/**
 * Нормализация состояния игрока (на случай старых версий)
 */
function normalizePlayerState(player) {
  if (!player.skills) {
    player.skills = {
      aim: 40,
      gameSense: 35,
      reaction: 40,
      teamplay: 30,
      mental: 30,
    };
  }

  if (!player.mm) {
    player.mm = {
      rankIndex: 0,
      rankName: MM_RANKS[0],
      mmr: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
  } else {
    if (typeof player.mm.rankIndex !== "number") {
      player.mm.rankIndex = 0;
    }
    player.mm.rankName = MM_RANKS[player.mm.rankIndex] || MM_RANKS[0];
  }

  if (!player.faceit) {
    player.faceit = {
      unlocked: false,
      level: 1,
      elo: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
    };
  }

  if (!player.stats) {
    player.stats = {
      totalMatches: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      averageRating: 0,
      trophies: [],
    };
  }

  if (!player.team) {
    player.team = {
      currentTeam: null,
      offers: [],
    };
  }

  if (!player.calendar) {
    player.calendar = {
      events: [],
    };
  }

  if (!player.seasons) {
    player.seasons = {
      currentSeasonId: getCurrentSeasonId(),
      history: [],
    };
  }

  if (!player.milestones) {
    player.milestones = {
      faceitUnlocked: !!player.faceit?.unlocked,
      openQualsUnlocked: false,
    };
  }
}

/**
 * Получить текущее состояние игрока (в памяти)
 */
function getPlayerState() {
  if (!playerState) {
    return loadPlayerState();
  }
  return playerState;
}

/**
 * Обновить состояние игрока через колбэк
 * @param {(player: any) => void} updater
 */
function updatePlayerState(updater) {
  const player = getPlayerState();
  if (!player) return;

  updater(player);
  savePlayerState(player);
}

/**
 * Добавить опыт игроку и обработать ап уровня
 */
function addPlayerXp(amount) {
  updatePlayerState((player) => {
    player.xp += amount;

    while (player.xp >= player.xpToNextLevel) {
      player.xp -= player.xpToNextLevel;
      player.level += 1;
      // Можно сделать рост требуемого XP
      player.xpToNextLevel = Math.round(player.xpToNextLevel * 1.2);

      // Разблокировка Faceit, если достигнут нужный уровень
      if (!player.faceit.unlocked && player.level >= 10) {
        player.faceit.unlocked = true;
        player.milestones.faceitUnlocked = true;
      }
    }
  });
}

/**
 * Обновление навыков после матча или тренировки
 * @param {Object} deltaSkills { aim, gameSense, reaction, teamplay, mental }
 */
function updateSkills(deltaSkills) {
  updatePlayerState((player) => {
    const skills = player.skills;
["aim", "gameSense", "reaction", "teamplay", "mental"].forEach((key) => {
      if (typeof deltaSkills[key] === "number") {
        skills[key] = clamp(skills[key] + deltaSkills[key], 0, 100);
      }
    });
  });
}

/**
 * Обновление статистики матчей
 * @param {Object} matchResult
 * @param {"mm"|"faceit"|"qual"} matchResult.type
 * @param {boolean} matchResult.win
 * @param {number} matchResult.kills
 * @param {number} matchResult.deaths
 * @param {number} matchResult.assists
 * @param {number} matchResult.rating
 */
function updateStatsAfterMatch(matchResult) {
  updatePlayerState((player) => {
    const { type, win, kills, deaths, assists, rating } = matchResult;

    // Общая статистика
    player.stats.totalMatches += 1;
    player.stats.totalKills += kills;
    player.stats.totalDeaths += deaths;
    player.stats.totalAssists += assists;

    // Пересчет среднего рейтинга (простая формула)
    const n = player.stats.totalMatches;
    const prevAvg = player.stats.averageRating || 0;
    player.stats.averageRating = (prevAvg * (n - 1) + rating) / n;

    // MM / Faceit
    if (type === "mm") {
      player.mm.matchesPlayed += 1;
      if (win) player.mm.wins += 1;
      else player.mm.losses += 1;
    } else if (type === "faceit") {
      player.faceit.matchesPlayed += 1;
      if (win) player.faceit.wins += 1;
      else player.faceit.losses += 1;
    }
  });
}

/**
 * Обновление ранга MM (на основе внутреннего MMR)
 * @param {number} mmrDelta
 */
function updateMmRank(mmrDelta) {
  updatePlayerState((player) => {
    player.mm.mmr += mmrDelta;
    // Простейшая логика: каждые 100 MMR = +1 ранг
    const newRankIndex = clamp(Math.floor(player.mm.mmr / 100), 0, MM_RANKS.length - 1);
    player.mm.rankIndex = newRankIndex;
    player.mm.rankName = MM_RANKS[newRankIndex];
  });
}

/**
 * Обновление Faceit уровня
 * @param {number} eloDelta
 */
function updateFaceitLevel(eloDelta) {
  updatePlayerState((player) => {
    player.faceit.elo += eloDelta;
    if (player.faceit.elo < 0) player.faceit.elo = 0;

    // Простейшая логика: каждые 200 ELO = +1 уровень
    const newLevel = clamp(
      Math.floor(player.faceit.elo / 200) + 1,
      1,
      FACEIT_MAX_LEVEL
    );
    player.faceit.level = newLevel;

    if (newLevel >= FACEIT_MAX_LEVEL) {
      player.milestones.openQualsUnlocked = true;
    }
  });
}

/**
 * Добавить событие в календарь
 * @param {Object} event
 * @param {string} event.id
 * @param {string} event.date ISO "YYYY-MM-DD"
 * @param {string} event.type "training" | "match" | "tournament" | "qual" | "scrim"
 * @param {string} event.title
 * @param {Object} [event.meta]
 */
function addCalendarEvent(event) {
  updatePlayerState((player) => {
    if (!player.calendar.events) player.calendar.events = [];
    player.calendar.events.push(event);
  });
}

/**
 * Получить события календаря на конкретную дату
 * @param {string} date ISO "YYYY-MM-DD"
 */
function getCalendarEventsByDate(date) {
  const player = getPlayerState();
  if (!player || !player.calendar || !Array.isArray(player.calendar.events)) {
    return [];
  }
  return player.calendar.events.filter((e) => e.date === date);
}

/**
 * Получить текущий сезон (объект)
 */
function getCurrentSeason() {
  const player = getPlayerState();
  const seasonId = player?.seasons?.currentSeasonId || getCurrentSeasonId();
  return SEASONS_CONFIG.find((s) => s.id === seasonId) || SEASONS_CONFIG[0];
}

/**
 * Утилита: ограничение значения
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Экспортируем функции в глобальную область (для других скриптов)
 */
window.createNewPlayer = createNewPlayer;
window.loadPlayerState = loadPlayerState;
window.savePlayerState = savePlayerState;
window.getPlayerState = getPlayerState;
window.updatePlayerState = updatePlayerState;

window.addPlayerXp = addPlayerXp;
window.updateSkills = updateSkills;
window.updateStatsAfterMatch = updateStatsAfterMatch;
window.updateMmRank = updateMmRank;
window.updateFaceitLevel = updateFaceitLevel;

window.addCalendarEvent = addCalendarEvent;
window.getCalendarEventsByDate = getCalendarEventsByDate;
window.getCurrentSeason = getCurrentSeason;
window.getCurrentTransferWindow = getCurrentTransferWindow;

window.MM_RANKS = MM_RANKS;
window.FACEIT_MAX_LEVEL = FACEIT_MAX_LEVEL;
window.SEASONS_CONFIG = SEASONS_CONFIG;
