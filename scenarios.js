const SCENARIOS = [
    // --- 0 ЛЕТ (Младенчество) ---
    {
        id: "birth cry",
        age: 0,
        text: "Вы только что родились. Яркий свет слепит глаза. Врач шлепает вас.",
        emoji: "👶",
        choices: [
            { txt: "Громко заорать", eff: { health: 5, happy: 5 }, log: "Легкие раскрылись! Вы здоровы.", flag: "loud baby" },
            { txt: "Молча терпеть", eff: { smart: 2, happy: -5 }, log: "Вы подозрительно тихое дитя." }
        ]
    },
    {
        id: "breast_milk",
        age: 0,
        text: "Время обеда. Мама дает грудь, но рядом стоит бутылочка со смесью.",
        emoji: "🍼",
        choices: [
            { txt: "Грудь", eff: { health: 10, happy: 5 }, log: "Натуральный продукт! Иммунитет растет.", flag: "breastfed" },
            { txt: "Бутылочка", eff: { health: 5, happy: 10 }, log: "Вкусно и сладко." }
        ]
    },

    // --- 1-3 ГОДА (Раннее детство) ---
    {
        id: "first_steps",
        age: 1,
        text: "Вы пытаетесь встать на ноги. Пол кажется таким далеким.",
        emoji: "👣",
        choices: [
            { txt: "Рискнуть и пойти", chance: 60, 
              success: { txt: "Пойти", eff: { health: 5, happy: 10 }, log: "Вы пошли! Родители в шоке.", flag: "early walker" },
              fail: { txt: "Упасть", eff: { health: -5, happy: -5 }, log: "Бум! Шишка на лбу." } 
            },
            { txt: "Ползать надежнее", eff: { smart: 2 }, log: "Тише едешь — дальше будешь." }
        ]
    },
    {
        id: "potty_training",
        age: 2,
        text: "Мама показывает на горшок. Это вызов.",
        emoji: "🚽",
        choices: [
            { txt: "Сделать дело", eff: { smart: 5, happy: 5 }, log: "Сухо и комфортно.", flag: "potty master" },
            { txt: "Промахнуться", eff: { happy: -5 }, log: "Лужа на ковре. Мама вздыхает." }
        ]
    },
    {
        id: "bad_word",
        age: 3,
        text: "Папа уронил молоток и сказал 'БЛ***'. Вы запомнили.",
        emoji: "🤬",
        choices: [
            { txt: "Повторить при бабушке", eff: { happy: 10, smart: -5 }, log: "Бабушка упала в обморок. Было весело.", flag: "foul mouth" },
            { txt: "Забыть", eff: { smart: 2 }, log: "Вы решили быть культурным." }
        ]
    },

    // --- 4-6 ЛЕТ (Детский сад) ---
    {
        id: "kindergarten_fight",
        age: 4,
        text: "Мальчик Петя отобрал вашу машинку.",
        emoji: "👊",
        choices: [
{ txt: "Ударить в ответ", req: { stat: "health", val: 30 }, eff: { happy: 5, reputation: -10 }, log: "Петя плачет. Вы победили.", flag: "fighter" },
            { txt: "Пожаловаться", eff: { smart: 5, reputation: -5 }, log: "Воспитательница вернула игрушку." },
            { txt: "Терпеть", eff: { happy: -10 }, log: "Вы остались без машинки." }
        ]
    },
    {
        id: "reading_skill",
        age: 5,
        text: "Вы нашли книгу с картинками и буквами.",
        emoji: "📖",
        choices: [
            { txt: "Пытаться читать", eff: { smart: 10 }, log: "Вы выучили алфавит раньше всех!", flag: "reader" },
            { txt: "Рвать страницы", eff: { happy: 5, smart: -5 }, log: "Весело шуршит." }
        ]
    },
    {
        id: "stolen_candy_check",
        age: 6,
        text: "В магазине лежат конфеты на уровне глаз.",
        emoji: "🍬",
        choices: [
            { txt: "Украсть", chance: 40,
              success: { eff: { happy: 10 }, log: "Никто не заметил! Вкусно.", flag: "thief 1" },
              fail: { eff: { happy: -20, reputation: -20 }, log: "Охранник поймал вас за ухо. Позор!", flag: "caught stealing" }
            },
            { txt: "Попросить маму", eff: { happy: -2 }, log: "Мама сказала 'нет'." }
        ]
    },

    // --- 7-10 ЛЕТ (Начальная школа) ---
    {
        id: "school_first_day",
        age: 7,
        text: "Первое сентября. Огромный букет закрывает обзор.",
        emoji: "🔔",
        choices: [
            { txt: "Найти друзей", eff: { happy: 10, smart: -2 }, log: "Вы подружились с соседом по парте.", flag: "social" },
            { txt: "Слушать учителя", eff: { smart: 10, happy: -5 }, log: "Вы стали любимчиком учителя.", flag: "nerd" }
        ]
    },
    {
        id: "bullying_start",
        age: 8,
        req: { flag: "nerd" }, // Только если ботан
        text: "Хулиганы называют вас 'заучкой' и толкают.",
        emoji: "😢",
        choices: [
            { txt: "Дать сдачи", req: { stat: "health", val: 50 }, eff: { reputation: 20, health: -10 }, log: "Они отстали. Вас уважают." },
            { txt: "Терпеть", eff: { happy: -20, smart: 5 }, log: "Вы ушли в учебу с головой." }
        ]
    },
    {
        id: "pocket_money",
        age: 9,
        text: "Родители начали давать карманные деньги.",
        emoji: "💰",
        choices: [
            { txt: "Копить", eff: { money: 50, happy: -5 }, log: "Свинья-копилка тяжелеет.", flag: "saver" },
            { txt: "Тратить на сладости", eff: { happy: 10, money: 0 }, log: "Жизнь одна!" }
        ]
    },
    {
        id: "find_wallet",
        age: 10,
        text: "Вы нашли кошелек на улице. Там 1000 рублей.",
        emoji: "👛",
        choices: [
            { txt: "Забрать себе", eff: { money: 1000, reputation: -10 }, log: "Богатство! Но совесть грызет.", flag: "thief 2" },
            { txt: "Отнести в полицию", eff: { reputation: 20, happy: 5 }, log: "Вам дали шоколадку за честность." }
        ]
    },

    // --- 11-14 ЛЕТ (Подростковый возраст) ---
    {
        id: "smoking_offer",
        age: 12,
        text: "Старшеклассники предлагают покурить за гаражами.",
        emoji: "🚬",
        choices: [
{ txt: "Попробовать", eff: { health: -10, reputation: 10, happy: 5 }, log: "Вы закашлялись, но теперь вы 'крутой'.", flag: "smoker" },
            { txt: "Отказаться", eff: { health: 5, reputation: -5 }, log: "Вас назвали маменькиным сынком." }
        ]
    },
    {
        id: "first_love_school",
        age: 13,
        text: "Вам нравится одноклассница/одноклассник.",
        emoji: "❤️",
        choices: [
            { txt: "Написать записку", chance: 50,
              success: { eff: { happy: 20 }, log: "Вам ответили взаимностью!", flag: "dating school" },
              fail: { eff: { happy: -20 }, log: "Записку прочитали вслух всему классу. Позор." }
            },
            { txt: "Молчать", eff: { happy: -5 }, log: "Любовь осталась тайной." }
        ]
    },
    {
        id: "computer_gift",
        age: 14,
        text: "Родители подарили компьютер.",
        emoji: "💻",
        choices: [
            { txt: "Играть в игры", eff: { happy: 20, smart: -5, health: -5 }, log: "Вы стали геймером.", flag: "gamer" },
            { txt: "Учить программирование", eff: { smart: 20, happy: -5 }, log: "Сложно, но перспективно.", flag: "coder" }
        ]
    },

    // --- 15-17 ЛЕТ (Юность) ---
    {
        id: "part_time_job_offer",
        age: 15,
        text: "Нужны деньги на новый телефон.",
        emoji: "📱",
        choices: [
            { txt: "Раздавать листовки", eff: { money: 100, health: -5 }, log: "Ноги гудят, зато есть деньги." },
            { txt: "Фриланс", req: { flag: "coder" }, eff: { money: 500, smart: 5 }, log: "Вы сделали сайт для дяди Васи. Хорошие деньги!" },
            { txt: "Украсть телефон", req: { flag: "thief 2" }, chance: 30,
              success: { eff: { money: 1000, reputation: -50 }, log: "Вы украли айфон. Криминал затягивает.", flag: "criminal" },
              fail: { eff: { happy: -50 }, log: "Вас поймали. Учет в полиции.", flag: "police record" }
            }
        ]
    },
    {
        id: "gym_motivation",
        age: 16,
        text: "Вы смотрите в зеркало и вам не нравится отражение.",
        emoji: "💪",
        choices: [
            { txt: "Пойти в качалку", eff: { health: 20, happy: 5, money: -50 }, log: "Мышцы растут!", flag: "gym rat" },
            { txt: "Забить", eff: { happy: 5 }, log: "Вы приняли себя таким, какой есть." }
        ]
    },
    {
        id: "exams_preparation",
        age: 17,
        text: "ЕГЭ на носу. Это решит вашу судьбу.",
        emoji: "📚",
        choices: [
            { txt: "Зубрить 24/7", eff: { smart: 30, health: -20, happy: -20 }, log: "Вы похожи на зомби, но знаете всё.", flag: "exam ready" },
            { txt: "Надеяться на удачу", eff: { happy: 10 }, log: "Авось пронесет." }
        ]
    },

    // --- 18 ЛЕТ (Финал) ---
    {
        id: "army_call",
        age: 18,
        req: { gender: "male" }, // Только для парней
        text: "Пришла повестка в военкомат.",
        emoji: "🪖",
        choices: [
            { txt: "Пойти служить", eff: { health: 10, smart: -10, money: 0 }, log: "Год в сапогах. Вы стали мужчиной.", flag: "served army" },
            { txt: "Откосить по учебе", req: { flag: "exam ready" }, eff: { smart: 10 }, log: "Вы поступили в ВУЗ! Армия подождет.", flag: "student" },
