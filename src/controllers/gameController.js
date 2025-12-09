const {
  gameState,
  upgrades,
  getPlayer,
  updatePlayer,
  createPlayer,
  getAllPlayers,
  resetPlayerData,
} = require("../data/gameState");

// Получить состояние игры (с query параметрами)
exports.getGameState = (req, res) => {
  const { playerId } = req.query;

  if (!playerId) {
    return res.status(200).json({
      game: gameState,
      availableUpgrades: upgrades,
      message: "Используйте ?playerId=ID для получения данных игрока",
    });
  }

  const player = getPlayer(playerId);
  if (!player) {
    return res.status(404).json({ error: "Игрок не найден" });
  }

  res.json({
    player,
    gameStats: gameState,
    upgrades: upgrades,
  });
};

// Обработать клик
exports.handleClick = (req, res) => {
  const { playerId, clicks = 1 } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: "Требуется playerId" });
  }

  let player = getPlayer(playerId);

  // Если игрок не существует, создаем нового
  if (!player) {
    player = createPlayer(playerId, `Игрок_${Date.now()}`);
  }

  // Рассчитываем общий доход с учетом улучшений
  const clickValue = 1 + player.upgrades.clickPower * 0.5;
  const totalEarned =
    clicks * clickValue * (1 + player.upgrades.autoClicker * 0.1);

  player.cookies += totalEarned;
  player.totalClicks += clicks;
  player.lastActive = new Date().toISOString();

  updatePlayer(playerId, player);

  res.json({
    success: true,
    cookies: player.cookies,
    earned: totalEarned,
    clickValue: clickValue,
    message: `Получено ${totalEarned.toFixed(1)} печенек!`,
  });
};

// Купить улучшение
exports.buyUpgrade = (req, res) => {
  const { playerId, upgradeType } = req.body;

  if (!playerId || !upgradeType) {
    return res.status(400).json({
      error: "Требуется playerId и upgradeType",
    });
  }

  const player = getPlayer(playerId);
  if (!player) {
    return res.status(404).json({ error: "Игрок не найден" });
  }

  const upgrade = upgrades.find((u) => u.type === upgradeType);
  if (!upgrade) {
    return res.status(400).json({ error: "Улучшение не найдено" });
  }

  const cost = upgrade.basePrice * Math.pow(1.15, player.upgrades[upgradeType]);

  if (player.cookies < cost) {
    return res.status(400).json({
      error: "Недостаточно печенек",
      cost: cost,
      current: player.cookies,
    });
  }

  player.cookies -= cost;
  player.upgrades[upgradeType] += 1;
  player.totalSpent += cost;

  updatePlayer(playerId, player);

  res.json({
    success: true,
    cookies: player.cookies,
    upgradeLevel: player.upgrades[upgradeType],
    nextCost: upgrade.basePrice * Math.pow(1.15, player.upgrades[upgradeType]),
    message: `Улучшение "${upgrade.name}" куплено!`,
  });
};

// Получить таблицу лидеров (с query параметром limit)
exports.getLeaderboard = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const allPlayers = getAllPlayers();

  const sortedPlayers = allPlayers
    .sort((a, b) => b.cookies - a.cookies)
    .slice(0, limit)
    .map((player) => ({
      playerId: player.playerId,
      name: player.name,
      cookies: Math.floor(player.cookies),
      totalClicks: player.totalClicks,
      upgrades: player.upgrades,
    }));

  res.json({
    leaderboard: sortedPlayers,
    totalPlayers: allPlayers.length,
    timestamp: new Date().toISOString(),
  });
};

// Создать нового игрока
exports.createNewPlayer = (req, res) => {
  const { name } = req.body;
  const playerId = `player_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const player = createPlayer(
    playerId,
    name || `Игрок_${playerId.substr(7, 4)}`
  );

  res.status(201).json({
    success: true,
    playerId: player.playerId,
    player: player,
    message: "Новый игрок создан!",
  });
};

// Получить данные игрока (с параметром маршрута)
exports.getPlayer = (req, res) => {
  const player = req.player; // Из middleware
  res.json(player);
};

// Получить улучшения игрока
exports.getPlayerUpgrades = (req, res) => {
  const player = req.player;
  res.json({
    upgrades: player.upgrades,
    availableUpgrades: upgrades.map((upgrade) => ({
      ...upgrade,
      currentLevel: player.upgrades[upgrade.type],
      nextCost:
        upgrade.basePrice * Math.pow(1.15, player.upgrades[upgrade.type]),
    })),
  });
};

// Обновить имя игрока (PUT запрос)
exports.updatePlayerName = (req, res) => {
  const { playerId } = req.params;
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return res
      .status(400)
      .json({ error: "Имя должно содержать минимум 2 символа" });
  }

  const player = getPlayer(playerId);
  player.name = name.trim();
  updatePlayer(playerId, player);

  res.json({
    success: true,
    playerId: playerId,
    newName: player.name,
    message: "Имя обновлено",
  });
};

// Сбросить данные игрока (DELETE запрос)
exports.resetPlayer = (req, res) => {
  const { playerId } = req.params;

  resetPlayerData(playerId);

  res.json({
    success: true,
    message: "Данные игрока сброшены",
    newPlayerId: playerId,
  });
};
