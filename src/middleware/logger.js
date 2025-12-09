// Middleware для логирования всех запросов
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const query = Object.keys(req.query).length
    ? JSON.stringify(req.query)
    : "нет";
  const body = Object.keys(req.body).length ? JSON.stringify(req.body) : "нет";
  const params = Object.keys(req.params).length
    ? JSON.stringify(req.params)
    : "нет";

  console.log(`[${timestamp}] 📥 ${method} ${url}`);
  console.log(`   Query: ${query}`);
  console.log(`   Body: ${body}`);
  console.log(`   Params: ${params}`);

  // Сохраняем оригинальный метод res.json для логирования ответа
  const originalJson = res.json;
  res.json = function (data) {
    console.log(
      `[${new Date().toISOString()}] 📤 Ответ:`,
      JSON.stringify(data).substring(0, 200) + "..."
    );
    originalJson.call(this, data);
  };

  next();
};

module.exports = logger;
