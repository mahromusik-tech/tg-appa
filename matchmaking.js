          /* styles/styles.css */

/* Сброс базовых стилей */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  background-color: #0b0c10;
  color: #f5f5f5;
}

/* Корневой контейнер приложения */
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Шапка */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(90deg, #141824, #10131c);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.app-title {
  display: flex;
  flex-direction: column;
}

.app-title-main {
  font-size: 16px;
  font-weight: 600;
}

.app-title-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.app-user-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* Основной контент */
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 64px; /* отступ под нижнюю навигацию */
}

/* Экраны */
.screen {
  display: none;
}

.screen.active {
  display: block;
}

.screen-content {
  max-width: 600px;
  margin: 0 auto;
}

/* Заголовки */
h1 {
  font-size: 20px;
  margin-bottom: 8px;
}

h2 {
  font-size: 16px;
  margin: 12px 0 6px;
}

/* Текст */
p {
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

/* Кнопки */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.05s ease,
    box-shadow 0.15s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn.primary {
  background: linear-gradient(135deg, #00b4ff, #0077ff);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(0, 180, 255, 0.4);
  width: 100%;
  margin-top: 16px;
}

.btn.primary:disabled {
  opacity: 0.5;
  box-shadow: none;
  cursor: default;
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.btn.ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  padding: 4px 10px;
}

/* Инпуты */
.input-text {
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(10, 12, 20, 0.9);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  margin-top: 4px;
}

.input-text::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-text:focus {
  border-color: #00b4ff;
  box-shadow: 0 0 0 1px rgba(0, 180, 255, 0.4);
}

/* Выбор дисциплины */
.discipline-select {
  margin-top: 16px;
}

.discipline-list {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.discipline-card {
  flex: 1;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: radial-gradient(circle at top left, #1b2335, #10131c);
  color: #ffffff;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.discipline-card .discipline-name {
  font-weight: 600;
}

.discipline-card .discipline-status {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.discipline-card.active {
  border-color: #00b4ff;
  box-shadow: 0 0 10px rgba(0, 180, 255, 0.4);
}

.discipline-card.disabled {
  opacity: 0.4;
  cursor: default;
}

/* Блок никнейма */
.nickname-block {
  margin-top: 16px;
}

/* Нижняя навигация */
.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: rgba(10, 12, 20, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 4px 6px;
  z-index: 10;
}

.nav-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  padding: 6px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-btn.active {
  background: rgba(0, 180, 255, 0.16);
  color: #ffffff;
}

/* Табы */
.tabs {
  display: flex;
  gap: 6px;
  margin: 10px 0 12px;
}

.tab-btn {
  flex: 1;
  border-radius: 999px;
  border: none;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  background: linear-gradient(135deg, #00b4ff, #0077ff);
  color: #ffffff;
}

/* Карточки тренировок */
.training-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.training-card {
  border-radius: 12px;
  padding: 10px;
  background: radial-gradient(circle at top left, #1b2335, #10131c);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.training-card h2 {
  margin-top: 0;
}

.training-card p {
  margin: 4px 0 8px;
}

/* Таймер тренировки */
.training-timer {
  margin-top: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.training-result {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
  font-size: 13px;
}

/* Календарь */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 10px;
}

#calendar-current-month {
  font-size: 14px;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 10px;
}

.calendar-day {
  border-radius: 8px;
  padding: 6px 4px;
  text-align: center;
  font-size: 11px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
}

.calendar-day.today {
  border: 1px solid #00b4ff;
}

.calendar-day.has-events {
  background: rgba(0, 180, 255, 0.16);
}

.calendar-day.selected {
  outline: 1px solid #ffffff;
}

.calendar-day-events {
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.4);
  font-size: 12px;
}

/* Профиль */
.profile-card {
  border-radius: 12px;
  padding: 10px;
  background: radial-gradient(circle at top left, #1b2335, #10131c);
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 10px;
}

.profile-stats {
  border-radius: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
}

/* Вспомогательные классы */
.hidden {
  display: none !important;
}

.mt-8 {
  margin-top: 8px;
}

.mt-12 {
  margin-top: 12px;
}Копировать
js/matchmaking.js
// js/matchmaking.js

/**
 * Логика матчей:
 * - подбор сложности соперников на основе ранга и скилла
 * - генерация статистики матча
 * - ускоренный/замедленный прогресс в зависимости от того,
 *   насколько игрок «перерастает» свой ранг
 */

/**
 * Получить параметры матча MM
 * Учитывает:
 * - текущий ранг
 * - суммарный скилл игрока
 * - ограничение: на низких рангах не кидает против слишком сильных
 */
function getMmMatchContext() {
  const player = getPlayerState();
  if (!player) return null;

  const rankIndex = player.mm.rankIndex;
  const totalSkill =
    player.skills.aim +
    player.skills.gameSense +
    player.skills.reaction +
    player.skills.teamplay +
    player.skills.mental;

  // Базовый "ожидаемый" скилл для каждого ранга (очень грубо)
  const expectedSkillByRank = 80 + rankIndex * 15; // растет с рангом

  // Ограничение матчмейкинга:
  // - на Silver (первые 6 рангов) не даем слишком сильных соперников
  const isLowRank = rankIndex <= 5;

  // Сложность соперников (0.5-1.5)
  let difficulty = 1;

  if (isLowRank) {
    // На низких рангах ограничиваем максимум сложности
    difficulty = 0.8 + Math.random() * 0.3; // 0.8-1.1
  } else {
    // На более высоких рангах разброс больше
    difficulty = 0.9 + Math.random() * 0.5; // 0.9-1.4
  }

  // Насколько игрок сильнее/слабее ожидаемого для своего ранга
  const skillDiff = totalSkill - expectedSkillByRank;

  return {
    rankIndex,
    totalSkill,
    expectedSkillByRank,
    skillDiff,
    difficulty,
  };
}

/**
 * Сыграть MM-матч (симуляция)
 * @returns {Object} результат матча
 */
function playMmMatch() {
  const player = getPlayerState();
  if (!player) return null;

  const ctx = getMmMatchContext();
  if (!ctx) return null;

  const { totalSkill, expectedSkillByRank, skillDiff, difficulty } = ctx;

  // Базовые параметры матча
  const baseRounds = 24; // условное количество раундов
  const baseKills = 15;
  const baseDeaths = 15;

  // Коэффициент "перероста ранга":
  // если игрок сильно выше ожидаемого, он доминирует
  const overSkillFactor = clamp(skillDiff / 100, -0.5, 0.8);
  // difficulty > 1 — соперники сильнее, < 1 — слабее
  const difficultyFactor = difficulty - 1; // -0.5..+0.5

  // Итоговый "перформанс" игрока
  const performance = 1 + overSkillFactor - difficultyFactor;

  // Генерация статистики
  const kills = Math.max(
    0,
    Math.round(
      baseKills * performance + randomRange(-3, 5)
    )
  );
  const deaths = Math.max(
    1,
    Math.round(
      baseDeaths / performance + randomRange(-3, 3)
    )
  );
  const assists = Math.max(
    0,
    Math.round(
      (baseRounds - kills) * 0.2 * performance + randomRange(-2, 3)
    )
  );

  // Условный рейтинг (0.5-1.6)
  const kd = kills / deaths;
  let rating = 0.6 + kd * 0.4 + overSkillFactor * 0.3;
  rating = clamp(rating, 0.5, 1.6);

  // Вероятность победы зависит от performance
  const winChance = clamp(0.4 + (performance - 1) * 0.5, 0.1, 0.9);
  const win = Math.random() < winChance;

  // Прогресс: XP, MMR, навыки
  const baseXp = 40;
  const baseMmrDelta = win ? 30 : -15;

  // Если игрок сильно выше ожидаемого для ранга — ускоряем прогресс
  let mmrDelta = baseMmrDelta;
  let xpGain = baseXp;

  if (skillDiff > 60) {
    // очень сильный для ранга
    mmrDelta *= 1.6;
    xpGain *= 1.4;
  } else if (skillDiff > 30) {
    mmrDelta *= 1.3;
    xpGain *= 1.2;
  } else if (skillDiff < -40) {
    // сильно слабее ожидаемого — замедляем прогресс
    mmrDelta *= 0.7;
    xpGain *= 0.8;
  }

  mmrDelta = Math.round(mmrDelta);
  xpGain = Math.round(xpGain);

  // Обновляем состояние игрока
  updateStatsAfterMatch({
    type: "mm",
    win,
    kills,
    deaths,
    assists,
    rating,
  });

  updateMmRank(mmrDelta);
  addPlayerXp(xpGain);

  // Навыки: небольшой рост aim / gameSense / mental
  const skillDelta = {
    aim: randomRange(0.2, 0.8),
    gameSense: randomRange(0.2, 0.7),
    reaction: randomRange(0.1, 0.5),
    teamplay: randomRange(0.1, 0.5),
    mental: randomRange(0.1, 0.4),
  };
  updateSkills(skillDelta);

  return {
    mode: "mm",
    win,
    kills,
    deaths,
    assists,
    rating: Number(rating.toFixed(2)),
    xpGain,
    mmrDelta,
    newRank: getPlayerState().mm.rankName,
    skillDelta,
  };
}

/**
 * Сыграть Faceit-матч (симуляция)
 * @returns {Object|null}
 */
function playFaceitMatch() {
  const player = getPlayerState();
  if (!player || !player.faceit.unlocked) return null;

  const totalSkill =
    player.skills.aim +
    player.skills.gameSense +
    player.skills.reaction +
    player.skills.teamplay +
    player.skills.mental;

  const level = player.faceit.level;
  const expectedSkill = 120 + level * 20;

  const skillDiff = totalSkill - expectedSkill;

  const baseKills = 18;
  const baseDeaths = 16;

  const overSkillFactor = clamp(skillDiff / 120, -0.5, 0.8);

  const kills = Math.max(
    0,
    Math.round(baseKills * (1 + overSkillFactor) + randomRange(-4, 6))
  );
  const deaths = Math.max(
    1,
    Math.round(baseDeaths * (1 - overSkillFactor) + randomRange(-3, 3))
  );
  const assists = Math.max(
    0,
    Math.round((20 - kills) * 0.25 * (1 + overSkillFactor) + randomRange(-2, 3))
  );

  const kd = kills / deaths;
  let rating = 0.7 + kd * 0.5 + overSkillFactor * 0.3;
  rating = clamp(rating, 0.6, 1.8);

  const winChance = clamp(0.45 + overSkillFactor * 0.4, 0.15, 0.9);
  const win = Math.random() < winChance;

  const baseXp = 60;
  const baseEloDelta = win ? 35 : -25;

  let eloDelta = baseEloDelta;
  let xpGain = baseXp;

  if (skillDiff > 80) {
    eloDelta *= 1.5;
    xpGain *= 1.3;
  } else if (skillDiff > 40) {
    eloDelta *= 1.2;
    xpGain *= 1.15;
  } else if (skillDiff < -60) {
    eloDelta *= 0.7;
    xpGain *= 0.8;
  }

  eloDelta = Math.round(eloDelta);
  xpGain = Math.round(xpGain);

  updateStatsAfterMatch({
    type: "faceit",
    win,
    kills,
    deaths,
    assists,
    rating,
  });

  updateFaceitLevel(eloDelta);
  addPlayerXp(xpGain);

  const skillDelta = {
    aim: randomRange(0.3, 1.0),
    gameSense: randomRange(0.3, 0.9),
    reaction: randomRange(0.2, 0.7),
    teamplay: randomRange(0.3, 0.9),
    mental: randomRange(0.2, 0.7),
  };
  updateSkills(skillDelta);

  // Если достигнут 10 lvl — открываем квалы (флаг уже ставится в updateFaceitLevel)
  return {
    mode: "faceit",
    win,
    kills,
    deaths,
    assists,
    rating: Number(rating.toFixed(2)),
    xpGain,
    eloDelta,
    newFaceitLevel: getPlayerState().faceit.level,
    skillDelta,
  };
}

/**
 * Симуляция матча квалификации (после 10 lvl Faceit)
 */
function playQualMatch() {
  const player = getPlayerState();
  if (!player || !player.milestones.openQualsUnlocked) return null;

  const totalSkill =
    player.skills.aim +
    player.skills.gameSense +
    player.skills.reaction +
    player.skills.teamplay +
    player.skills.mental;

  const baseKills = 20;
  const baseDeaths = 18;

  const overSkillFactor = clamp((totalSkill - 260) / 150, -0.4, 0.8);

  const kills = Math.max(
    0,
    Math.round(baseKills * (1 + overSkillFactor) + randomRange(-5, 7))
  );
  const deaths = Math.max(
    1,
    Math.round(baseDeaths * (1 - overSkillFactor) + randomRange(-4, 4))
  );
  const assists = Math.max(
    0,
    Math.round((24 - kills) * 0.3 * (1 + overSkillFactor) + randomRange(-3, 4))
  );

  const kd = kills / deaths;
  let rating = 0.8 + kd * 0.6 + overSkillFactor * 0.4;
  rating = clamp(rating, 0.7, 2.0);

  const winChance = clamp(0.4 + overSkillFactor * 0.5, 0.2, 0.9);
  const win = Math.random() < winChance;

  const xpGain = Math.round(80 * (win ? 1.2 : 1));
  updateStatsAfterMatch({
    type: "qual",
    win,
    kills,
    deaths,
    assists,
    rating,
  });
  addPlayerXp(xpGain);

  const skillDelta = {
    aim: randomRange(0.4, 1.2),
    gameSense: randomRange(0.4, 1.1),
    reaction: randomRange(0.3, 0.9),
    teamplay: randomRange(0.4, 1.0),
    mental: randomRange(0.4, 1.0),
  };
  updateSkills(skillDelta);

  // Здесь позже можно добавить:
  // - прогресс по сетке квалификации
  // - шанс получить оффер от команды в зависимости от статы

  return {
    mode: "qual",
    win,
    kills,
    deaths,
    assists,
    rating: Number(rating.toFixed(2)),
    xpGain,
    skillDelta,
  };
}

/**
 * Утилита: случайное число в диапазоне [min, max]
 */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/* Экспорт в глобальную область */
window.playMmMatch = playMmMatch;
window.playFaceitMatch = playFaceitMatch;
window.playQualMatch = playQualMatch;
