// js/ui/ui-navigation.js

/**
 * UI-навигация по экранам:
 * - нижнее меню (Матчи / Тренировка / Календарь / Профиль)
 * - переключение видимых секций
 * - дергаем рендер соответствующего экрана
 */

let currentScreenId = "screen-matches"; // по умолчанию

function initNavigationUI() {
  const navButtons = document.querySelectorAll(".app-nav .nav-btn");
  const screens = document.querySelectorAll(".screen");

  if (!navButtons.length || !screens.length) return;

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-screen");
      if (!targetId) return;

      switchScreen(targetId);
    });
  });

  // Стартовый экран
  switchScreen(currentScreenId);
}

/**
 * Переключение экрана
 * @param {string} screenId - id секции, например "screen-matches"
 */
function switchScreen(screenId) {
  currentScreenId = screenId;

  const screens = document.querySelectorAll(".screen");
  const navButtons = document.querySelectorAll(".app-nav .nav-btn");

  // Показ/скрытие экранов
  screens.forEach((screen) => {
    if (screen.id === screenId) {
      screen.classList.add("active");
    } else {
      screen.classList.remove("active");
    }
  });

  // Подсветка активной кнопки
  navButtons.forEach((btn) => {
    const targetId = btn.getAttribute("data-screen");
    if (targetId === screenId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Точечный рендер контента экрана
  renderScreenContent(screenId);
}

/**
 * Вызов нужного рендера в зависимости от экрана
 */
function renderScreenContent(screenId) {
  if (screenId === "screen-matches") {
    if (typeof renderMatchesScreen === "function") {
      renderMatchesScreen();
    }
  } else if (screenId === "screen-training") {
    if (typeof renderTrainingScreen === "function") {
      renderTrainingScreen();
    }
  } else if (screenId === "screen-calendar") {
    if (typeof renderCalendarScreen === "function") {
      renderCalendarScreen();
    }
  } else if (screenId === "screen-profile") {
    if (typeof renderProfileScreen === "function") {
      renderProfileScreen();
    }
  }
}

/* Экспорт в глобальную область */
window.initNavigationUI = initNavigationUI;
window.switchScreen = switchScreen;
