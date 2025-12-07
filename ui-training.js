// js/ui/ui-training.js

/**
 * UI для экрана "Тренировка":
 * - три карточки: DM, Боты, Aim Lab
 * - запуск тренировки с таймером
 * - отображение результата (XP + прирост скиллов)
 */

let currentTrainingUiState = {
  activeTypeId: null,
};

function initTrainingUI() {
  const btnDm = document.getElementById("btn-training-dm");
  const btnBots = document.getElementById("btn-training-bots");
  const btnAimlab = document.getElementById("btn-training-aimlab");

  const timerBlock = document.getElementById("training-timer");
  const resultBlock = document.getElementById("training-result");

  if (!btnDm || !btnBots || !btnAimlab || !timerBlock || !resultBlock) {
    return;
  }

  btnDm.addEventListener("click", () => handleStartTraining("dm"));
  btnBots.addEventListener("click", () => handleStartTraining("bots"));
  btnAimlab.addEventListener("click", () => handleStartTraining("aimlab"));

  // Первичная отрисовка
  resetTrainingTimerUI();
  resultBlock.innerHTML = `<p>Выбери режим тренировки, чтобы начать.</p>`;
}

/**
 * Обработка запуска тренировки
 * @param {"dm"|"bots"|"aimlab"} typeId
 */
function handleStartTraining(typeId) {
  const player = getPlayerState();
  if (!player) return;

  // Если уже идет тренировка — не даем стартовать новую
  if (currentTrainingUiState.activeTypeId) {
    showToast("Тренировка уже идет. Дождись окончания или перезапусти мини-приложение.");
    return;
  }

  const config = TRAINING_TYPES[typeId];
  if (!config) return;

  const timerBlock = document.getElementById("training-timer");
  const resultBlock = document.getElementById("training-result");
  if (!timerBlock || !resultBlock) return;

  currentTrainingUiState.activeTypeId = typeId;

  // Сбрасываем прошлый результат
  resultBlock.innerHTML = "";

  // Блокируем кнопки на время тренировки
  setTrainingButtonsDisabled(true);

  startTraining(
    typeId,
    (remainingSec) => {
      renderTrainingTimer(timerBlock, typeId, remainingSec);
    },
    (result) => {
      currentTrainingUiState.activeTypeId = null;
      setTrainingButtonsDisabled(false);
      resetTrainingTimerUI();
      renderTrainingResult(resultBlock, result);
      // Обновим профиль, чтобы сразу увидеть рост скиллов и XP
      if (typeof renderProfileScreen === "function") {
        renderProfileScreen();
      }
    }
  );
}

/**
 * Включить/выключить кнопки тренировки
 */
function setTrainingButtonsDisabled(disabled) {
  const ids = ["btn-training-dm", "btn-training-bots", "btn-training-aimlab"];
  ids.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = disabled;
  });
}

/**
 * Отрисовка таймера тренировки
 */
function renderTrainingTimer(container, typeId, remainingSec) {
  if (!container) return;

  const config = TRAINING_TYPES[typeId];
  if (!config) return;

  const total = config.durationSec;
  const formatted = formatSeconds(remainingSec);

  container.innerHTML = `
    <div class="training-timer">
      <span>${config.name}</span>
      <span>${formatted}</span>
    </div>
  `;
}

/**
 * Сброс UI таймера (когда тренировки нет)
 */
function resetTrainingTimerUI() {
  const timerBlock = document.getElementById("training-timer");
  if (!timerBlock) return;

  timerBlock.innerHTML = `
    <div class="training-timer">
      <span>Тренировка не запущена</span>
      <span>00:00</span>
    </div>
  `;
}

/**
 * Отрисовка результата тренировки
 */
function renderTrainingResult(container, result) {
  if (!container) return;

  if (!result) {
    container.innerHTML = `<p>Тренировка не завершилась.</p>`;
    return;
  }

  const d = result.skillDelta;
  const skillsList = `
    <ul style="margin-left: 16px; margin-top: 4px; font-size: 12px;">
      <li>Aim: <b>+${d.aim.toFixed(1)}</b></li>
      <li>Game sense: <b>+${d.gameSense.toFixed(1)}</b></li>
      <li>Reaction: <b>+${d.reaction.toFixed(1)}</b></li>
      <li>Teamplay: <b>+${d.teamplay.toFixed(1)}</b></li>
      <li>Mental: <b>+${d.mental.toFixed(1)}</b></li>
    </ul>
  `;

  container.innerHTML = `
    <div class="training-result">
      <h2>Тренировка завершена</h2>
      <p>Режим: <b>${result.name}</b></p>
      <p>Длительность: <b>${formatSeconds(result.durationSec)}</b></p>
      <p>Опыт: <b>+${result.xpGain}</b> XP</p>
      <div class="mt-8">
        <p>Прирост навыков:</p>
        ${skillsList}
      </div>
    </div>
  `;
}

/**
 * Рендер всего экрана тренировок (если нужно обновить снаружи)
 */
function renderTrainingScreen() {
  // Сейчас логика простая: просто сбрасываем таймер и оставляем последний результат
  resetTrainingTimerUI();
}

/* Экспорт в глобальную область */
window.initTrainingUI = initTrainingUI;
window.renderTrainingScreen = renderTrainingScreen;
