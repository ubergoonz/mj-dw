import { useEffect, useRef, useState, type CSSProperties } from "react";
import Footer from "../components/Footer";
import UtilityMenu from "../components/UtilityMenu";
import HelpDialog from "../components/HelpDialog";
import Brand from "../components/Brand";
import { resolveWallBreak, SEAT_ORDER, stacksForSeat, type Seat, type WallBreakResult } from "../lib/inGameDiceRoll";
import "../styles/inGameDiceRoll.css";

type DiceCount = 2 | 3;

interface DieState {
  face: number;
  label: string;
}

/** Visual compass slot each seat is pinned to, reusing WindDraw's compass layout. */
// Real compass orientation for this feature: 東 at the bottom, 南 on the
// right, 西 at the top, 北 on the left (matches the physical seating view).
const COMPASS_POSITIONS: Record<Seat, "east" | "south" | "west" | "north"> = {
  東: "west",
  南: "south",
  西: "east",
  北: "north",
};

const DIE_LABELS = ["First die", "Second die", "Third die"];
const ROLLOVER_TOTALS = Array.from({ length: 23 }, (_, index) => index + 2);
const WALL_COLOR_THEMES = [
  { top: "#f8efdc", bottom: "#e8dabb", border: "rgba(120, 100, 60, 0.24)" },
  { top: "#e9f3e7", bottom: "#c8ddc4", border: "rgba(70, 103, 71, 0.3)" },
  { top: "#f6e7ef", bottom: "#e3c6d5", border: "rgba(126, 74, 97, 0.3)" },
  { top: "#e7eef7", bottom: "#c4d4e8", border: "rgba(74, 95, 130, 0.3)" },
] as const;

/** With 2 dice the dealer rolls twice — first roll picks the seat, second picks the break stack; with 3 dice, one roll does both. */
function rollsRequired(diceCount: DiceCount): number {
  return diceCount === 2 ? 2 : 1;
}

function randomDieValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDiceForTotal(total: number): [number, number] {
  if (total < 2) return [1, 1];

  const firstDie = randomInteger(Math.max(1, total - 6), Math.min(6, total - 1));
  return [firstDie, total - firstDie];
}

function randomRollPairForTotal(total: number): [number, number] {
  // Totals 2 and 3 are synthetic edge-case simulations: two physical
  // two-dice rolls would normally have a minimum combined total of 4.
  const firstRoll = randomInteger(Math.max(1, total - 12), Math.min(12, total - 1));
  return [firstRoll, total - firstRoll];
}

function freshDice(diceCount: DiceCount): DieState[] {
  return DIE_LABELS.slice(0, diceCount).map((label) => ({ face: 1, label }));
}

export default function InGameDiceRoll() {
  const [diceCount, setDiceCount] = useState<DiceCount>(2);
  const [dice, setDice] = useState<DieState[]>(() => freshDice(2));
  const [rollsSoFar, setRollsSoFar] = useState<number[]>([]);
  const [result, setResult] = useState<WallBreakResult | null>(null);
  const [revealedSeats, setRevealedSeats] = useState<Seat[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [wallThemeIndex, setWallThemeIndex] = useState(0);
  const rollingIntervalId = useRef<number | null>(null);
  const rollingTimeoutId = useRef<number | null>(null);
  const revealTimeoutIds = useRef<number[]>([]);

  useEffect(() => {
    const revealTimeouts = revealTimeoutIds.current;
    return () => {
      revealTimeouts.forEach((id) => window.clearTimeout(id));
      if (rollingIntervalId.current !== null) window.clearInterval(rollingIntervalId.current);
      if (rollingTimeoutId.current !== null) window.clearTimeout(rollingTimeoutId.current);
    };
  }, []);

  useEffect(() => {
    revealTimeoutIds.current.forEach((id) => window.clearTimeout(id));
    revealTimeoutIds.current = [];

    if (!result) {
      setRevealedSeats([]);
      const id = window.setTimeout(() => {
        setRevealedSeats([...SEAT_ORDER]);
      }, 1000);
      revealTimeoutIds.current.push(id);
      return;
    }

    SEAT_ORDER.forEach((seat, index) => {
      const id = window.setTimeout(() => {
        setRevealedSeats((prev) => [...prev, seat]);
      }, index * 220);
      revealTimeoutIds.current.push(id);
    });
  }, [result]);

  function updateDiceCount(nextCount: DiceCount) {
    if (isRolling) return;

    setDiceCount(nextCount);
    setDice(freshDice(nextCount));
    setRollsSoFar([]);
    setResult(null);
  }

  function simulateRollover(total: number) {
    if (isRolling || diceCount !== 2) return;

    setWallThemeIndex((current) => (current + 1) % WALL_COLOR_THEMES.length);

    const [firstRoll, secondRoll] = randomRollPairForTotal(total);
    const [firstFace, secondFace] = randomDiceForTotal(secondRoll);
    setDice([
      { face: firstFace, label: DIE_LABELS[0] },
      { face: secondFace, label: DIE_LABELS[1] },
    ]);
    const simulatedRolls = [firstRoll, secondRoll];
    setRollsSoFar(simulatedRolls);
    setResult(resolveWallBreak(simulatedRolls[0], simulatedRolls[1]));
  }

  function throwDice() {
    if (isRolling) return;

    const startingFresh = result !== null || rollsSoFar.length >= rollsRequired(diceCount);
    const priorRolls = startingFresh ? [] : rollsSoFar;

    if (startingFresh) {
      setResult(null);
      setRollsSoFar([]);
    }

    setWallThemeIndex((current) => (current + 1) % WALL_COLOR_THEMES.length);
    setIsRolling(true);

    rollingIntervalId.current = window.setInterval(() => {
      setDice((prev) => prev.map((die) => ({ ...die, face: randomDieValue() })));
    }, 90);

    rollingTimeoutId.current = window.setTimeout(() => {
      if (rollingIntervalId.current !== null) {
        window.clearInterval(rollingIntervalId.current);
        rollingIntervalId.current = null;
      }

      const finalFaces = dice.map(() => randomDieValue());
      setDice((prev) => prev.map((die, index) => ({ ...die, face: finalFaces[index] })));

      const rollTotal = finalFaces.reduce((sum, face) => sum + face, 0);
      const updatedRolls = [...priorRolls, rollTotal];
      setRollsSoFar(updatedRolls);

      if (updatedRolls.length >= rollsRequired(diceCount)) {
        // First roll picks the seat (counting 東→南→西→北). With two dice,
        // the second roll is added to the first to find the break stack;
        // with three dice, the single roll is used directly for both.
        setResult(
          updatedRolls.length > 1
            ? resolveWallBreak(updatedRolls[0], updatedRolls[1])
            : resolveWallBreak(updatedRolls[0]),
        );
      }

      setIsRolling(false);
    }, 900);
  }

  function rollLabel(): string {
    if (isRolling) return "掷骰中...";
    if (result) return "重新开始";
    if (rollsSoFar.length > 0) return "掷第二次";
    return diceCount === 2 ? "掷第一次" : "庄家掷骰";
  }

  function centerLabel(): string {
    if (isRolling) return "掷骰中";
    if (result) return diceCount === 2 ? `${result.seatRoll} · ${result.breakRoll} 点` : `共 ${result.seatRoll} 点`;
    if (rollsSoFar.length > 0) return `${rollsSoFar[0]} 点 · 再掷`;
    return "点击掷骰";
  }

  const wallTheme = WALL_COLOR_THEMES[wallThemeIndex];
  const wallThemeVars = {
    "--wall-stack-top": wallTheme.top,
    "--wall-stack-bottom": wallTheme.bottom,
    "--wall-stack-border": wallTheme.border,
  } as CSSProperties;

  return (
    <main className="app-shell in-game-dice-roll">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="掷骰开墩">
            <p>庄家（東）掷骰决定哪一家开门取牌：选 2 颗骰子需连续掷两次；选 3 颗骰子只需掷一次。</p>
            <p>
              第一次点数从庄家起，按東、南、西、北的出牌顺序数，数到的一家即为开门家（3 颗骰子时同一次点数兼作此用）。
            </p>
            <p>
              新加坡麻将中，<strong>東、西</strong>两家的墙各叠 19 墩，<strong>南、北</strong>
              两家各叠 18 墩。
            </p>
            <p>
              2 颗骰子时，第一次由東掷骰，点数决定由哪一家掷第二次；两次点数相加后，从第二位掷骰者的墙开始数。
              3 颗骰子时由東一次掷完并直接计数。墙墩计数一律从该墙的第 1 墩开始，开门后从下一墩开始摸牌。
            </p>
            <p>若两次点数超过当前墙的总墩数，则向左顺延：東→北→西→南→東。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · WALL BREAK</p>
        <h1 id="page-title">掷骰开墩</h1>
        <p>
          庄家掷骰，
          <br />
          定开墩起始位。
        </p>
      </section>

      <section className="dice-stage" aria-live="polite">
        <div className="dice-options" role="group" aria-label="Select number of dice">
          <button
            className={`dice-option${diceCount === 2 ? " is-active" : ""}`}
            type="button"
            aria-pressed={diceCount === 2}
            onClick={() => updateDiceCount(2)}
          >
            2 个骰子 · 掷两次
          </button>
          <button
            className={`dice-option${diceCount === 3 ? " is-active" : ""}`}
            type="button"
            aria-pressed={diceCount === 3}
            onClick={() => updateDiceCount(3)}
          >
            3 个骰子 · 掷一次
          </button>
        </div>
        <div className="compass" aria-label="风位开门结果">
          {SEAT_ORDER.map((seat) => {
            const position = COMPASS_POSITIONS[seat];
            const classNames = [
              "card",
              `card-${position}`,
              result?.seat === seat ? "winner" : "",
              revealedSeats.includes(seat) ? "is-revealed" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span className={classNames} key={seat}>
                <span className="card-inner">
                  <span className="tile-face tile-back" aria-hidden="true"></span>
                  <span className="tile-face tile-front">{seat}</span>
                  {seat === "東" && (
                    <span className="east-starter-marker" aria-label="起莊">
                      ▲起莊
                    </span>
                  )}
                </span>
              </span>
            );
          })}
          <div className={`wall-ring${result ? " has-result" : ""}`} style={wallThemeVars} aria-hidden="true">
            {SEAT_ORDER.map((seat) => {
              const position = COMPASS_POSITIONS[seat];
              const totalStacks = stacksForSeat(seat);
              const isBreakSeat = result?.seat === seat;
              // Visual stacks are laid out left-to-right, but wall counting is
              // from the right end. `splitIndex` marks the break stack index
              // in left-to-right coordinates; when breakStack is 0 it points
              // past the right edge (boundary rollover to next wall).
              const splitIndex = isBreakSeat ? totalStacks - result.breakStack : -1;

              return (
                <span
                  className={[
                    "seat-wall",
                    `seat-wall-${position}`,
                    isBreakSeat ? "is-break-seat" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={`wall-${seat}`}
                >
                  {Array.from({ length: totalStacks }).map((_, stackIndex) => {
                    const isRightSegment = isBreakSeat && stackIndex >= splitIndex;
                    const isBreakStack = isBreakSeat && result.breakStack > 0 && stackIndex === splitIndex;
                    const isDrawStart = isBreakSeat && stackIndex === splitIndex - 1;

                    return (
                      <span
                        className={[
                          "seat-wall-stack",
                          isRightSegment ? "is-right-segment" : "is-left-segment",
                          isBreakStack ? "is-break-stack" : "",
                          isDrawStart ? "is-draw-start" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={
                          isBreakSeat
                            ? { transitionDelay: `${Math.abs(stackIndex - splitIndex) * 18}ms` }
                            : undefined
                        }
                        key={`${seat}-${stackIndex}`}
                      ></span>
                    );
                  })}
                </span>
              );
            })}
          </div>
          <button
            className="center-tile center-tile--dice"
            type="button"
            onClick={throwDice}
            disabled={isRolling}
            aria-label={rollLabel()}
          >
            <div className="center-dice" data-count={diceCount}>
              {dice.map((die) => (
                <div className="die die--mini" key={die.label} data-face={die.face} aria-hidden="true">
                  {Array.from({ length: 9 }).map((_, pipIndex) => (
                    <span className="pip" key={pipIndex}></span>
                  ))}
                </div>
              ))}
            </div>
            <span className="tile-label">{centerLabel()}</span>
          </button>
        </div>

        <div className="wall-result" aria-atomic="true">
          {result ? (
            <>
              <p>
                {diceCount === 2 && rollsSoFar.length === 2
                  ? `第一次 ${result.seatRoll} 点由${result.chosenSeat}掷第二次 · 两次相加 ${result.seatRoll + result.breakRoll} 点`
                  : `東掷骰 ${result.seatRoll} 点`}{" "}
                · {result.seat}家开门
              </p>
              {result.rolledOver && (
                <p className="wall-result-rollover">
                  点数超过{result.chosenSeat}家墙墩数，顺延至{result.seat}家墙
                </p>
              )}
              <strong>
                {result.breakStack === 0 ? (
                  <>
                    墙尾后开门，第 <span className="wall-result-number">1</span> 墩起摸牌
                  </>
                ) : (
                  <>
                    从第 <span className="wall-result-number">{result.breakStack}</span> 墩处开门，第{" "}
                    <span className="wall-result-number">{result.breakStack + 1}</span> 墩起摸牌
                  </>
                )}
              </strong>
              <span className="wall-result-meta">
                {result.seat}家墙共 {result.totalStacks} 墩，开门后剩{" "}
                <strong className="wall-result-number remaining-stacks-number">{result.remainingStacks}</strong> 墩
              </span>
            </>
          ) : rollsSoFar.length > 0 ? (
            <>
              <p>第一次点数 {rollsSoFar[0]}，由{SEAT_ORDER[(rollsSoFar[0] - 1) % SEAT_ORDER.length]}掷第二次</p>
              <strong>
                请 <span className="second-roller-seat">{SEAT_ORDER[(rollsSoFar[0] - 1) % SEAT_ORDER.length]}家</span>
                {" "}掷第二次，定开门墩
              </strong>
            </>
          ) : (
            <>
              <p>准备就绪</p>
              <strong>点击骰子，定摸牌起始位</strong>
            </>
          )}
        </div>

        {diceCount === 2 && (
          <div className="simulation-controls" aria-label="临时总点数模拟">
            <span className="simulation-label">临时模拟：</span>
            {ROLLOVER_TOTALS.map((total) => (
              <button
                className="simulation-button"
                type="button"
                onClick={() => simulateRollover(total)}
                disabled={isRolling}
                key={total}
              >
                {total} 点
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
