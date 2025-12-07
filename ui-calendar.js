// js/ui/ui-calendar.js

/**
 * UI для экрана "Календарь":
 * - переключение месяцев
 * - подсветка дней с событиями
 * - список событий выбранного дня
 * - отображение текущего сезона и трансферного окна
 */

let calendarState = {
  currentYear: null,
  currentMonthIndex: null, // 0-11
  selectedDate: null, // "YYYY-MM-DD"
};

function initCalendarUI() {
  const prevBtn = document.getElementById("calendar-prev");
  const nextBtn = document.getElementById("calendar-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => changeMonth(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => changeMonth(1));
  }

  // Инициализация текущим месяцем
  const today = new Date();
  calendarState.currentYear = today.getFullYear();
  calendarState.currentMonthIndex = today.getMonth();
  calendarState.selectedDate = today.toISOString().slice(0, 10);

  renderCalendar();
}

/**
 * Смена месяца
 * @param {number} delta -1 или 1
 */
function changeMonth(delta) {
  let { currentYear, currentMonthIndex } = calendarState;
  currentMonthIndex += delta;

  if (currentMonthIndex < 0) {
    currentMonthIndex = 11;
    currentYear -= 1;
  } else if (currentMonthIndex > 11) {
    currentMonthIndex = 0;
    currentYear += 1;
  }

  calendarState.currentYear = currentYear;
  calendarState.currentMonthIndex = currentMonthIndex;

  renderCalendar();
}

/**
 * Рендер всего календаря
 */
function renderCalendar() {
  const monthLabel = document.getElementById("calendar-current-month");
  const grid = document.getElementById("calendar-grid");
  const dayEventsBlock = document.getElementById("calendar-day-events");
  const seasonInfoBlock = document.getElementById("calendar-season-info");

  if (!grid || !monthLabel || !dayEventsBlock || !seasonInfoBlock) return;

  const { currentYear, currentMonthIndex, selectedDate } = calendarState;
  const meta = getMonthMeta(currentYear, currentMonthIndex);

  // Название месяца
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  monthLabel.textContent = `${monthNames[currentMonthIndex]} ${currentYear}`;

  // Рендер инфо о сезоне
  renderSeasonInfo(seasonInfoBlock);

  // Рендер сетки дней
  renderCalendarGrid(grid, meta, selectedDate);

  // Рендер событий выбранного дня
  renderDayEvents(dayEventsBlock, selectedDate);
}

/**
 * Рендер информации о текущем сезоне и трансферном окне
 */
function renderSeasonInfo(container) {
  if (!container) return;

  const today = new Date();
  const season = getSeasonByDate(today);
  const windowInfo = getTransferWindowByDate(today);

  if (!season) {
    container.innerHTML = `
      <p>Сезон: <b>неизвестен</b></p>
    `;
    return;
  }

  const splitLabel =
    season.split === "summer"
      ? "Летний сплит"
      : season.split === "winter"
      ? "Зимний сплит"
      : "Межсезонье";

  const transferLine = windowInfo
    ? `<p>Трансферное окно: <b>${formatDate(windowInfo.start)} — ${formatDate(
        windowInfo.end
      )}</b> (${windowInfo.type})</p>`
    : `<p>Сейчас трансферное окно <b>закрыто</b>.</p>`;

  container.innerHTML = `
    <p>Сезон: <b>${season.name}</b> (${splitLabel})</p>
    <p>Даты: <b>${formatDate(season.start)} — ${formatDate(season.end)}</b></p>
    ${transferLine}
  `;
}

/**
 * Рендер сетки календаря
 */
function renderCalendarGrid(container, meta, selectedDate) {
  container.innerHTML = "";

  const { year, monthIndex, daysInMonth, firstWeekday } = meta;

  // В JS воскресенье = 0, нам удобнее считать понедельник = 1
  // Сдвигаем, чтобы неделя начиналась с понедельника
  const offset = (firstWeekday + 6) % 7; // 0-6

  // Пустые ячейки до первого дня
  for (let i = 0; i < offset; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day";
    emptyCell.style.visibility = "hidden";
    container.appendChild(emptyCell);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const events = getAllCalendarEvents();
  const eventsByDate = events.reduce((acc, e) => {
    acc[e.date] = acc[e.date] || [];
    acc[e.date].push(e);
    return acc;
  }, {});

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const dateStr = dateObj.toISOString().slice(0, 10);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = day;

    if (dateStr === todayStr) {
      cell.classList.add("today");
    }

    if (eventsByDate[dateStr] && eventsByDate[dateStr].length > 0) {
      cell.classList.add("has-events");
    }

    if (dateStr === selectedDate) {
      cell.classList.add("selected");
    }

    cell.addEventListener("click", () => {
      calendarState.selectedDate = dateStr;
      renderCalendar();
    });

    container.appendChild(cell);
  }
}

/**
 * Рендер событий выбранного дня
 */
function renderDayEvents(container, dateStr) {
  if (!container) return;

  if (!dateStr) {
    container.innerHTML = "<p>Выбери день в календаре.</p>";
    return;
  }

  const events = getCalendarEventsByDate(dateStr);

  if (!events.length) {
    container.innerHTML = `<p>На ${formatDate(dateStr)} событий нет.</p>`;
    return;
  }

  const itemsHtml = events
    .map((e) => {
      const typeLabel =
        e.type === "match"
          ? "Матч"
          : e.type === "training"
          ? "Тренировка"
          : e.type === "tournament"
          ? "Турнир"
          : "Событие";

      return `
        <li style="margin-bottom: 4px;">
          <b>${typeLabel}:</b> ${e.title}
        </li>
      `;
    })
    .join("");

  container.innerHTML = `
    <p>События на ${formatDate(dateStr)}:</p>
    <ul style="margin-left: 16px; margin-top: 4px; font-size: 12px;">
      ${itemsHtml}
    </ul>
  `;
}

/**
 * Форматирование даты "YYYY-MM-DD" или Date в "DD.MM.YYYY"
 */
function formatDate(input) {
  if (!input) return "";
  let d;
  if (typeof input === "string") {
    d = new Date(input);
  } else {
    d = input;
  }
  if (Number.isNaN(d.getTime())) return "";

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Публичный рендер экрана календаря (если нужно обновить снаружи)
 */
function renderCalendarScreen() {
  renderCalendar();
}

/* Экспорт в глобальную область */
window.initCalendarUI = initCalendarUI;
window.renderCalendarScreen = renderCalendarScreen;
