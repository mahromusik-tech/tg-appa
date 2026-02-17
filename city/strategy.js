import * as PIXI from 'pixi.js';

// Основные настройки
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
    antialias: true,
    resolution: devicePixelRatio,
    autoDensity: true
});
document.body.appendChild(app.view);

// Цветовая палитра и оформление сцены
app.renderer.backgroundColor = 0xDFFFAF;

// Создаем игровой контейнер
const gameContainer = new PIXI.Container();
app.stage.addChild(gameContainer);

// Базовые ресурсы и переменные
let resources = {
    wood: 0,
    stone: 0,
    food: 0,
    science: 0,
    metal: 0,
    money: 0
};

// Текущие уровни построек
let buildingLevels = {
    lumbermill: 0,
    quarry: 0,
    farm: 0,
    school: 0,
    factory: 0,
    bank: 0
};

// Здания и их свойства
const BUILDINGS = {
    lumbermill: {
        cost: { wood: 10, stone: 5 },
        produces: ['wood'],
        productionRate: 1,
        description: 'Производит древесину'
    },
    quarry: {
        cost: { wood: 15, stone: 10 },
        produces: ['stone'],
        productionRate: 1,
        description: 'Добыча камня'
    },
    farm: {
        cost: { wood: 10, stone: 5 },
        produces: ['food'],
        productionRate: 1,
        description: 'Выращивает пищу'
    },
    school: {
        cost: { wood: 20, stone: 15 },
        produces: ['science'],
        productionRate: 1,
        description: 'Исследует научные достижения'
    },
    factory: {
        cost: { wood: 30, stone: 20 },
        produces: ['metal'],
        productionRate: 1,
        description: 'Выпускает металлические изделия'
    },
    bank: {
        cost: { wood: 25, stone: 15 },
        produces: ['money'],
        productionRate: 1,
        description: 'Управляет экономическими средствами'
    }
};

// Функционал строительства зданий
function canBuild(buildingName) {
    const costs = BUILDINGS[buildingName].cost;
    for (let resource in costs) {
        if (resources[resource] < costs[resource]) return false;
    }
    return true;
}

function buildBuilding(buildingName) {
    if (!canBuild(buildingName)) return alert('Недостаточно ресурсов!');

    // Вычитаем стоимость строительства
    const costs = BUILDINGS[buildingName].cost;
    for (let resource in costs) {
        resources[resource] -= costs[resource];
    }

    // Начинаем строительство
    buildingLevels[buildingName]++;
}

// Рендер ресурсов
function renderResources() {
    const resourceUI = new PIXI.Text(`Дерево: ${resources.wood}\nКамень: ${resources.stone}\nЕда: ${resources.food}\nНаука: ${resources.science}\nМеталл: ${resources.metal}\nДеньги: ${resources.money}`, {
        fill: 0xFFFFFF,
        fontSize: 20,
        wordWrap: true,
        wordWrapWidth: 200
    });
    resourceUI.position.set(WIDTH - 220, 10);
    gameContainer.removeChildren();
    gameContainer.addChild(resourceUI);
}

// Цели игры
const GOALS = [
    { goal: 'Постройте первую лесопилку', condition: () => buildingLevels.lumbermill > 0 },
    { goal: 'Добудьте 10 единиц дерева', condition: () => resources.wood >= 10 },
    { goal: 'Создайте первую ферму', condition: () => buildingLevels.farm > 0 },
    { goal: 'Получите первые деньги', condition: () => resources.money > 0 }
];

// Меню построения зданий
function showBuildMenu() {
    const menu = new PIXI.Graphics().beginFill(0xAADDDD).drawRoundedRect(10, 10, 200, 300).endFill();
    gameContainer.addChild(menu);

    const title = new PIXI.Text('Строительные возможности:', { fill: 0xFFFF00, fontSize: 20 });
    title.position.set(20, 20);
    gameContainer.addChild(title);

    let posY = 50;
    for (let key in BUILDINGS) {
        const buildingInfo = BUILDINGS[key];
        const button = new PIXI.Text(`${key}: ${buildingInfo.description}`, { fill: 0xFFFFFF, fontSize: 16 });
        button.interactive = true;
        button.buttonMode = true;
        button.on('pointerdown', () => buildBuilding(key));
        button.position.set(20, posY);
        gameContainer.addChild(button);
        posY += 30;
    }
}

// Загрузка начальной сцены
showBuildMenu();
renderResources();

// Главный цикл обновления
app.ticker.add(() => {
    // Производительность зданий
    for (let building in buildingLevels) {
        if (buildingLevels[building] > 0) {
            const produced = BUILDINGS[building].produces.map(res => res);
            produced.forEach(res => resources[res] += BUILDINGS[building].productionRate);
        }
    }

    // Регулярное обновление UI
    renderResources();
});
