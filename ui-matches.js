// js/ui/ui-matches.js

/**
 * UI для экрана "Матчи":
 * - табы: MM / Faceit / Квалы
 * - кнопки "сыграть матч"
 * - отображение результата последнего матча
 */

let currentMatchesTab = "mm"; // "mm" | "faceit" | "qual";

function initMatchesUI() {
  const tabMm = document.getElementById("tab-mm");
  const tabFaceit = document.getElementById("tab-faceit");
  const tabQual = document.getElementById("tab-qual");

  const btnPlay = document.getElementById("btn-play-match");
  const resultBlock = document.getElementById("match-result");
  const infoBlock = document.getElementById("match-info");

  if (!tabMm || !tabFaceit || !tabQual || !btnPlay) return;

  // Переключение табов
  tabMm.addEventListener("click", () => switchMatchesTab("mm"));
  tabFaceit.addEventListener("click", () => switchMatchesTab("faceit"));
  tabQual.addEventListener("click", () => switchMatchesTab("qual"));

  // Кнопка "сыграть матч"
  btnPlay.addEventListener("click", () => {
    const player = getPlayerState();
    if (!player) return;

    let result = null;

    if (currentMatchesTab === "mm") {
      result = playMmMatch();
    } else if (currentMatchesTab === "faceit") {
      if (!player.faceit.unlocked) {
        showToast("Сначала прокачайся до 10 уровня, чтобы открыть Faceit.");
        return;
      }
      result = playFaceitMatch();
    } else if (currentMatchesTab === "qual") {
      if (!player.milestones.openQualsUnlocked) {
        showToast("Сначала достигни 10 уровня Faceit, чтобы играть квалы.");
        return;
      }
      result = playQualMatch();
    }

    if (!result) return;

    renderMatchResult(resultBlock, result);
    renderMatchInfo(infoBlock);
  });

  // Первичная отрисовка
  switchMatchesTab("mm");
  renderMatchInfo(infoBlock);
}

/**
 * Переключение таба матчей
 */
function switchMatchesTab(tab) {
  currentMatchesTab = tab;

  const tabMm = document.getElementById("tab-mm");
  const tabFaceit = document.getElementById("tab-faceit");
  const tabQual = document.getElementById("tab-qual");

  [tabMm, tabFaceit, tabQual].forEach((el) => {
    if (!el) return;
    el.classList.remove("active");
  });

  if (tab === "mm" && tabMm) tabMm.classList.add("active");
  if (tab === "faceit" && tabFaceit) tabFaceit.classList.add("active");
  if (tab === "qual" && tabQual) tabQual.classList.add("active");

  const infoBlock = document.getElementById("match-info");
  renderMatchInfo(infoBlock);
}

/**
 * Отрисовка информации о текущем режиме (MM / Faceit / Квалы)
 */
function renderMatchInfo(container) {
  if (!container) return;
  const player = getPlayerState();
  if (!player) {
    container.innerHTML = "<p>Загружаем данные игрока...</p>";
    return;
  }

  if (currentMatchesTab === "mm") {
    container.innerHTML = `
      <h2>Matchmaking (MM)</h2>
      <p>Твой текущий ранг: <b>${player.mm.rankName}</b></p>
      <p>Матчей сыграно: <b>${player.mm.matchesPlayed}</b>, 
         Побед: <b>${player.mm.wins}</b>, Поражений: <b>${player.mm.losses}</b></p>
      <p class="mt-8">Играй матчи, чтобы повышать ранг и открывать новые возможности.</p>
    `;
  } else if (currentMatchesTab === "faceit") {
    if (!player.faceit.unlocked) {
      container.innerHTML = `
        <h2>Faceit</h2>
        <p>Faceit откроется, когда ты достигнешь <b>10 уровня</b>.</p>
        <p class="mt-8">Пока играй MM и тренируйся, чтобы прокачать аккаунт.</p>
      `;
    } else {
      container.innerHTML = `
        <h2>Faceit</h2>
        <p>Уровень: <b>${player.faceit.level}</b>, ELO: <b>${player.faceit.elo}</b></p>
        <p>Матчей: <b>${player.faceit.matchesPlayed}</b>, 
           Побед: <b>${player.faceit.wins}</b>, Поражений: <b>${player.faceit.losses}</b></p>
        <p class="mt-8">Покажи стабильную игру, чтобы добраться до 10 уровня и открыть квалы.</p>
      `;
    }
  } else if (currentMatchesTab === "qual") {
    if (!player.milestones.openQualsUnlocked) {
      container.innerHTML = `
        <h2>Открытые квалификации</h2>
        <p>Квалы откроются, когда ты достигнешь <b>10 уровня Faceit</b>.</p>
        <p class="mt-8">Сначала докажи, что ты стабилен на паблике.</p>
      `;
    } else {
      container.innerHTML = `
        <h2>Открытые квалификации</h2>
        <p>Ты можешь играть квалификации на турниры.</p>
        <p class="mt-8">Побеждай, чтобы получать трофеи и офферы от команд (в следующих версиях).</p>
      `;
    }
  }
}

/**
 * Отрисовка результата последнего матча
 */
function renderMatchResult(container, result) {
  if (!container || !result) return;

  const title =
    result.mode === "mm"
      ? "Результат MM-матча"
      : result.mode === "faceit"
      ? "Результат Faceit-матча"
      : "Результат квалификации";

  const extraLine =
    result.mode === "mm"
      ? `<p>MMR: <b>${result.mmrDelta > 0 ? "+" : ""}${result.mmrDelta}</b>, новый ранг: <b>${result.newRank}</b></p>`
      : result.mode === "faceit"
      ? `<p>ELO: <b>${result.eloDelta > 0 ? "+" : ""}${result.eloDelta}</b>, Faceit lvl: <b>${result.newFaceitLevel}</b></p>`
      : "";

  container.innerHTML = `
    <h2>${title}</h2>
    <p><b>${result.win ? "Победа" : "Поражение"}</b></p>
    <p>K/D/A: <b>${result.kills}/${result.deaths}/${result.assists}</b></p>
    <p>Рейтинг: <b>${result.rating}</b></p>
    <p>Опыт: <b>+${result.xpGain}</b> XP</p>
    ${extraLine}
  `;
}

/**
 * Рендер всего экрана матчей (вызывается из main.js)
 */
function renderMatchesScreen() {
  // Сейчас логика простая: просто обновляем инфо-блок под текущий таб
  const infoBlock = document.getElementById("match-info");
  renderMatchInfo(infoBlock);
}

/* Экспорт в глобальную область */
window.initMatchesUI = initMatchesUI;
window.renderMatchesScreen = renderMatchesScreen;
