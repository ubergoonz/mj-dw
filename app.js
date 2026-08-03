const winds = [
  { name: "东风", character: "东", detail: "庄家先行，开局大吉" },
  { name: "南风", character: "南", detail: "南来北往，手气正旺" },
  { name: "西风", character: "西", detail: "西风送爽，静待好牌" },
  { name: "北风", character: "北", detail: "北辰高照，稳坐牌桌" },
];

const compass = document.querySelector("#compass");
const result = document.querySelector("#result");
const drawButton = document.querySelector("#drawButton");
const buttonLabel = document.querySelector("#buttonLabel");
const rulesDialog = document.querySelector("#rulesDialog");
const cards = [...document.querySelectorAll(".card")];

let isDrawing = false;

function shuffledWinds() {
  const shuffled = [...winds];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function resetTiles() {
  cards.forEach((card) => {
    card.classList.remove("winner", "is-revealed");
    card.querySelector(".tile-front").textContent = "";
    card.removeAttribute("data-wind");
  });
}

function revealTiles() {
  const draw = shuffledWinds();
  const revealOrder = shuffledWinds().map((wind) => wind.character);

  cards.forEach((card, index) => {
    const wind = draw[index];
    card.dataset.wind = wind.character;
    card.querySelector(".tile-front").textContent = wind.character;
  });

  revealOrder.forEach((character, index) => {
    window.setTimeout(() => {
      const card = cards.find((tile) => tile.dataset.wind === character);
      card.classList.add("is-revealed");
    }, index * 260);
  });

  const eastCard = cards.find((card) => card.dataset.wind === "东");
  window.setTimeout(() => {
    eastCard.classList.add("winner");
    result.innerHTML = "<p>定风完成 · 东风为庄</p><strong>东风 · 庄家先行，开局大吉</strong>";
    buttonLabel.textContent = "再抽一次";
    drawButton.disabled = false;
    isDrawing = false;
  }, 4 * 260 + 150);
}

function drawWind() {
  if (isDrawing) return;

  isDrawing = true;
  resetTiles();
  compass.classList.add("is-drawing");
  drawButton.disabled = true;
  buttonLabel.textContent = "正在起风...";
  result.innerHTML = "<p>洗牌中</p><strong>四风正在聚拢</strong>";

  window.setTimeout(() => {
    compass.classList.remove("is-drawing");
    result.innerHTML = "<p>揭晓风位</p><strong>请看四方</strong>";
    revealTiles();
  }, 1250);
}

drawButton.addEventListener("click", drawWind);

document.querySelector(".icon-button").addEventListener("click", () => {
  rulesDialog.showModal();
});

document.querySelector("#closeRules").addEventListener("click", () => {
  rulesDialog.close();
});

rulesDialog.addEventListener("click", (event) => {
  if (event.target === rulesDialog) rulesDialog.close();
});
