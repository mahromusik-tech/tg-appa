// js/ui/ui-profile.js

/**
 * UI для экрана "Профиль":
 * - карточка игрока (ник, дисциплина, уровень)
 * - базовая статистика (матчи, K/D, средний рейтинг)
 * - ранги MM и Faceit
 */

function initProfileUI() {
  // Пока инициализация простая, без событий
  renderProfileScreen();
}

/**
 * Рендер экрана профиля
 */
function renderProfileScreen() {
  const player = getPlayerState();
  const card = document.getElementById("profile-card");
  const statsBlock = document.getElementById("profile-stats");

  if (!card || !statsBlock) return;

  if (!player) {
    card.innerHTML = "<p>Профиль не найден. Перезапусти мини-приложение.</p>";
    statsBlock.innerHTML = "";
    return;
  }

  renderProfileCard(card, player);
  renderProfileStats(statsBlock, player);
}

/**
 * Карточка игрока
 */
function renderProfileCard(container, player) {
  const disciplineName = player.discipline === "cs2" ? "CS2" : player.discipline;

  const currentTeam = player.team?.currentTeam
    ? `<p>Команда: <b>${player.team.currentTeam.name}</b> (tier ${player.team.currentTeam.tier})</p>`
    : "<p>Команда: <b>соло игрок</b></p>";

  container.innerHTML = `
    <h2>${player.nickname}</h2>
    <p>Дисциплина: <b>${disciplineName}</b></p>
    <p>Уровень аккаунта: <b>${player.level}</b> (${player.xp}/${player.xpToNextLevel} XP)</p>
    <p>MM: <b>${player.mm.rankName}</b></p>
    <p>Faceit: <b>${player.faceit.unlocked ? player.faceit.level + " lvl" : "закрыт"}</b></p>
    ${currentTeam}
  `;
}

/**
 * Статистика игрока
 */
function renderProfileStats(container, player) {
  const s = player.stats;
  const totalMatches = s.totalMatches || 0;
  const kd =
    s.totalDeaths > 0 ? (s.totalKills / s.totalDeaths).toFixed(2) : "—";
  const avgRating = s.averageRating ? s.averageRating.toFixed(2) : "—";

  const skills = player.skills || {};
  const skillsView = `
    <p>Навыки:</p>
    <ul style="margin-left: 16px; margin-top: 4px; font-size: 12px;">
      <li>Aim: <b>${skills.aim?.toFixed ? skills.aim.toFixed(1) : skills.aim || 0}</b></li>
      <li>Game sense: <b>${skills.gameSense?.toFixed ? skills.gameSense.toFixed(1) : skills.gameSense || 0}</b></li>
      <li>Reaction: <b>${skills.reaction?.toFixed ? skills.reaction.toFixed(1) : skills.reaction || 0}</b></li>
      <li>Teamplay: <b>${skills.teamplay?.toFixed ? skills.teamplay.toFixed(1) : skills.teamplay || 0}</b></li>
      <li>Mental: <b>${skills.mental?.toFixed ? skills.mental.toFixed(1) : skills.mental || 0}</b></li>
    </ul>
  `;

  container.innerHTML = `
    <h2>Статистика</h2>
    <p>Матчей всего: <b>${totalMatches}</b></p>
    <p>Всего K/D/A: <b>${s.totalKills}/${s.totalDeaths}/${s.totalAssists}</b></p>
    <p>Средний K/D: <b>${kd}</b></p>
    <p>Средний рейтинг: <b>${avgRating}</b></p>
    <div class="mt-8">
      ${skillsView}
    </div>
  `;
}

/* Экспорт в глобальную область */
window.initProfileUI = initProfileUI;
window.renderProfileScreen = renderProfileScreen;
