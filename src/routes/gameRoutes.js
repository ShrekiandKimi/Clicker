const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const { validatePlayer } = require("../middleware/auth");

// Все маршруты начинаются с /api/game

// GET запросы с query параметрами
router.get("/state", gameController.getGameState); // ?playerId=123
router.get("/leaderboard", gameController.getLeaderboard); // ?limit=10

// GET запросы с параметрами маршрута
router.get("/player/:playerId", validatePlayer, gameController.getPlayer);
router.get(
  "/upgrades/:playerId",
  validatePlayer,
  gameController.getPlayerUpgrades
);

// POST запросы с телом (body)
router.post("/click", gameController.handleClick);
router.post("/buy-upgrade", gameController.buyUpgrade);
router.post("/new-player", gameController.createNewPlayer);

// PUT запрос для обновления данных
router.put(
  "/player/:playerId",
  validatePlayer,
  gameController.updatePlayerName
);

// DELETE запрос
router.delete("/reset/:playerId", validatePlayer, gameController.resetPlayer);

module.exports = router;
