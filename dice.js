const rollButton = document.querySelector("#rollButton");
const rollLabel = document.querySelector("#rollLabel");
const diceRow = document.querySelector("#diceRow");
const diceOptions = [...document.querySelectorAll(".dice-option")];
const dieOne = document.querySelector("#dieOne");
const dieTwo = document.querySelector("#dieTwo");
const dieThree = document.querySelector("#dieThree");
const result = document.querySelector("#result");

let isRolling = false;
let diceCount = 2;

function randomDieValue() {
  return Math.floor(Math.random() * 6) + 1;
}

function setDieFace(die, value, labelPrefix) {
  die.dataset.face = String(value);
  die.setAttribute("aria-label", `${labelPrefix}: ${value}`);
}

function activeDice() {
  return [
    { element: dieOne, label: "First die" },
    { element: dieTwo, label: "Second die" },
    { element: dieThree, label: "Third die" },
  ].slice(0, diceCount);
}

function setDiceCount(nextCount) {
  if (isRolling) return;

  diceCount = nextCount;
  diceRow.dataset.count = String(diceCount);
  dieThree.hidden = diceCount !== 3;

  diceOptions.forEach((option) => {
    const isActive = Number(option.dataset.count) === diceCount;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });

  result.innerHTML = `<p>Ready</p><strong>Total: ${diceCount}</strong>`;
}

function throwDice() {
  if (isRolling) return;

  isRolling = true;
  rollButton.disabled = true;
  rollLabel.textContent = "ROLLING";
  result.innerHTML = "<p>Rolling</p><strong>Good luck...</strong>";
  diceRow.classList.add("is-rolling");

  const rollingAnimation = window.setInterval(() => {
    activeDice().forEach((die) => {
      setDieFace(die.element, randomDieValue(), die.label);
    });
  }, 90);

  window.setTimeout(() => {
    window.clearInterval(rollingAnimation);

    const values = activeDice().map((die) => {
      const value = randomDieValue();
      setDieFace(die.element, value, die.label);
      return value;
    });
    const total = values.reduce((sum, value) => sum + value, 0);
    diceRow.classList.remove("is-rolling");

    result.innerHTML = `<p>Result</p><strong>Total: ${total}</strong>`;
    rollLabel.textContent = "ROLL AGAIN";
    rollButton.disabled = false;
    isRolling = false;
  }, 900);
}

setDieFace(dieOne, 1, "First die");
setDieFace(dieTwo, 1, "Second die");
setDieFace(dieThree, 1, "Third die");
setDiceCount(2);

diceOptions.forEach((option) => {
  option.addEventListener("click", () => {
    setDiceCount(Number(option.dataset.count));
  });
});

rollButton.addEventListener("click", throwDice);
