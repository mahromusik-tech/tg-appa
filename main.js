// js/main.js

/**
 * Точка входа приложения:
 * - инициализация состояния игрока
 * - обработка ввода ника
 * - инициализация UI (навигация, тренировки, календарь, профиль, матчи)
 * - переключение с онбординга на основной интерфейс
 */

// Безопасный лог
function logError(context, error) {
  console.error(`[EsportsJourney] ${context}`, error);
}

/**
 * Инициализация после загрузки DOM
 */
document.addEventListener("DOMContentLoaded", () => {
  try {
    initApp();
  } catch (e) {
    logError("initApp failed", e);
  }
});

function initApp() {
  // 1. Проверяем, есть ли уже сохраненный игрок
  let player = null;
  if (typeof getPlayerState === "function") {
    player = getPlayerState();
  }

  // 2. Инициализируем UI-навигацию и экраны
  safeCall(initNavigationUI, "initNavigationUI");
  safeCall(initTrainingUI, "initTrainingUI");
  safeCall(initCalendarUI, "initCalendarUI");

  // 3. Если игрок уже есть — сразу показываем основной интерфейс
  if (player && player.nickname) {
    showMainApp();
    return;
  }

  // 4. Иначе показываем экран онбординга
  showOnboarding();
  initOnboardingForm();
}

/**
 * Инициализация формы ввода ника
 */
function initOnboardingForm() {
  const input = document.getElementById("input-nickname");
  const btn = document.getElementById("btn-start");

  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const nickname = (input.value || "").trim();
    if (!nickname) {
      showToast("Введи ник, чтобы продолжить.");
      return;
    }

    try {
      // Создаем / обновляем игрока
      if (typeof createOrUpdatePlayer === "function") {
        createOrUpdatePlayer({ nickname });
      } else if (typeof setPlayerNickname === "function") {
        // запасной вариант, если у тебя другая функция
        setPlayerNickname(nickname);
      }

      showMainApp();
    } catch (e) {
      logError("Failed to create player", e);
      showToast("Не удалось сохранить ник. Попробуй еще раз.");
    }
  });
}

/**
 * Показ основного приложения (после онбординга)
 */
function showMainApp() {
  // Скрываем онбординг
  const onboarding = document.getElementById("screen-onboarding");
  if (onboarding) {
    onboarding.classList.remove("active");
  }

  // Показываем стартовый экран (матчи)
  if (typeof switchScreen === "function") {
    switchScreen("screen-matches");
  } else {
    // fallback: просто показать секцию
    const matches = document.getElementById("screen-matches");
    if (matches) matches.classList.add("active");
  }
}

/**
 * Показ онбординга (если нет игрока)
 */
function showOnboarding() {
  const onboarding = document.getElementById("screen-onboarding");
  const screens = document.querySelectorAll(".screen");

  screens.forEach((s) => {
    if (s.id === "screen-onboarding") {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });

  if (onboarding) {
    onboarding.classList.add("active");
  }
}

/**
 * Безопасный вызов функции
 */
function safeCall(fn, name) {
  try {
    if (typeof fn === "function") {
      fn();
    }
  } catch (e) {
    logError(`${name} failed`, e);
  }
}

/**
 * Простая реализация showToast, если своей нет
 */
if (typeof window.showToast !== "function") {
  window.showToast = function (msg) {
    alert(msg);
  };
}
