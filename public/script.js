// Глобальные переменные игры
let playerId =
  localStorage.getItem("playerId") ||
  `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
let playerName =
  localStorage.getItem("playerName") || `Игрок_${playerId.substr(7, 4)}`;
let cookies = 0;
let totalClicks = 0;

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  // Установка начальных значений
  document.getElementById("playerId").textContent = playerId;
  document.getElementById("playerName").value = playerName;

  // Загрузка состояния игрока
  loadPlayerState();

  // Настройка обработчиков событий
  setupEventListeners();

  // Загрузка улучшений
  loadUpgrades();

  // Автосохранение каждые 30 секунд
  setInterval(savePlayerState, 30000);
});

// Настройка обработчиков событий
function setupEventListeners() {
  // Кнопка печеньки
  document.getElementById("cookieButton").addEventListener("click", () => {
    handleClick();
    animateCookieClick();
  });

  // Сохранение имени
  document.getElementById("saveName").addEventListener("click", savePlayerName);

  // Автокликеры
  setInterval(autoClick, 1000);
}

// Анимация клика
function animateCookieClick() {
  const btn = document.getElementById("cookieButton");
  btn.style.transform = "scale(0.95)";
  setTimeout(() => {
    btn.style.transform = "scale(1.05)";
  }, 100);
  setTimeout(() => {
    btn.style.transform = "scale(1)";
  }, 200);

  // Создаем плавающий текст
  const floatingText = document.createElement("div");
  floatingText.textContent = `+${(
    1 +
    getUpgradeLevel("clickPower") * 0.5
  ).toFixed(1)}`;
  floatingText.className = "floating-text";
  floatingText.style.position = "absolute";
  floatingText.style.left = `${Math.random() * 100}%`;
  floatingText.style.top = "50%";
  floatingText.style.color = "#4CAF50";
  floatingText.style.fontWeight = "bold";
  floatingText.style.fontSize = "1.5rem";
  floatingText.style.pointerEvents = "none";
  floatingText.style.transition = "all 1s";

  btn.appendChild(floatingText);

  setTimeout(() => {
    floatingText.style.opacity = "0";
    floatingText.style.transform = "translateY(-50px)";
    setTimeout(() => floatingText.remove(), 1000);
  }, 100);
}

// Обработка клика
async function handleClick() {
  try {
    const response = await fetch("/api/game/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        clicks: 1,
      }),
    });

    const data = await response.json();

    if (data.success) {
      updateGameDisplay(data);
    }

    logAPIResponse("POST /click", data);
  } catch (error) {
    console.error("Ошибка клика:", error);
  }
}

// Автокликеры
async function autoClick() {
  const autoClickerLevel = getUpgradeLevel("autoClicker");
  const grandmaLevel = getUpgradeLevel("grandma");

  if (autoClickerLevel > 0 || grandmaLevel > 0) {
    const clicks = autoClickerLevel;
    const grandmaCookies = grandmaLevel * 2;

    if (clicks > 0 || grandmaCookies > 0) {
      try {
        const response = await fetch("/api/game/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            clicks: clicks,
            autoCookies: grandmaCookies,
          }),
        });

        const data = await response.json();
        if (data.success) {
          updateGameDisplay(data);
        }
      } catch (error) {
        console.error("Ошибка автоклика:", error);
      }
    }
  }
}

// Загрузка улучшений
async function loadUpgrades() {
  try {
    const response = await fetch(`/api/game/upgrades/${playerId}`);
    const data = await response.json();

    if (data.upgrades && data.availableUpgrades) {
      displayUpgrades(data.availableUpgrades);
    }
  } catch (error) {
    console.error("Ошибка загрузки улучшений:", error);
  }
}

// Отображение улучшений
function displayUpgrades(upgradesList) {
  const container = document.getElementById("upgradesList");
  container.innerHTML = "";

  upgradesList.forEach((upgrade) => {
    const upgradeElement = document.createElement("div");
    upgradeElement.className = "upgrade-item";
    upgradeElement.innerHTML = `
            <div class="upgrade-header">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-level">Уровень ${upgrade.currentLevel}</div>
            </div>
            <div class="upgrade-desc">${upgrade.description}</div>
            <div class="upgrade-cost">
                Следующий уровень: <strong>${Math.floor(
                  upgrade.nextCost
                )}</strong> печенек
            </div>
            <button class="buy-btn" onclick="buyUpgrade('${upgrade.type}')"
                    ${cookies < upgrade.nextCost ? "disabled" : ""}>
                Купить улучшение (${Math.floor(upgrade.nextCost)} 🍪)
            </button>
        `;
    container.appendChild(upgradeElement);
  });
}

// Покупка улучшения
async function buyUpgrade(upgradeType) {
  try {
    const response = await fetch("/api/game/buy-upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, upgradeType }),
    });

    const data = await response.json();
    logAPIResponse("POST /buy-upgrade", data);

    if (data.success) {
      loadPlayerState();
      loadUpgrades();
    }
  } catch (error) {
    console.error("Ошибка покупки улучшения:", error);
  }
}

// Обновление отображения игры
function updateGameDisplay(data) {
  cookies = data.cookies;
  document.getElementById("cookieCount").textContent = Math.floor(cookies);
  document.getElementById("totalClicks").textContent = totalClicks;

  // Рассчет печенек в секунду
  const cps =
    getUpgradeLevel("autoClicker") * 1 + getUpgradeLevel("grandma") * 2;
  document.getElementById("cps").textContent = `${cps} печенек/сек`;

  // Обновление силы клика
  const clickPower = 1 + getUpgradeLevel("clickPower") * 0.5;
  document.getElementById("clickPower").textContent = clickPower.toFixed(1);
}

// Получение уровня улучшения
function getUpgradeLevel(type) {
  // В реальном приложении это бы бралось из состояния игрока
  return 0; // Заглушка - нужно реализовать хранение улучшений
}

// Сохранение имени игрока
async function savePlayerName() {
  const newName = document.getElementById("playerName").value;

  if (newName && newName.trim().length >= 2) {
    try {
      const response = await fetch(`/api/game/player/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await response.json();
      logAPIResponse("PUT /player", data);

      if (data.success) {
        playerName = newName.trim();
        localStorage.setItem("playerName", playerName);
        alert("Имя сохранено!");
      }
    } catch (error) {
      console.error("Ошибка сохранения имени:", error);
    }
  }
}

// Загрузка состояния игрока
async function loadPlayerState() {
  try {
    const response = await fetch(`/api/game/state?playerId=${playerId}`);
    const data = await response.json();

    logAPIResponse("GET /state", data);

    if (data.player) {
      cookies = data.player.cookies;
      totalClicks = data.player.totalClicks || 0;
      updateGameDisplay(data.player);

      // Обновление количества игроков
      if (data.gameStats) {
        document.getElementById("playersOnline").textContent =
          data.gameStats.playersCount || 1;
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки состояния:", error);
  }
}

// Сохранение состояния игрока
async function savePlayerState() {
  console.log("Автосохранение...");
  // В реальном приложении здесь бы была синхронизация с сервером
}

// API демо-функции
async function getGameState() {
  try {
    const response = await fetch("/api/game/state");
    const data = await response.json();
    logAPIResponse("GET /state (без параметров)", data);
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

async function getLeaderboard() {
  try {
    const response = await fetch("/api/game/leaderboard?limit=5");
    const data = await response.json();
    logAPIResponse("GET /leaderboard?limit=5", data);
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

async function createPlayer() {
  try {
    const response = await fetch("/api/game/new-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Новый_Игрок_${Date.now()}` }),
    });

    const data = await response.json();
    logAPIResponse("POST /new-player", data);

    if (data.success) {
      alert(`Новый игрок создан! ID: ${data.playerId}`);
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

async function resetPlayer() {
  if (confirm("Вы уверены? Все ваши данные будут сброшены!")) {
    try {
      const response = await fetch(`/api/game/reset/${playerId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      logAPIResponse(`DELETE /reset/${playerId}`, data);

      if (data.success) {
        alert("Данные сброшены! Страница будет перезагружена.");
        setTimeout(() => location.reload(), 1000);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  }
}

// Логирование ответов API
function logAPIResponse(endpoint, data) {
  const responseElement = document.getElementById("apiResponse");
  responseElement.textContent = JSON.stringify(data, null, 2);
  responseElement.style.color = data.error ? "#ff4444" : "#4CAF50";

  console.log(`📡 ${endpoint}:`, data);
}

// Глобальные функции для кнопок
window.handleClick = handleClick;
window.getGameState = getGameState;
window.getLeaderboard = getLeaderboard;
window.createPlayer = createPlayer;
window.resetPlayer = resetPlayer;
window.buyUpgrade = buyUpgrade;
