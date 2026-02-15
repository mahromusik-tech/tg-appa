const tg = window.Telegram.WebApp;
tg.expand();

// --- СОСТОЯНИЕ ИГРЫ ---
let gameState = {
    sanity: 5,      // Рассудок (старт с 5, чтобы было куда падать)
    knowledge: 0,   // Знание
    rel_dimon: 0,   // Отношения с Димоном
    rel_lena: 0     // Отношения с Леной
};

const script = {
    // --- СЦЕНА 1: ПРОБУЖДЕНИЕ (07:00) ---
    start: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')", // Замени на img/dorm.jpg
        speaker: "",
        text: "Ты открываешь глаза. Потолок в желтых пятнах от старой протечки. Справа — стена с плакатом какой-то группы. Ты чувствуешь странную тяжесть в затылке, как будто вчера была бурная вечеринка.",
        next: "s1_thoughts"
    },
    s1_thoughts: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "7:00. Среда. 15 октября. Почему у меня такое чувство, что я уже видел эту трещину на потолке именно при таком освещении? Солнце падает на подоконник ровно под тем же углом...",
        next: "s1_dimon_wake"
    },
    s1_dimon_wake: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sleepy",
        text: "*Скрип панцирной сетки* М-м-макс... выруби эту шарманку. Мозг сейчас взорвется.",
        next: "s1_dimon_action"
    },
    s1_dimon_action: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "",
        text: "Димон свешивает руку с верхней полки, пытаясь нащупать свой телефон на полу.",
        next: "s1_dimon_charger"
    },
    s1_dimon_charger: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sleepy",
        text: "Черт... Опять. Макс, глянь, я зарядку не вижу. Вчера же втыкал в розетку, точно помню.",
        choices: [
            { 
                text: "Встать и молча найти зарядку под тумбочкой", 
                next: "s2_corridor", 
                stats: { knowledge: 1, rel_dimon: 1 } // Ты знаешь, где она (Знание+1)
            },
            { 
                text: "«Сам ищи, я в душ»", 
                next: "s2_corridor", 
                stats: { rel_dimon: -1 } 
            },
            { 
                text: "Лежать и смотреть в потолок", 
                next: "s1_ignore_alarm", 
                stats: { sanity: -1 } 
            }
        ]
    },
    s1_ignore_alarm: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "",
        text: "Будильник орет еще минуту, пока Димон не запускает в него подушкой. Звон в ушах остается.",
        next: "s2_corridor"
    },

    // --- СЦЕНА 2: КОРИДОР И УМЫВАЛЬНИК (07:15) ---
    s2_corridor: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor')", // Замени на img/corridor.jpg
        speaker: "",
        text: "Ты выходишь в коридор. Из-под двери 305-й доносится запах жареной картошки. Навстречу идет староста этажа, тетя Валя, с ведром и шваброй.",
        next: "s2_valya"
    },
    s2_valya: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor')",
        speaker: "Тетя Валя",
        sprite: "https://via.placeholder.com/300x600/555/fff?text=Aunt+Valya",
        text: "Опять в тапочках на босу ногу? Заболеешь, Максимка, а мне потом отвечай.",
        next: "s2_thoughts"
    },
    s2_thoughts: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Она говорит это каждое утро. Или только сегодня? Я могу предсказать её следующий вздох.",
        next: "s2_washroom"
    },
    s2_washroom: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')", // Замени на img/washroom.jpg
        speaker: "",
        text: "Ты заходишь в умывальник. Ряд раковин, над ними — мутные зеркала. Вода в кране фыркает и выплевывает струю ржавчины, прежде чем пойти чистой.",
        choices: [
            { 
                text: "Долго умываться ледяной водой", 
                next: "s2_ice_water", 
                stats: {} 
            },
            { 
                text: "Рассматривать свое отражение", 
                next: "s2_mirror", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Заговорить с парнем у соседней раковины", 
                next: "s2_soap_catch", 
                stats: { sanity: 1 } // Успешное действие повышает рассудок
            }
        ]
    },

    // --- РАЗВЕТВЛЕНИЯ СЦЕНЫ 2 ---
    s2_ice_water: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')",
        speaker: "",
        text: "Кожа немеет, но странное чувство дежавю не уходит. Оно под кожей.",
        next: "scene3_start" // Сюда привяжем следующую часть
    },
    s2_mirror: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')",
        speaker: "",
        text: "Ты всматриваешься в свои зрачки. Кажется, что в них застыло какое-то знание, которое ты еще не можешь сформулировать.",
        next: "scene3_start"
    },
    s2_soap_catch: {
        bg: "url('https://via.placeholder.com/800x600/000/555?text=Washroom')",
        speaker: "",
        text: "Ты молча протягиваешь руку и ловишь мыльницу за секунду до того, как она упадет. Парень смотрит на тебя с открытым ртом.",
        next: "scene3_start"
    },

    // --- СЦЕНА 3: СБОРЫ (07:45) ---
    scene3_start: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "",
        text: "Ты возвращаешься в комнату. Нужно собрать рюкзак. Тетради, ручка, та самая лаба по термеху, которую ты так и не доделал.",
        next: "s3_dimon_date"
    },
    s3_dimon_date: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sitting",
        text: "Слушай, Макс... А какой сегодня день? В смысле, число?",
        next: "s3_hero_reply"
    },
    s3_hero_reply: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "Герой",
        text: "Пятнадцатое. Октябрь.",
        next: "s3_dimon_glitch"
    },
    s3_dimon_glitch: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Packing')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Confused",
        text: "Странно. Мне казалось, вчера тоже было пятнадцатое. Я еще подумал: о, середина месяца, скоро стипуха... Ладно, забей. Глюки.",
        choices: [
            { 
                text: "«Мне тоже так кажется, Димон. Очень странно»", 
                next: "scene4_tram_stop", 
                stats: { rel_dimon: 1, knowledge: 1 } 
            },
            { 
                text: "«Это просто день сурка, привыкай»", 
                next: "scene4_tram_stop", 
                stats: {} 
            },
            { 
                text: "Поторопить его: «Собирайся быстрее»", 
                next: "scene4_tram_stop", 
                stats: {} 
            }
        ]
    },

    // --- СЦЕНА 4: ОСТАНОВКА И ТРАМВАЙ (08:15) ---
    scene4_tram_stop: {
        bg: "url('https://via.placeholder.com/800x600/555/777?text=Bus+Stop')",
        speaker: "",
        text: "Вы стоите на остановке. Народу тьма. Рядом стоит женщина с маленьким ребенком, который капризничает и просит чупа-чупс.",
        next: "s4_candy_thought"
    },
    s4_candy_thought: {
        bg: "url('https://via.placeholder.com/800x600/555/777?text=Bus+Stop')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Сейчас она достанет из сумки мятную конфету, и он замолчит. Три... два... один.",
        next: "s4_tram_arrives"
    },
    s4_tram_arrives: {
        bg: "url('https://via.placeholder.com/800x600/555/777?text=Bus+Stop')",
        speaker: "",
        text: "Женщина достает конфету. Ребенок затихает. Трамвай №7 со скрипом подкатывает к остановке. Двери открываются с характерным шипением.",
        choices: [
            { 
                text: "Пропустить всех вперед и зайти последним", 
                next: "s4_tram_inside_observe", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Протиснуться к окну и смотреть на город", 
                next: "s4_tram_inside_window", 
                stats: {} 
            }
        ]
    },
    s4_tram_inside_observe: {
        bg: "url('https://via.placeholder.com/800x600/444/666?text=Tram+Inside')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Люди двигаются как по команде. Шаг влево, шаг вправо — все синхронно, будто отрепетировано.",
        next: "scene5_hall"
    },
    s4_tram_inside_window: {
        bg: "url('https://via.placeholder.com/800x600/444/666?text=Tram+Window')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Город кажется декорацией. Машины проезжают те же самые, те же цвета... Нет, это бред. Номера я не запоминал.",
        next: "scene5_hall"
    },

    // --- СЦЕНА 5: ХОЛЛ УНИВЕРСИТЕТА (08:45) ---
    scene5_hall: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "",
        text: "Ты проходишь через турникет. Охранник дядя Юра даже не смотрит на твой пропуск, он увлечен кроссвордом.",
        next: "s5_guard_thought"
    },
    s5_guard_thought: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Слово из шести букв, 'единица времени'... Он сейчас спросит меня.",
        next: "s5_guard_dialogue"
    },
    s5_guard_dialogue: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Дядя Юра",
        sprite: "https://via.placeholder.com/300x600/333/fff?text=Guard+Yura",
        text: "Слышь, студент... Единица времени, шесть букв. Вторая 'е'.",
        next: "s5_hero_answer"
    },
    s5_hero_answer: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Герой",
        text: "Секунда.",
        next: "s5_guard_reply"
    },
    s5_guard_reply: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Дядя Юра",
        sprite: "https://via.placeholder.com/300x600/333/fff?text=Guard+Yura",
        text: "Точно. Башка у тебя варит.",
        next: "s5_meet_lena"
    },
    s5_meet_lena: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "",
        text: "Ты идешь к лестнице и сталкиваешься с Леной. Она выглядит так, будто не спала вечность. Папка в её руках едва не рассыпается.",
        next: "s5_lena_dialogue"
    },
    s5_lena_dialogue: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Tired",
        text: "Макс! Стой. Ты лабу сделал? Я в своей запуталась, там в третьем пункте какая-то дичь получается. Если Аркадий увидит — он меня уничтожит.",
        choices: [
            { 
                text: "«Давай сюда, у нас есть 10 минут. Исправим»", 
                next: "scene6_lecture", 
                stats: { rel_lena: 1, knowledge: 1 } 
            },
            { 
                text: "«Лен, я сам в пролете. Давай надеяться на чудо»", 
                next: "scene6_lecture", 
                stats: {} 
            },
            { 
                text: "«Слушай, а ты не чувствуешь, что мы это уже обсуждали?»", 
                next: "s5_lena_suspicion", 
                stats: { knowledge: 1 } 
            }
        ]
    },
    s5_lena_suspicion: {
        bg: "url('https://via.placeholder.com/800x600/666/888?text=University+Hall')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Worried",
        text: "Макс, ты бледный какой-то. Переучил? Пошли лучше на пару, пока не опоздали.",
        next: "scene6_lecture"
    }, 
    // --- ЗАГЛУШКА ДЛЯ СЛЕДУЮЩЕЙ ЧАСТИ ---
      // --- СЦЕНА 6: ЛЕКЦИЯ (09:00) ---
    scene6_lecture: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Lecture+Hall')",
        speaker: "",
        text: "Ты сидишь на третьем ряду. Димон рядом рисует в тетради каких-то монстров. Лена впереди судорожно перелистывает конспекты.",
        next: "s6_teacher_enter"
    },
    s6_teacher_enter: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Lecture+Hall')",
        speaker: "",
        text: "*Скрип двери* Входит Аркадий Петрович. Он не смотрит на студентов, кладет старый кожаный портфель на стол и медленно достает очки.",
        next: "s6_teacher_speech"
    },
    s6_teacher_speech: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Lecture+Hall')",
        speaker: "Аркадий Петрович",
        sprite: "https://via.placeholder.com/300x600/888/fff?text=Teacher",
        text: "Тишина. Сегодня мы разберем динамику систем. Тема сложная, так что советую включить остатки мозга.",
        next: "s6_chalk_thought"
    },
    s6_chalk_thought: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Lecture+Hall')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Он сейчас уронит мел. Прямо сейчас.",
        next: "s6_chalk_fall"
    },
    s6_chalk_fall: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Lecture+Hall')",
        speaker: "",
        text: "*Хруст* Кусочек мела отлетает и катится по полу. Профессор даже не вздрагивает.",
        next: "s6_question"
    },
    s6_question: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Lecture+Hall')",
        speaker: "Аркадий Петрович",
        sprite: "https://via.placeholder.com/300x600/888/fff?text=Teacher",
        text: "Кто-нибудь может сказать мне... что такое инерция? Не из учебника, а своими словами.",
        choices: [
            { 
                text: "Выкрикнуть: «Это когда ты не можешь остановиться, даже если хочешь»", 
                next: "s7_corridor", 
                stats: { sanity: -1, knowledge: 1 } 
            },
            { 
                text: "Поднять руку и дать сухое определение", 
                next: "s7_corridor", 
                stats: {} 
            },
            { 
                text: "Промолчать и записать всё, что произошло с утра", 
                next: "s7_corridor", 
                stats: { knowledge: 1 } 
            }
        ]
    },

    // --- СЦЕНА 7: КОРИДОР ПОСЛЕ ПАРЫ (10:30) ---
    s7_corridor: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor+Crowd')",
        speaker: "",
        text: "Ты выходишь из аудитории. Лена догоняет тебя, она выглядит чуть более расслабленной, но всё еще дерганой.",
        next: "s7_lena_talk"
    },
    s7_lena_talk: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor+Crowd')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena",
        text: "Слушай, Макс... Ты видел, как он на тебя посмотрел? Странный он сегодня. Кстати, ты идешь на вторую пару? Говорят, там будет проверка из деканата.",
        next: "s7_hero_thought"
    },
    s7_hero_thought: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor+Crowd')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Вторая пара... Я не помню её. В моем 'предчувствии' её просто нет. Как будто этот кусок дня вырезан.",
        choices: [
            { 
                text: "«Пойду, надо отметиться»", 
                next: "scene8_boring_lecture", 
                stats: {} 
            },
            { 
                text: "«Нет, пойду в столовую, есть охота»", 
                next: "scene8_canteen", 
                stats: {} 
            },
            { 
                text: "«Лен, ты не замечала, что люди вокруг повторяются?»", 
                next: "s7_lena_worried", 
                stats: { rel_lena: 1 } 
            }
        ]
    },
    s7_lena_worried: {
        bg: "url('https://via.placeholder.com/800x600/111/444?text=Corridor+Crowd')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Worried",
        text: "Макс... Ты меня пугаешь. Может, тебе к врачу? Или просто выспаться?",
        next: "scene8_canteen" // После разговора логично пойти поесть или разойтись
    },

    // --- ЗАГЛУШКИ ДЛЯ СЛЕДУЮЩЕЙ ЧАСТИ ---
        // --- СЦЕНА 8: РАЗВЕТВЛЕНИЕ (12:00) ---
    
    // Ветка А: Скучная лекция (короткий бридж)
    scene8_boring_lecture: {
        bg: "url('https://via.placeholder.com/800x600/444/555?text=Boring+Lecture')",
        speaker: "",
        text: "Пара тянулась бесконечно. Ты просто сидел и смотрел на часы, стрелки которых, казалось, застыли. В итоге ты решил сбежать в библиотеку, чтобы побыть в тишине.",
        next: "scene9_library"
    },

    // Ветка Б: Столовая (основной сюжет)
    scene8_canteen: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen+Queue')",
        speaker: "",
        text: "Ты стоишь в очереди. Гул голосов, звон вилок. Перед тобой — тот же парень в синей толстовке, что и в трамвае. У него на рюкзаке оторван один значок.",
        next: "s8_guy_prediction"
    },
    s8_guy_prediction: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen+Queue')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Он сейчас закажет двойную порцию пюре и чай без сахара. И у него не хватит мелочи.",
        next: "s8_guy_action"
    },
    s8_guy_action: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen+Queue')",
        speaker: "Парень",
        sprite: "https://via.placeholder.com/300x600/333/88f?text=Guy+Blue+Hoodie",
        text: "Мне пюре... двойное. И чай. Без сахара. *Копается в кармане* Ой, подождите, кажется, я рубль потерял...",
        next: "s8_realization"
    },
    s8_realization: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen+Queue')",
        speaker: "",
        text: "Тебя прошибает холодный пот. Это уже не дежавю. Это сценарий.",
        choices: [
            { 
                text: "Протянуть ему рубль молча", 
                next: "scene9_library", 
                stats: { sanity: -1 } // Чувство призрака
            },
            { 
                text: "Развернуться и выйти без еды", 
                next: "scene9_library", 
                stats: { sanity: -1 } // Голод и тревога
            },
            { 
                text: "Схватить Димона: «Смотри! Он сейчас скажет!»", 
                next: "s8_dimon_reaction", 
                stats: { rel_dimon: -1 } 
            }
        ]
    },
    s8_dimon_reaction: {
        bg: "url('https://via.placeholder.com/800x600/664/fff?text=Canteen+Queue')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Shocked",
        text: "Макс, ты чего? Все теряют мелочь. Отпусти плечо, больно же.",
        next: "scene9_library"
    },

    // --- СЦЕНА 9: БИБЛИОТЕКА (13:00) ---
    scene9_library: {
        bg: "url('https://via.placeholder.com/800x600/332/221?text=Library')",
        speaker: "",
        text: "Ты решаешь спрятаться здесь. Огромный зал, высокие окна, тишина. Здесь время кажется более стабильным.",
        next: "s9_newspapers"
    },
    s9_newspapers: {
        bg: "url('https://via.placeholder.com/800x600/332/221?text=Library')",
        speaker: "",
        text: "Ты листаешь подшивки газет. 15 октября прошлого года. 15 октября позапрошлого... Везде обычные новости. Но вдруг ты замечаешь на полях книги пометку карандашом.",
        next: "s9_note"
    },
    s9_note: {
        bg: "url('https://via.placeholder.com/800x600/332/221?text=Library+Book')",
        speaker: "Надпись",
        text: "«Оно не остановится, пока ты не перестанешь ждать завтра».",
        choices: [
            { 
                text: "Стереть пометку ластиком", 
                next: "scene10_park", 
                stats: {} 
            },
            { 
                text: "Дописать ниже: «Кто это написал?»", 
                next: "scene10_park", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Оглядеться вокруг", 
                next: "s9_see_teacher", 
                stats: { knowledge: 1 } 
            }
        ]
    },
    s9_see_teacher: {
        bg: "url('https://via.placeholder.com/800x600/332/221?text=Library')",
        speaker: "",
        text: "Ты замечаешь Аркадия Петровича в другом конце зала. Он не читает, он просто смотрит в окно на падающие листья.",
        next: "scene10_park"
    },

    // --- СЦЕНА 10: ПАРК (16:00) ---
    scene10_park: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "",
        text: "Ты идешь через парк. Ты специально выбрал другую тропинку, не ту, по которой шел утром.",
        next: "s10_thought"
    },
    s10_thought: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Если я изменю путь, мир должен измениться. Я не встречу ту собаку.",
        next: "s10_dog_bark"
    },
    s10_dog_bark: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "",
        text: "*Гав! Гав!* Из-за кустов выбегает та самая рыжая собака с обрывком поводка. Она пробегает мимо, гавкает дважды и несется к забору.",
        next: "s10_panic"
    },
    s10_panic: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Нет... Я же пошел другой дорогой! Как она здесь оказалась?",
        next: "s10_alice"
    },
    s10_alice: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "",
        text: "Ты останавливаешься. На скамейке неподалеку сидит девушка. Она рисует в блокноте. Ты видишь её профиль — она кажется очень спокойной.",
        choices: [
            { 
                text: "Спросить про собаку", 
                next: "s10_alice_talk", 
                stats: { rel_alice: 1 } // Новый стат (нужно добавить в gameState, если хочешь отслеживать)
            },
            { 
                text: "Сесть рядом и наблюдать", 
                next: "s10_alice_watch", 
                stats: { knowledge: 1 } 
            },
            { 
                text: "Пройти мимо", 
                next: "scene11_dorm_evening", 
                stats: {} 
            }
        ]
    },
    s10_alice_talk: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "Алиса",
        sprite: "https://via.placeholder.com/300x600/f8f/000?text=Alice",
        text: "Она только что пробежала. А что?",
        next: "scene11_dorm_evening"
    },
    s10_alice_watch: {
        bg: "url('https://via.placeholder.com/800x600/242/131?text=Autumn+Park')",
        speaker: "",
        text: "Ты замечаешь, что она рисует не деревья, а странные геометрические фигуры, похожие на часовой механизм.",
        next: "scene11_dorm_evening"
    },

    // --- ЗАГЛУШКА ДЛЯ СЛЕДУЮЩЕЙ ЧАСТИ ---
       // --- СЦЕНА 11: МАГАЗИН (18:00) ---
    scene11_dorm_evening: { // Переименовал ключ для совместимости, но логически это магазин
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "",
        text: "Ты заходишь в магазин. Яркий люминесцентный свет, гудение холодильников. На кассе — та же женщина в красном пальто, которую ты мельком видел утром.",
        next: "s11_argument"
    },
    s11_argument: {
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "Женщина",
        sprite: "https://via.placeholder.com/300x600/a33/fff?text=Woman+Red+Coat",
        text: "Вчера оно стоило на пять рублей дешевле! Это грабеж!",
        next: "s11_cashier_reply"
    },
    s11_cashier_reply: {
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "Кассирша",
        sprite: "https://via.placeholder.com/300x600/555/fff?text=Cashier",
        text: "Женщина, ценники поменяли ночью. Берите или уходите.",
        next: "s11_prediction"
    },
    s11_prediction: {
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Она сейчас всплеснет руками, заденет стойку с жвачкой, и та рассыплется. Я не хочу на это смотреть.",
        choices: [
            { 
                text: "Опередить её и поправить стойку", 
                next: "s11_fix_stand", 
                stats: { sanity: 1 } // Ты смог изменить реальность
            },
            { 
                text: "Быстро купить и уйти", 
                next: "s11_leave_fast", 
                stats: { sanity: -1 } // Чувство безысходности
            },
            { 
                text: "Спросить кассиршу про дату", 
                next: "s11_ask_date", 
                stats: { knowledge: 1 } 
            }
        ]
    },
    s11_fix_stand: {
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "",
        text: "Женщина замирает, её рука проходит в сантиметре от стоек. Она смотрит на тебя как на сумасшедшего. Ты изменил мелочь, но сердце колотится так, будто ты спас мир.",
        next: "scene12_kitchen"
    },
    s11_leave_fast: {
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "",
        text: "Ты вылетаешь из магазина, преследуемый звуком рассыпающихся коробочек. Всё равно случилось.",
        next: "scene12_kitchen"
    },
    s11_ask_date: {
        bg: "url('https://via.placeholder.com/800x600/888/aaa?text=Grocery+Store')",
        speaker: "Кассирша",
        sprite: "https://via.placeholder.com/300x600/555/fff?text=Cashier",
        text: "Пятнадцатое, парень. И завтра будет шестнадцатое, если доживем.",
        next: "scene12_kitchen"
    },

    // --- СЦЕНА 12: УЖИН В ОБЩАГЕ (19:30) ---
    scene12_kitchen: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "",
        text: "Ты стоишь у плиты, пытаясь сварить пельмени. Рядом Димон увлеченно рассказывает кому-то по телефону, как он «почти выбил редкий шмот».",
        next: "s12_dimon_phone"
    },
    s12_dimon_phone: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Phone",
        text: "Да я тебе говорю, шанс был один на миллион! И тут — бац, сервак лаганул...",
        next: "s12_hero_thought"
    },
    s12_hero_thought: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Один на миллион. Если бы ты знал, Димон, что наш шанс проснуться завтра — ноль.",
        next: "s12_lena_enter"
    },
    s12_lena_enter: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Cozy",
        text: "Макс, ты весь день какой-то дерганый. На тебе лица нет. Держи, я заварила с мятой, тебе надо расслабиться. Завтра ведь важный день, помнишь?",
        choices: [
            { 
                text: "«Лен, а что если завтра не наступит?»", 
                next: "s12_lena_scared", 
                stats: { rel_lena: 1 } // Искренность сближает
            },
            { 
                text: "«Спасибо, Лен. Я просто переутомился»", 
                next: "s12_tea_calm", 
                stats: { rel_lena: 1, sanity: 1 } 
            },
            { 
                text: "Спросить про Алису с дизайна", 
                next: "s12_ask_alice", 
                stats: { knowledge: 1 } 
            }
        ]
    },
    s12_lena_scared: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Worried",
        text: "Тогда мне не придется сдавать зачет Аркадию. Звучит как план, но ты меня пугаешь.",
        next: "scene13_night"
    },
    s12_tea_calm: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "",
        text: "Ты берешь кружку. Тепло чая кажется единственной реальной вещью в этом мире.",
        next: "scene13_night"
    },
    s12_ask_alice: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Cozy",
        text: "С дизайна? Их там сотни. А что, понравилась?",
        next: "scene13_night"
    },

    // --- ЗАГЛУШКА ДЛЯ СЛЕДУЮЩЕЙ ЧАСТИ ---
    scene13_night: {
        bg: "url('https://via.placeholder.com/800x600/000/000?text=To+Be+Continued')",
        speaker: "Система",
        text: "Конец текущей части. Ночь и финал Дня 1...",
        isEnding: true,
        title: "Пауза",
        desc: "Пришли следующую часть сценария."
    }, 
    // --- СЦЕНА 12: УЖИН В ОБЩАГЕ (19:30) ---
    scene12_kitchen: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "",
        text: "Ты стоишь у плиты, пытаясь сварить пельмени. Рядом Димон увлеченно рассказывает кому-то по телефону, как он «почти выбил редкий шмот».",
        next: "s12_dimon_phone"
    },
    s12_dimon_phone: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Phone",
        text: "Да я тебе говорю, шанс был один на миллион! И тут — бац, сервак лаганул...",
        next: "s12_hero_thought"
    },
    s12_hero_thought: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Один на миллион. Если бы ты знал, Димон, что наш шанс проснуться завтра — ноль.",
        next: "s12_lena_enter"
    },
    s12_lena_enter: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Cozy",
        text: "Макс, ты весь день какой-то дерганый. На тебе лица нет. Держи, я заварила с мятой, тебе надо расслабиться. Завтра ведь важный день, помнишь?",
        choices: [
            { 
                text: "«Лен, а что если завтра не наступит?»", 
                next: "s12_lena_scared", 
                stats: { rel_lena: 1 } 
            },
            { 
                text: "«Спасибо, Лен. Я просто переутомился»", 
                next: "s12_tea_calm", 
                stats: { rel_lena: 1, sanity: 1 } 
            },
            { 
                text: "Спросить про Алису с дизайна", 
                next: "s12_ask_alice", 
                stats: { knowledge: 1 } 
            }
        ]
    },
    s12_lena_scared: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Worried",
        text: "Тогда мне не придется сдавать зачет Аркадию. Звучит как план, но ты меня пугаешь.",
        next: "scene13_night"
    },
    s12_tea_calm: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "",
        text: "Ты берешь кружку. Тепло чая кажется единственной реальной вещью в этом мире.",
        next: "scene13_night"
    },
    s12_ask_alice: {
        bg: "url('https://via.placeholder.com/800x600/443/221?text=Dorm+Kitchen')",
        speaker: "Лена",
        sprite: "https://via.placeholder.com/300x600/f44/fff?text=Lena+Cozy",
        text: "С дизайна? Их там сотни. А что, понравилась?",
        next: "scene13_night"
    },

    // --- СЦЕНА 13: ПРЕДЧУВСТВИЕ ФИНАЛА (22:00) ---
    scene13_night: {
        bg: "url('https://via.placeholder.com/800x600/000/112?text=Night+Room')",
        speaker: "",
        text: "Димон уже сопит на своей полке. Ты лежишь, уставившись в окно. Фонарь на улице мигает с равными интервалами: три коротких, один длинный.",
        next: "s13_code_thought"
    },
    s13_code_thought: {
        bg: "url('https://via.placeholder.com/800x600/000/112?text=Night+Room')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Я никогда не замечал этого ритма. Это похоже на код. Или на сбой. Если я сейчас не усну, я увижу, как сменяется дата. Я увижу, как мир... перезагружается?",
        next: "s13_sleep_struggle"
    },
    s13_sleep_struggle: {
        bg: "url('https://via.placeholder.com/800x600/000/112?text=Night+Room')",
        speaker: "",
        text: "Ты чувствуешь, как веки становятся тяжелыми. Организм предательски требует сна, несмотря на весь твой ужас.",
        choices: [
            { 
                text: "Пытаться не спать любой ценой", 
                next: "s13_reality_melt", 
                stats: { sanity: -1 } 
            },
            { 
                text: "Записать последнюю фразу в блокнот", 
                next: "s13_write_note", 
                stats: { knowledge: 1, sanity: 1 } 
            },
            { 
                text: "Просто закрыть глаза и сдаться", 
                next: "s13_give_up", 
                stats: {} 
            }
        ]
    },
    s13_reality_melt: {
        bg: "url('https://via.placeholder.com/800x600/000/112?text=Night+Room')",
        speaker: "",
        text: "Ты щипаешь себя, ходишь по комнате. Но в 23:59 реальность начинает плыть, как расплавленный воск.",
        next: "scene14_truth"
    },
    s13_write_note: {
        bg: "url('https://via.placeholder.com/800x600/000/112?text=Night+Room')",
        speaker: "Блокнот",
        text: "«Меня зовут Макс, сегодня 15 октября, и я не сумасшедший».",
        next: "scene14_truth"
    },
    s13_give_up: {
        bg: "url('https://via.placeholder.com/800x600/000/112?text=Night+Room')",
        speaker: "",
        text: "Ты проваливаешься в темноту с надеждой, что утром увидишь на телефоне '16 октября'.",
        next: "scene14_truth"
    },

    // --- СЦЕНА 14: МОМЕНТ ИСТИНЫ (00:00) ---
    scene14_truth: {
        bg: "#000", // Черный экран
        speaker: "",
        text: "В какой-то момент тебе кажется, что сердце остановилось. Звуки города исчезают. Нет ветра, нет гула машин, нет дыхания Димона. Есть только ты и тиканье часов, которое внезапно обрывается.",
        next: "s14_now"
    },
    s14_now: {
        bg: "#000",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "Сейчас...",
        next: "scene15_day2_start"
    },

    // --- СЦЕНА 15: ДЕНЬ 2. ГНЕВ (07:00) ---
    scene15_day2_start: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "",
        text: "*Резкая, дребезжащая мелодия будильника* Ты подрываешься на кровати. Сердце колотится в горле. Ты хватаешь телефон.",
        next: "s15_phone_screen"
    },
    s15_phone_screen: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Phone+Screen+15+Oct')",
        speaker: "Экран телефона",
        text: "15 октября. 07:00.",
        next: "s15_dimon_loop"
    },
    s15_dimon_loop: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Димон",
        sprite: "https://via.placeholder.com/300x600/44f/fff?text=Dimon+Sleepy",
        text: "*Скрип кровати* М-м-макс... выруби эту шарманку. Кстати... ты не видел мой зарядник?",
        next: "s15_hero_rage"
    },
    s15_hero_rage: {
        bg: "url('https://via.placeholder.com/800x600/222/333?text=Dorm+Room+Morning')",
        speaker: "Герой (мысли)",
        isThought: true,
        text: "НЕТ!!!",
        next: "day2_intro" // Заглушка для следующего дня
    },

    // --- ЗАГЛУШКА ДЛЯ ДНЯ 2 ---
    day2_intro: {
        bg: "url('https://via.placeholder.com/800x600/000/000?text=Day+2+Start')",
        speaker: "Система",
        text: "День 1 завершен. Добро пожаловать в День 2: Гнев.",
        isEnding: true,
        title: "Конец Дня 1",
        desc: "Петля замкнулась. Жду сценарий второго дня."
    }
};

// --- ПЕРЕМЕННЫЕ ДВИЖКА ---
let currentSceneId = 'start';
let isTyping = false;
let typeInterval;

// --- ЭЛЕМЕНТЫ DOM ---
const screens = document.querySelectorAll('.screen');
const bgEl = document.getElementById('background');
const spriteEl = document.getElementById('character-sprite');
const nameEl = document.getElementById('speaker-name');
const textEl = document.getElementById('dialogue-text');
const choicesEl = document.getElementById('choices-container');
const dialogueBox = document.getElementById('dialogue-box');

// Элементы статистики
const statEls = {
    sanity: document.getElementById('stat-sanity'),
    knowledge: document.getElementById('stat-knowledge'),
    dimon: document.getElementById('stat-dimon'),
    lena: document.getElementById('stat-lena')
};

// --- ФУНКЦИИ ---

function updateStatsUI() {
    statEls.sanity.innerText = gameState.sanity;
    statEls.knowledge.innerText = gameState.knowledge;
    statEls.dimon.innerText = gameState.rel_dimon;
    statEls.lena.innerText = gameState.rel_lena;
}

function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    currentSceneId = 'start';
    // Сброс статов
    gameState = { sanity: 5, knowledge: 0, rel_dimon: 0, rel_lena: 0 };
    updateStatsUI();
    showScreen('game-screen');
    renderScene(currentSceneId);
}

function typeText(text, callback) {
    textEl.innerHTML = "";
    isTyping = true;
    let i = 0;
    choicesEl.innerHTML = "";

    clearInterval(typeInterval);
    typeInterval = setInterval(() => {
        textEl.innerHTML += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typeInterval);
            isTyping = false;
            if (callback) callback();
        }
    }, 25); 
}

dialogueBox.addEventListener('click', () => {
    const scene = script[currentSceneId];
    if (isTyping) {
        clearInterval(typeInterval);
        textEl.innerHTML = scene.text;
        isTyping = false;
        showChoicesOrNext(scene);
        return;
    }
    if (scene.choices) return;
    if (scene.next) {
        currentSceneId = scene.next;
        renderScene(currentSceneId);
    }
});

function showChoicesOrNext(scene) {
    if (scene.choices) {
        renderChoices(scene.choices);
    }
}

function renderChoices(choices) {
    choicesEl.innerHTML = "";
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice.text;
        btn.onclick = (e) => {
            e.stopPropagation();
            
            // Применение изменений статистики
            if (choice.stats) {
                for (let key in choice.stats) {
                    if (gameState.hasOwnProperty(key)) {
                        gameState[key] += choice.stats[key];
                    }
                }
                updateStatsUI();
            }

            currentSceneId = choice.next;
            renderScene(currentSceneId);
        };
        choicesEl.appendChild(btn);
    });
}

function renderScene(sceneId) {
    const scene = script[sceneId];

    if (scene.isEnding) {
        showScreen('ending-screen');
        document.getElementById('ending-title').innerText = scene.title;
        document.getElementById('ending-desc').innerText = scene.desc;
        return;
    }

    if (scene.bg) bgEl.style.backgroundImage = scene.bg;

    if (scene.sprite) {
        spriteEl.src = scene.sprite;
        spriteEl.classList.remove('hidden');
    } else {
        spriteEl.classList.add('hidden');
    }

    // Обработка мыслей vs речи
    nameEl.innerText = scene.speaker;
    if (scene.isThought) {
        textEl.classList.add('thought-text');
        nameEl.classList.add('thought-name');
    } else {
        textEl.classList.remove('thought-text');
        nameEl.classList.remove('thought-name');
    }

    typeText(scene.text, () => showChoicesOrNext(scene));
}
