import { useEffect, useRef, useState } from "react";
import { shuffledWinds } from "../lib/winds";
import Footer from "../components/Footer";
import UtilityMenu from "../components/UtilityMenu";
import HelpDialog from "../components/HelpDialog";
import Brand from "../components/Brand";

interface CardState {
  character: string;
  revealed: boolean;
  winner: boolean;
}

const POSITIONS = ["east", "south", "west", "north"] as const;

const emptyCards: CardState[] = POSITIONS.map(() => ({
  character: "",
  revealed: false,
  winner: false,
}));

export default function WindDraw() {
  const [cards, setCards] = useState<CardState[]>(emptyCards);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCompassDrawing, setIsCompassDrawing] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("开始");
  const [resultTitle, setResultTitle] = useState("准备就绪");
  const [resultDetail, setResultDetail] = useState("点击發开始抽风");
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    const ids = timeoutIds.current;
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function schedule(callback: () => void, delay: number) {
    const id = window.setTimeout(callback, delay);
    timeoutIds.current.push(id);
  }

  function revealTiles() {
    const draw = shuffledWinds();
    const revealOrder = shuffledWinds().map((wind) => wind.character);

    setCards(draw.map((wind) => ({ character: wind.character, revealed: false, winner: false })));

    revealOrder.forEach((character, index) => {
      schedule(() => {
        setCards((prev) =>
          prev.map((card) => (card.character === character ? { ...card, revealed: true } : card)),
        );
      }, index * 260);
    });

    schedule(() => {
      setCards((prev) =>
        prev.map((card) => (card.character === "東" ? { ...card, winner: true } : card)),
      );
      setResultTitle("定风完成 · 東风为庄");
      setResultDetail("東风 · 庄家先行，开局大吉");
      setButtonLabel("再抽一次");
      setIsDrawing(false);
    }, 4 * 260 + 150);
  }

  function drawWind() {
    if (isDrawing) return;

    setIsDrawing(true);
    setCards(emptyCards);
    setIsCompassDrawing(true);
    setButtonLabel("正在起风...");
    setResultTitle("洗牌中");
    setResultDetail("四风正在聚拢");

    schedule(() => {
      setIsCompassDrawing(false);
      setResultTitle("揭晓风位");
      setResultDetail("请看四方");
      revealTiles();
    }, 1250);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="選風打位">
            <p>点击"开始抽风"，系统会随机抽取東、南、西、北四个风位。</p>
            <p>
              抽到<strong>東风</strong>的玩家为本局庄家。
            </p>
          </HelpDialog>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · SEAT DRAW</p>
        <h1 id="page-title">選風打位</h1>
        <p>
          一掷定乾坤，
          <br />
          谁来坐庄？
        </p>
      </section>

      <section className="wind-stage" aria-live="polite">
        <div className={`compass${isCompassDrawing ? " is-drawing" : ""}`} id="compass">
          {cards.map((card, index) => {
            const position = POSITIONS[index];
            const classNames = [
              "card",
              `card-${position}`,
              card.winner ? "winner" : "",
              card.revealed ? "is-revealed" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span className={classNames} key={position} data-wind={card.character}>
                <span className="card-inner">
                  <span className="tile-face tile-back" aria-hidden="true"></span>
                  <span className="tile-face tile-front">{card.character}</span>
                </span>
              </span>
            );
          })}
          <button className="center-tile" id="drawButton" type="button" aria-label="开始抽风" onClick={drawWind} disabled={isDrawing}>
            <span className="tile-symbol">發</span>
            <span className="tile-label">{buttonLabel}</span>
          </button>
        </div>
        <div className="result" id="result" aria-atomic="true">
          <p>{resultTitle}</p>
          <strong>{resultDetail}</strong>
        </div>
      </section>

      <Footer />
    </main>
  );
}
