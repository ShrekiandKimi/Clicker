const { getPlayer } = require("../data/gameState");

// Middleware для проверки существования игрока
const validatePlayer = (req, res, next) => {
  const playerId = req.params.playerId || req.body.playerId;

  if (!playerId) {
    return res.status(400).json({ error: "Требуется playerId" });
  }

  const player = getPlayer(playerId);
  if (!player) {
    return res.status(404).json({ error: "Игрок не найден" });
  }

  // Добавляем игрока в объект запроса для последующих middleware
  req.player = player;
  next();
};

module.exports = { validatePlayer };
