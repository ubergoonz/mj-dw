import { useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import specialHands from "../data/specialHands.json";
import {
  MAHJONG_TILE_SETS,
  mahjongTileImage,
  type MahjongTileSetId,
} from "../lib/mahjongTileImage";
import "../styles/specialHands.css";

const MAX_VISIBLE_WINNING_POTENTIALS = 6;

function TileImage({ tile, tileSet }: { tile: string; tileSet: MahjongTileSetId }) {
  return <img src={mahjongTileImage(tile, tileSet)} alt={tile} />;
}

export default function SpecialHands() {
  const [selectedId, setSelectedId] = useState(specialHands[0].id);
  const [tileSet, setTileSet] = useState<MahjongTileSetId>("classic");
  const selectedHand = specialHands.find((hand) => hand.id === selectedId) ?? specialHands[0];

  return (
    <main className="fan-payout-shell special-hands-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="特別牌型">
            <p>選擇一個牌型，查看常見新加坡麻將台數、胡牌示例和規則說明。</p>
            <p>台數是方便討論的預設參考；各桌玩法不同，可直接更新 specialHands.json 作為共同規則。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · SPECIAL HANDS</p>
        <h1 id="page-title">特別牌型</h1>
      </section>

      <section className="fan-payout-panel special-hands-panel" aria-label="Special hand reference">
        <div className="special-hand-controls">
          <label className="field">
            <span>Special hand</span>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {specialHands.map((hand) => (
                <option key={hand.id} value={hand.id}>
                  {hand.name} · {hand.englishName}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Tile image set</span>
            <select value={tileSet} onChange={(event) => setTileSet(event.target.value as MahjongTileSetId)}>
              {MAHJONG_TILE_SETS.map((set) => (
                <option key={set.id} value={set.id}>{set.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="special-hand-heading">
          <div>
            <p className="eyebrow">SINGAPORE STYLE REFERENCE</p>
            <h2>{selectedHand.name}</h2>
            <p>{selectedHand.englishName}</p>
          </div>
          <strong className="special-hand-tai">{selectedHand.tai}<small>台</small></strong>
        </div>

        <div className="special-hand-example" aria-label={selectedHand.exampleTitle}>
          <p>{selectedHand.exampleTitle}</p>
          <div className="special-hand-tiles">
            {selectedHand.exampleTiles.map((tile, index) => (
              <span
                className={`special-hand-tile${index === selectedHand.exampleTiles.length - 1 ? " is-winning-tile" : ""}`}
                key={`${tile}-${index}`}
              >
                <TileImage tile={tile} tileSet={tileSet} />
              </span>
            ))}
          </div>
          <br />
          <p className="special-hand-winning-note">
            <strong>Winning tile:</strong> {selectedHand.exampleTiles.at(-1)}. The red border marks the final tile that
            completes this illustrated hand; confirm whether it may be self-drawn or claimed from a discard under your
            table&apos;s rules.
          </p>
          <div className="special-hand-potentials">
            <small>Other winning potential</small>
            {selectedHand.winningPotentialTiles.length > 0 &&
            selectedHand.winningPotentialTiles.length <= MAX_VISIBLE_WINNING_POTENTIALS ? (
              <div className="special-hand-potential-tiles">
                {selectedHand.winningPotentialTiles.map((tile, index) => (
                  <TileImage tile={tile} tileSet={tileSet} key={`${tile}-${index}`} />
                ))}
              </div>
            ) : null}
            <p>{selectedHand.winningPotentialNote}</p>
          </div>
        </div>

        <div className="special-hand-details">
          <div>
            <small>Description</small>
            <p>{selectedHand.description}</p>
          </div>
          <div>
            <small>Table rule note</small>
            <p>{selectedHand.ruleNote}</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
