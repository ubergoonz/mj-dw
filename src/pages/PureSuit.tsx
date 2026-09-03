import { useMemo, useState, type DragEvent } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import { mahjongTileImage } from "../lib/mahjongTileImage";
import { getPureSuitDiscardSuggestions, getPureSuitWinningTiles, knownRemainingCopies, pureSuitDrawChance, type TileCounts } from "../lib/pureSuit";
import "../styles/pureSuit.css";

type Suit = "萬" | "筒" | "索";
type NormalArea = "hidden" | "river";
type OpenGroupKind = "chi" | "pong" | "gang";

const NUMBERS = "一二三四五六七八九";
const BONUS_TILES = ["春", "夏", "秋", "冬", "梅", "蘭", "菊", "竹", "猫", "鼠", "鸡", "蜈"];
const EMPTY_GROUPS = Array.from({ length: 4 }, () => [] as number[]);

function tileName(tile: number, suit: Suit): string {
  return `${NUMBERS[tile - 1]}${suit}`;
}

function toCounts(tiles: number[]): TileCounts {
  return Array.from({ length: 9 }, (_, index) => tiles.filter((tile) => tile === index + 1).length);
}

function getOpenGroupKind(tiles: number[]): OpenGroupKind | null {
  if (tiles.length === 3 && tiles.every((tile) => tile === tiles[0])) return "pong";
  if (tiles.length === 4 && tiles.every((tile) => tile === tiles[0])) return "gang";
  const sorted = [...tiles].sort((first, second) => first - second);
  return sorted.length === 3 && sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1 ? "chi" : null;
}

function groupHint(tiles: number[], kind: OpenGroupKind | null): string {
  if (tiles.length === 0) return "Add 3 sequential tiles for chi, or 3 matching tiles for pong.";
  if (kind === "chi") return "Chi: 3 sequential tiles.";
  if (kind === "pong") return "Pong: 3 matching tiles. Add a fourth matching tile to upgrade to gang.";
  if (kind === "gang") return "Gang: 4 matching tiles.";
  return "Incomplete or invalid: use 3 sequential tiles, 3 matching tiles, or 4 matching tiles.";
}

export default function PureSuit() {
  const [suit, setSuit] = useState<Suit>("萬");
  const [openGroups, setOpenGroups] = useState<number[][]>(EMPTY_GROUPS);
  const [hiddenTiles, setHiddenTiles] = useState<number[]>([]);
  const [riverTiles, setRiverTiles] = useState<number[]>([]);
  const [bonusTiles, setBonusTiles] = useState<string[]>([]);
  const [tileTarget, setTileTarget] = useState<"open" | "hidden">("hidden");
  const [activeOpenGroup, setActiveOpenGroup] = useState(0);

  const groupKinds = openGroups.map(getOpenGroupKind);
  const completeOpenGroups = groupKinds.filter((kind) => kind !== null).length;
  const openGroupsValid = openGroups.every((group, index) => group.length === 0 || groupKinds[index] !== null);
  const openTiles = openGroups.flat();
  const openCounts = useMemo(() => toCounts(openTiles), [openTiles]);
  const hiddenCounts = useMemo(() => toCounts(hiddenTiles), [hiddenTiles]);
  const riverCounts = useMemo(() => toCounts(riverTiles), [riverTiles]);
  const hiddenCapacity = 14 - completeOpenGroups * 3;
  const waitSize = openGroupsValid ? 13 - completeOpenGroups * 3 : 0;
  const discardSize = openGroupsValid ? hiddenCapacity : 0;
  const winningTiles = useMemo(() => openGroupsValid ? getPureSuitWinningTiles(hiddenCounts, completeOpenGroups) : [], [openGroupsValid, hiddenCounts, completeOpenGroups]);
  const suggestions = useMemo(() => openGroupsValid ? getPureSuitDiscardSuggestions(hiddenCounts, completeOpenGroups) : [], [openGroupsValid, hiddenCounts, completeOpenGroups]);
  const drawChance = pureSuitDrawChance(winningTiles, hiddenCounts, riverCounts, openCounts);

  function canAddTile(tile: number, groupIndex?: number): boolean {
    const knownCount = openCounts[tile - 1] + hiddenCounts[tile - 1] + riverCounts[tile - 1];
    if (knownCount >= 4) return false;
    if (groupIndex !== undefined) return openGroups[groupIndex].length < 4;
    return hiddenTiles.length < hiddenCapacity;
  }

  function addToOpenGroup(tile: number, groupIndex = activeOpenGroup) {
    if (!canAddTile(tile, groupIndex)) return;
    const nextGroups = openGroups.map((group, index) => index === groupIndex ? [...group, tile] : group);
    const nextCompleteGroups = nextGroups.filter((group) => getOpenGroupKind(group) !== null).length;
    if (hiddenTiles.length > 14 - nextCompleteGroups * 3) return;
    setOpenGroups(nextGroups);
  }

  function addToHidden(tile: number) {
    if (canAddTile(tile)) setHiddenTiles((current) => [...current, tile]);
  }

  function addToRiver(tile: number) {
    const knownCount = openCounts[tile - 1] + hiddenCounts[tile - 1] + riverCounts[tile - 1];
    if (knownCount < 4) setRiverTiles((current) => [...current, tile]);
  }

  function removeFromGroup(groupIndex: number, tileIndex: number) {
    setOpenGroups((current) => current.map((group, index) => index === groupIndex ? group.filter((_, itemIndex) => itemIndex !== tileIndex) : group));
  }

  function handleDrop(target: "open" | NormalArea, event: DragEvent<HTMLElement>, groupIndex?: number) {
    event.preventDefault();
    const [source, value] = event.dataTransfer.getData("text/plain").split(":");
    const tile = Number(value);
    if (!Number.isInteger(tile)) return;
    if (source === "palette") {
      if (target === "open" && groupIndex !== undefined) addToOpenGroup(tile, groupIndex);
      else if (target === "hidden") addToHidden(tile);
      else addToRiver(tile);
    }
  }

  function reset() {
    setOpenGroups(EMPTY_GROUPS);
    setHiddenTiles([]);
    setRiverTiles([]);
    setBonusTiles([]);
    setActiveOpenGroup(0);
  }

  const waiting = openGroupsValid && hiddenTiles.length === waitSize;
  const discarding = openGroupsValid && hiddenTiles.length === discardSize;

  return (
    <main className="fan-payout-shell pure-suit-shell">
      <header className="topbar"><Brand /><div className="topbar-actions"><UtilityMenu /><HelpDialog eyebrow="HOW TO PLAY" title="清一色听牌"><p>把公开吃/碰/槓分成最多四组。每组会检查是顺子、碰子还是槓子。</p><p>隐藏手牌保留 14 个位置；每完成一组公开牌，会锁定 3 个位置。最后一张手牌为刚摸到的牌。</p></HelpDialog></div></header>
      <section className="hero" aria-labelledby="page-title"><p className="eyebrow">MAHJONG · PURE SUIT</p><h1 id="page-title">清一色听牌</h1></section>
      <section className="fan-payout-panel pure-suit-panel" aria-label="Pure Suit Mahjong hand assistant">
        <div className="pure-suit-controls"><label className="field"><span>Suit</span><select value={suit} onChange={(event) => setSuit(event.target.value as Suit)}><option value="萬">萬 Characters</option><option value="筒">筒 Circles</option><option value="索">索 Bamboos</option></select></label><button className="pure-suit-reset" type="button" onClick={reset}>Reset</button></div>
        <div className="pure-suit-summary"><div><small>Open groups</small><strong>{completeOpenGroups} / 4</strong></div><div><small>Hidden tiles</small><strong>{hiddenTiles.length} / {hiddenCapacity}</strong></div><div><small>Wait size</small><strong>{waitSize || "—"}</strong></div><div><small>Discard size</small><strong>{discardSize || "—"}</strong></div></div>
        <section className="pure-suit-section"><div className="range-header"><span>Flowers & animals</span><strong>{bonusTiles.length} / 12 tiles</strong></div><div className="pure-suit-bonus-rack">{bonusTiles.map((tile, index) => <button type="button" key={`${tile}-${index}`} aria-label={`Remove ${tile}`} onClick={() => setBonusTiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><img src={mahjongTileImage(tile)} alt="" /></button>)}</div><div className="pure-suit-bonus-palette">{BONUS_TILES.map((tile) => <button type="button" key={tile} aria-label={`Add ${tile}`} disabled={bonusTiles.length === 12 || bonusTiles.includes(tile)} onClick={() => setBonusTiles((current) => [...current, tile])}><img src={mahjongTileImage(tile)} alt="" /></button>)}</div></section>
        <section className="pure-suit-section"><div className="range-header"><span>Open chi / pong / gang</span><strong>Tap a group, then add tiles</strong></div><div className="pure-suit-open-groups">{openGroups.map((group, groupIndex) => <div className={`pure-suit-open-group${activeOpenGroup === groupIndex ? " is-selected" : ""}`} key={groupIndex}><button type="button" className="pure-suit-group-label" onClick={() => { setActiveOpenGroup(groupIndex); setTileTarget("open"); }}>Group {groupIndex + 1}</button><div className="pure-suit-group-slots" onDragEnter={(event) => event.preventDefault()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop("open", event, groupIndex)}>{Array.from({ length: 4 }, (_, tileIndex) => group[tileIndex] ? <button type="button" className="pure-suit-rack-tile" key={tileIndex} aria-label={`Remove ${tileName(group[tileIndex], suit)} from group ${groupIndex + 1}`} onClick={() => removeFromGroup(groupIndex, tileIndex)}><img src={mahjongTileImage(tileName(group[tileIndex], suit))} alt="" /></button> : <span className={`pure-suit-rack-slot${tileIndex === 3 ? " is-gang-slot" : ""}`} key={tileIndex} />)}</div><p>{groupHint(group, groupKinds[groupIndex])}</p></div>)}</div></section>
        <section className="pure-suit-section"><div className="range-header"><span>Hidden hand</span><strong>{hiddenTiles.length} / {hiddenCapacity} tiles</strong></div><div className="pure-suit-hidden-rack" onDragEnter={(event) => event.preventDefault()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop("hidden", event)}>{Array.from({ length: 14 }, (_, index) => hiddenTiles[index] ? <button className={`pure-suit-rack-tile${index === hiddenTiles.length - 1 ? " is-drawn-tile" : ""}`} type="button" key={index} aria-label={`Remove ${tileName(hiddenTiles[index], suit)} from hidden hand`} onClick={() => setHiddenTiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><img src={mahjongTileImage(tileName(hiddenTiles[index], suit))} alt="" /></button> : <span className={`pure-suit-rack-slot${index >= hiddenCapacity ? " is-disabled-slot" : ""}`} key={index} />)}</div><p className="pure-suit-help">The red-bordered tile is the latest draw. Completed open groups lock three hidden-hand slots.</p></section>
        <section className="pure-suit-section"><div className="range-header"><span>Suit tiles</span><div className="pure-suit-target-toggle"><button type="button" className={tileTarget === "open" ? "is-active" : ""} onClick={() => setTileTarget("open")}>Open group {activeOpenGroup + 1}</button><button type="button" className={tileTarget === "hidden" ? "is-active" : ""} onClick={() => setTileTarget("hidden")}>Hidden hand</button></div></div><div className="pure-suit-grid">{Array.from({ length: 9 }, (_, index) => index + 1).map((tile) => <button className="pure-suit-palette-tile" type="button" key={tile} aria-label={`Add ${tileName(tile, suit)} to ${tileTarget}`} disabled={tileTarget === "open" ? !canAddTile(tile, activeOpenGroup) : !canAddTile(tile)} draggable onClick={() => tileTarget === "open" ? addToOpenGroup(tile) : addToHidden(tile)} onDragStart={(event) => event.dataTransfer.setData("text/plain", `palette:${tile}`)}><img src={mahjongTileImage(tileName(tile, suit))} alt="" /><strong>{openCounts[tile - 1] + hiddenCounts[tile - 1] + riverCounts[tile - 1]} / 4</strong></button>)}</div></section>
        <section className="pure-suit-section"><div className="range-header"><span>Discard river</span><strong>{riverTiles.length} tiles</strong></div><div className="pure-suit-river-rack" onDragEnter={(event) => event.preventDefault()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop("river", event)}>{riverTiles.map((tile, index) => <button className="pure-suit-rack-tile" type="button" key={`${tile}-${index}`} aria-label={`Remove ${tileName(tile, suit)} from river`} onClick={() => setRiverTiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><img src={mahjongTileImage(tileName(tile, suit))} alt="" /></button>)}</div></section>
        <section className="pure-suit-section pure-suit-waits"><div className="range-header"><span>Winning tiles</span><strong>{winningTiles.length} waits</strong></div>{waiting ? winningTiles.length ? <><div className="pure-suit-wait-list">{winningTiles.map((tile) => <div key={tile}><img src={mahjongTileImage(tileName(tile, suit))} alt={tileName(tile, suit)} /><strong>{knownRemainingCopies(tile, hiddenCounts, riverCounts, openCounts)} left</strong></div>)}</div><p className="pure-suit-odds">Known-suit draw chance: <strong>{(drawChance * 100).toFixed(1)}%</strong></p></> : <p className="pure-suit-empty">This hand is not waiting on a standard 清一色 hand.</p> : <p className="pure-suit-empty">{openGroupsValid ? `Enter ${waitSize} hidden tiles to see waits.` : "Complete every open group as chi, pong, or gang first."}</p>}</section>
        <section className="pure-suit-section"><div className="range-header"><span>Discard suggestions</span><strong>{suggestions.length} options</strong></div>{discarding ? suggestions.length ? <div className="pure-suit-suggestions">{suggestions.map((suggestion) => <div className="pure-suit-suggestion" key={suggestion.discard}><div><small>Discard</small><img src={mahjongTileImage(tileName(suggestion.discard, suit))} alt={tileName(suggestion.discard, suit)} /></div><div><small>Then wait on</small><p>{suggestion.winningTiles.map((tile) => tileName(tile, suit)).join(" · ")}</p></div><strong>{suggestion.winningTiles.reduce((total, tile) => total + knownRemainingCopies(tile, hiddenCounts, riverCounts, openCounts), 0)} known left</strong></div>)}</div> : <p className="pure-suit-empty">No discard creates an immediate wait.</p> : <p className="pure-suit-empty">{openGroupsValid ? `Enter ${discardSize} hidden tiles to compare discards.` : "Complete every open group as chi, pong, or gang first."}</p>}</section>
      </section><Footer />
    </main>
  );
}
