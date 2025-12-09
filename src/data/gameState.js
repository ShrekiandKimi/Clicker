// Начальное состояние игры
const gameState = {
  totalClicks: 0,
  totalCookies: 0,
  playersCount: 0,
  startDate: new Date().toISOString(),
};

// Доступные улучшения
const upgrades = [
  {
    type: "clickPower",
    name: "Усилитель клика",
    description: "Увеличивает силу клика на 0.5 печеньки",
    basePrice: 10,
  },
  {
    type: "autoClicker",
    name: "Автокликер",
    description: "Автоматически кликает 1 раз в секунду",
    basePrice: 50,
  },
  {
    type: "grandma",
    name: "Бабушка",
    description: "Бабушка печёт 2 печеньки в секунду",
    basePrice: 100,
  },
];

// Хранилище игроков (в памяти)
let players = {};

// Создать нового игрока
const createPlayer = (playerId, name) => {
  const newPlayer = {
    playerId,
    name,
    cookies: 10, // Стартовые печеньки
    totalClicks: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    upgrades: {
      clickPower: 0,
      autoClicker: 0,
      grandma: 0,
    },
  };

  players[playerId] = newPlayer;
  gameState.playersCount = Object.keys(players).length;

  return newPlayer;
};

// Получить игрока по ID
const getPlayer = (playerId) => {
  return players[playerId];
};

// Обновить данные игрока
const updatePlayer = (playerId, updatedData) => {
  if (players[playerId]) {
    players[playerId] = { ...players[playerId], ...updatedData };
    return players[playerId];
  }
  return null;
};

// Получить всех игроков
const getAllPlayers = () => {
  return Object.values(players);
};

// Сбросить данные игрока
const resetPlayerData = (playerId) => {
  if (players[playerId]) {
    players[playerId] = {
      ...players[playerId],
      cookies: 10,
      totalClicks: 0,
      totalSpent: 0,
      upgrades: { clickPower: 0, autoClicker: 0, grandma: 0 },
    };
    return players[playerId];
  }
  return null;
};

module.exports = {
  gameState,
  upgrades,
  players,
  createPlayer,
  getPlayer,
  updatePlayer,
  getAllPlayers,
  resetPlayerData,
};
