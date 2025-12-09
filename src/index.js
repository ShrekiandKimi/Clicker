const express = require("express");
const cors = require("cors");
const gameRoutes = require("./routes/gameRoutes");
const logger = require("./middleware/logger");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Обработка JSON в теле запроса
app.use(express.urlencoded({ extended: true })); // Обработка URL-encoded данных
app.use(express.static("public")); // Раздача статических файлов
app.use(logger); // Кастомный middleware для логирования

// Маршруты
app.use("/api/game", gameRoutes);

// Базовый маршрут
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🎮 Сервер кликер-игры запущен на http://localhost:${PORT}`);
  console.log(`📁 Статические файлы доступны в папке /public`);
});
