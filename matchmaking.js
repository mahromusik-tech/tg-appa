
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
