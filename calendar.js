// js/calendar.js

/**
 * Логика календаря:
 * - хранение событий (матчи, тренировки, турниры, сезоны)
 * - выборка событий по дате
 * - информация о сезонах и трансферных окнах
 */

const CALENDAR_STORAGE_KEY = "player_calendar_events";

/**
 * Структура события:
 * {
 *   id: string,
 *   date: "YYYY-MM-DD",
 *   type: "match" | "training" | "tournament" | "other",
 *   title: string,
 *   meta?: object
 * }
 */

/**
 * Загрузка событий календаря из localStorage
 */
function loadCalendarEvents() {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to load calendar events", e);
    return [];
  }
}

/**
 * Сохранение событий календаря
 */
function saveCalendarEvents(events) {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events || []));
  } catch (e) {
    console.error("Failed to save calendar events", e);
  }
}

/**
 * Добавить событие в календарь
 * @param {Object} event
 */
function addCalendarEvent(event) {
  const events = loadCalendarEvents();
  events.push(event);
  saveCalendarEvents(events);
}

/**
 * Получить события по дате (YYYY-MM-DD)
 */
function getCalendarEventsByDate(dateStr) {
  const events = loadCalendarEvents();
  return events.filter((e) => e.date === dateStr);
}

/**
 * Получить все события (для отладки или будущих фич)
 */
function getAllCalendarEvents() {
  return loadCalendarEvents();
}

/**
 * Конфиг сезонов и трансферных окон
 * (упрощенная версия, синхронизирована с SEASONS_CONFIG из state.js)
 *
 * Каждый сезон:
 * - id
 * - name
 * - start: "YYYY-MM-DD"
 * - end: "YYYY-MM-DD"
 * - split: "summer" | "winter" | "offseason"
 * - transferWindows: [{ start, end, type }]
 */

const SEASONS_CONFIG = window.SEASONS_CONFIG || [];

/**
 * Получить текущий сезон по дате
 */
function getSeasonByDate(date = new Date()) {
  const iso = date.toISOString().slice(0, 10);
  const seasons = SEASONS_CONFIG;
  if (!seasons || !seasons.length) return null;

  const found = seasons.find((s) => iso >= s.start && iso <= s.end);
  return found || seasons[0] || null;
}

/**
 * Получить текущее трансферное окно по дате
 */
function getTransferWindowByDate(date = new Date()) {
  const season = getSeasonByDate(date);
  if (!season || !season.transferWindows) return null;

  const iso = date.toISOString().slice(0, 10);
  const win = season.transferWindows.find(
    (w) => iso >= w.start && iso <= w.end
  );
  return win || null;
}

/**
 * Утилита: получить объект { year, month, daysInMonth, firstWeekday }
 */
function getMonthMeta(year, monthIndex) {
  // monthIndex: 0-11
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  return {
    year,
    monthIndex,
    daysInMonth: lastDay.getDate(),
    firstWeekday: firstDay.getDay(), // 0 - воскресенье, 1 - понедельник ...
  };
}

/* Экспорт в глобальную область */
window.addCalendarEvent = addCalendarEvent;
window.getCalendarEventsByDate = getCalendarEventsByDate;
window.getAllCalendarEvents = getAllCalendarEvents;
window.getSeasonByDate = getSeasonByDate;
window.getTransferWindowByDate = getTransferWindowByDate;
window.getMonthMeta = getMonthMeta;
