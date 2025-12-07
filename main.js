// js/main.js

// Глобальный объект Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Флаг: инициализировано ли приложение
let appInitialized = false;

/**
 * Точка входа приложения
 */
document.addEventListener("DOMContentLoaded", () => {
  initTelegram();
  initNavigation();
  initOnboarding();
  initMatchesScreen();
  initTrainingScreen();
  initCalendarScreen();
  initProfileScreen();

  // Попытка загрузить состояние игрока
  const player = loadPlayerStateSafe();

  if (player && player.nickname) {
    // Если игрок уже есть — пропускаем онбординг
    showMainScreens();
    renderAllScreens();
  } else {
    // Первый заход — показываем онбординг
    showOnboardingScreen();
  }

  appInitialized = true;
});

/**
 * Инициализация Telegram WebApp
 */
function initTelegram() {
  if (!tg) return;

  // Расширяем WebApp на весь экран
  tg.expand();

  // Устанавливаем тему (если нужно можно подстроиться под tg.themeParams)
  document.body.classList.add("tg-theme");

  // Можно показать имя пользователя в шапке
  const userInfoEl = document.getElementById("tg-user-info");
  if (userInfoEl && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    const name = user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim();
    userInfoEl.textContent = name || "Гость";
  }
}

/**
 * Безопасная загрузка состояния игрока
 * (обертка над loadPlayerState из state.js)
 */
function loadPlayerStateSafe() {
  if (typeof loadPlayerState === "function") {
    try {
      return loadPlayerState();
    } catch (e) {
      console.error("Ошибка загрузки состояния игрока:", e);
      return null;
    }
  }
  return null;
}

/**
 * Сохранение состояния игрока
 */
function savePlayerStateSafe(player) {
  if (typeof savePlayerState === "function") {
    try {
      savePlayerState(player);
    } catch (e) {
      console.error("Ошибка сохранения состояния игрока:", e);
    }
  }
}

/**
 * Инициализация онбординга (первый экран)
 */
function initOnboarding() {
  const startBtn = document.getElementById("btn-start-journey");
  const nicknameInput = document.getElementById("input-nickname");

  if (!startBtn || !nicknameInput) return;

  startBtn.addEventListener("click", () => {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
      showToast("Введите никнейм");
      return;
    }

    // Пока доступна только CS2
    const discipline = "cs2";

    // Создаем нового игрока через state.js
    if (typeof createNewPlayer === "function") {
      const player = createNewPlayer({ nickname, discipline });
      savePlayerStateSafe(player);
    }

    // Переходим к основным экранам
    showMainScreens();
    renderAllScreens();
  });
}

/**
 * Показать только онбординг (первый заход)
 */
function showOnboardingScreen() {
  const onboarding = document.getElementById("screen-onboarding");
  const mainScreens = [
    "screen-matches",
    "screen-training",
    "screen-calendar",
    "screen-profile",
  ];

  if (onboarding) {
    onboarding.classList.add("active");
  }

  mainScreens.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  // Скрываем нижнюю навигацию
  const nav = document.querySelector(".app-nav");
  if (nav) nav.style.display = "none";
}

/**
 * Показать основные экраны (после онбординга)
 */
function showMainScreens() {
  const onboarding = document.getElementById("screen-onboarding");
  if (onboarding) onboarding.classList.remove("active");

  // По умолчанию открываем экран матчей
  switchScreen("screen-matches");

  // Показываем нижнюю навигацию
  const nav = document.querySelector(".app-nav");
  if (nav) nav.style.display = "flex";
}

/**
 * Инициализация нижней навигации
 */
function initNavigation() {
  const navButtons = document.querySelectorAll(".app-nav .nav-btn");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screenId = btn.getAttribute("data-screen");
      if (!screenId) return;

      switchScreen(screenId);

      // Обновляем активное состояние кнопок
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

/**
 * Переключение экранов по id секции
 */
function switchScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    if (screen.id === screenId) {
      screen.classList.add("active");
    } else {
      screen.classList.remove("active");
    }
  });

  // При переключении можно перерисовывать соответствующий экран
  if (!appInitialized) return;

  switch (screenId) {
    case "screen-matches":
      if (typeof renderMatchesScreen === "function") {
        renderMatchesScreen();
      }
      break;
    case "screen-training":
      if (typeof renderTrainingScreen === "function") {
        renderTrainingScreen();
      }
      break;
    case "screen-calendar":
      if (typeof renderCalendarScreen === "function") {
        renderCalendarScreen();
      }
      break;
    case "screen-profile":
      if (typeof renderProfileScreen === "function") {
        renderProfileScreen();
      }
      break;
  }
}

/**
 * Рендер всех экранов (после онбординга или загрузки состояния)
 */
function renderAllScreens() {
  if (typeof renderMatchesScreen === "function") renderMatchesScreen();
  if (typeof renderTrainingScreen === "function") renderTrainingScreen();
  if (typeof renderCalendarScreen === "function") renderCalendarScreen();
  if (typeof renderProfileScreen === "function") renderProfileScreen();
}

/**
 * Инициализация экрана матчей
 * (подключение табов MM / Faceit / Квалы и т.п.)
 */
function initMatchesScreen() {
  if (typeof initMatchesUI === "function") {
    initMatchesUI();
  }
}

/**
 * Инициализация экрана тренировок
 */
function initTrainingScreen() {
  if (typeof initTrainingUI === "function") {
    initTrainingUI();
  }
}

/**
 * Инициализация экрана календаря
 */
function initCalendarScreen() {
  if (typeof initCalendarUI === "function") {
    initCalendarUI();
  }
}

/**
 * Инициализация экрана профиля
 */
function initProfileScreen() {
  if (typeof initProfileUI === "function") {
    initProfileUI();
  }
}

/**
 * Простая функция для показа уведомлений
 * (можно заменить на кастомный UI)
 */
function showToast(message) {
  if (tg && typeof tg.showPopup === "function") {
    tg.showPopup({
      title: "Уведомление",
      message,
      buttons: [{ type: "close" }],
    });
  } else {
    alert(message);
  }
}
