import { useRef, useState } from "react";
import Footer from "../components/Footer";
import UtilityMenu from "../components/UtilityMenu";
import HelpDialog from "../components/HelpDialog";
import Brand from "../components/Brand";

type DiceCount = 2 | 3;

interface DieState {
  face: number;
  label: string;
}

const DIE_LABELS = ["First die", "Second die", "Third die"];

function randomDieValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function initialDice(): DieState[] {
  return DIE_LABELS.map((label) => ({ face: 1, label }));
}

export default function DiceRoll() {
  const [diceCount, setDiceCount] = useState<DiceCount>(2);
  const [dice, setDice] = useState<DieState[]>(initialDice);
  const [isRolling, setIsRolling] = useState(false);
  const [rollLabel, setRollLabel] = useState("掷骰子");
  const [resultTitle, setResultTitle] = useState("Ready");
  const [resultDetail, setResultDetail] = useState(`Total: ${2}`);
  const rollingIntervalId = useRef<number | null>(null);
  const rollingTimeoutId = useRef<number | null>(null);

  function updateDiceCount(nextCount: DiceCount) {
    if (isRolling) return;

    setDiceCount(nextCount);
    setResultTitle("Ready");
    setResultDetail(`Total: ${nextCount}`);
  }

  function throwDice() {
    if (isRolling) return;

    setIsRolling(true);
    setRollLabel("ROLLING");
    setResultTitle("Rolling");
    setResultDetail("Good luck...");

    rollingIntervalId.current = window.setInterval(() => {
      setDice((prev) => prev.map((die, index) => (index < diceCount ? { ...die, face: randomDieValue() } : die)));
    }, 90);

    rollingTimeoutId.current = window.setTimeout(() => {
      if (rollingIntervalId.current !== null) {
        window.clearInterval(rollingIntervalId.current);
        rollingIntervalId.current = null;
      }

      setDice((prev) => {
        const next = prev.map((die, index) => (index < diceCount ? { ...die, face: randomDieValue() } : die));
        const total = next.slice(0, diceCount).reduce((sum, die) => sum + die.face, 0);
        setResultTitle("Result");
        setResultDetail(`Total: ${total}`);
        return next;
      });

      setRollLabel("ROLL AGAIN");
      setIsRolling(false);
    }, 900);
  }

  return (
    <main className="dice-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="掷骰子">
            <p>点击上方按钮，选择使用 2 个或 3 个骰子。</p>
            <p>
              点击"掷骰子"开始摇骰，动画结束后会显示<strong>骰子点数总和</strong>。
            </p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · DICE ROLL</p>
        <h1 id="page-title">掷骰子</h1>
      </section>

      <section className="dice-stage" aria-live="polite">
        <div className="dice-options" role="group" aria-label="Select number of dice">
          <button
            className={`dice-option${diceCount === 2 ? " is-active" : ""}`}
            type="button"
            aria-pressed={diceCount === 2}
            onClick={() => updateDiceCount(2)}
          >
            2 个骰子
          </button>
          <button
            className={`dice-option${diceCount === 3 ? " is-active" : ""}`}
            type="button"
            aria-pressed={diceCount === 3}
            onClick={() => updateDiceCount(3)}
          >
            3 个骰子
          </button>
        </div>

        <div className={`dice-row${isRolling ? " is-rolling" : ""}`} data-count={diceCount}>
          {dice.map((die, index) => (
            <div
              className="die"
              key={die.label}
              data-face={die.face}
              aria-label={`${die.label}: ${die.face}`}
              hidden={index >= diceCount}
            >
              {Array.from({ length: 9 }).map((_, pipIndex) => (
                <span className="pip" key={pipIndex}></span>
              ))}
            </div>
          ))}
        </div>

        <button className="roll-button" type="button" onClick={throwDice} disabled={isRolling}>
          <span className="roll-symbol">⚄</span>
          <span className="roll-label">{rollLabel}</span>
        </button>

        <div className="result" aria-atomic="true">
          <p>{resultTitle}</p>
          <strong>{resultDetail}</strong>
        </div>
      </section>

      <Footer />
    </main>
  );
}
