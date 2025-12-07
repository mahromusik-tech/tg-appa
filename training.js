        // js/training.js

/**
 * Логика тренировок:
 * 1. DM (1 минута) — aim + gameSense
 * 2. Боты (30 сек) — aim + reaction
 * 3. Aim lab (15 сек) — aim (минимальный прирост)
 *
 * Здесь только логика и таймер, UI-кнопки и вывод результата
 * делаем в ui/ui-training.js
 */

const TRAINING_TYPES = {
  dm: {
    id: "dm",
    name: "Deathmatch",
    durationSec: 60,
    xp: 30,
    skillDeltaRange: {
      aim: [0.6, 1.4],
      gameSense: [0.4, 1.0],
      reaction: [0.2, 0.6],
      teamplay: [0.1, 0.4],
      mental: [0.1, 0.4],
    },
  },
  bots: {
    id: "bots",
    name: "Боты",
    durationSec: 30,
    xp: 18,
    skillDeltaRange: {
      aim: [0.5, 1.2],
      gameSense: [0.1, 0.4],
      reaction: [0.5, 1.0],
      teamplay: [0, 0.2],
      mental: [0.1, 0.4],
    },
  },
  aimlab: {
    id: "aimlab",
    name: "Aim Lab",
    durationSec: 15,
    xp: 10,
    skillDeltaRange: {
      aim: [0.3, 0.8],
      gameSense: [0, 0.2],
      reaction: [0.2, 0.6],
      teamplay: [0, 0.1],
      mental: [0, 0.2],
    },
  },
};

let currentTraining = null; // { typeId, endTime, timerId }

/**
 * Запуск тренировки
 * @param {"dm"|"bots"|"aimlab"} typeId
 * @param {function} onTick (remainingSec) — колбэк таймера
 * @param {function} onFinish (result) — колбэк завершения
 */
function startTraining(typeId, onTick, onFinish) {
  const player = getPlayerState();
  if (!player) return;

  const config = TRAINING_TYPES[typeId];
  if (!config) return;

  // Если уже идет тренировка — игнор
  if (currentTraining && currentTraining.timerId) return;

  const duration = config.durationSec;
  const endTime = Date.now() + duration * 1000;

  let lastRemaining = duration;

  // Сохраняем состояние текущей тренировки
  currentTraining = {
    typeId,
    endTime,
    timerId: null,
  };

  // Первый тик
  if (typeof onTick === "function") {
    onTick(lastRemaining);
  }

  const timerId = setInterval(() => {
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    if (remainingSec !== lastRemaining) {
      lastRemaining = remainingSec;
      if (typeof onTick === "function") {
        onTick(remainingSec);
      }
    }

    if (remainingMs <= 0) {
      clearInterval(timerId);
      const result = finishTraining(typeId);
      currentTraining = null;
      if (typeof onFinish === "function") {
        onFinish(result);
      }
    }
  }, 200);

  currentTraining.timerId = timerId;
}

/**
 * Принудительная остановка тренировки (без награды)
 */
function cancelTraining() {
  if (!currentTraining) return;
  if (currentTraining.timerId) {
    clearInterval(currentTraining.timerId);
  }
  currentTraining = null;
}

/**
 * Завершение тренировки: начисление XP и скиллов
 * @param {"dm"|"bots"|"aimlab"} typeId
 * @returns {Object} result
 */
function finishTraining(typeId) {
  const player = getPlayerState();
  if (!player) return null;

  const config = TRAINING_TYPES[typeId];
  if (!config) return null;

  const xpGain = config.xp;

  // Генерируем дельту навыков по диапазонам
  const ranges = config.skillDeltaRange;
  const skillDelta = {
    aim: randomRange(ranges.aim[0], ranges.aim[1]),
    gameSense: randomRange(ranges.gameSense[0], ranges.gameSense[1]),
    reaction: randomRange(ranges.reaction[0], ranges.reaction[1]),
    teamplay: randomRange(ranges.teamplay[0], ranges.teamplay[1]),
    mental: randomRange(ranges.mental[0], ranges.mental[1]),
  };

  // Обновляем состояние
  addPlayerXp(xpGain);
  updateSkills(skillDelta);

  // Можно добавить событие в календарь как "тренировка"
  const today = new Date().toISOString().slice(0, 10);
  addCalendarEvent({
    id: `training_${typeId}_${Date.now()}`,
    date: today,
    type: "training",
    title: `Тренировка: ${config.name}`,
    meta: {
      typeId,
      xpGain,
      skillDelta,
    },
  });

  return {
    typeId,
    name: config.name,
    xpGain,
    skillDelta,
    durationSec: config.durationSec,
  };
}

/**
 * Утилита: форматирование секунд в mm:ss
 */
function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

/* Экспорт в глобальную область */
window.TRAINING_TYPES = TRAINING_TYPES;
window.startTraining = startTraining;
window.cancelTraining = cancelTraining;
window.finishTraining = finishTraining;
window.formatSeconds = formatSeconds;
