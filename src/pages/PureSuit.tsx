import { useMemo, useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import { mahjongTileImage } from "../lib/mahjongTileImage";
import { getPureSuitDiscardSuggestions, getPureSuitHandPlan, getPureSuitWinningTiles, knownRemainingCopies, pureSuitDrawChance, type TileCounts } from "../lib/pureSuit";
import "../styles/pureSuit.css";

type Suit = "萬" | "筒" | "索";
type SetSource = "concealed" | "claimed" | "upgraded";
type HandSet = { id: string; tiles: number[]; kind: "chi" | "pong" | "gang"; source: SetSource; claimedTile?: number };

const NUMBERS = "一二三四五六七八九";

function tileName(tile: number, suit: Suit): string {
  return `${NUMBERS[tile - 1]}${suit}`;
}

function toCounts(tiles: number[]): TileCounts {
  return Array.from({ length: 9 }, (_, index) => tiles.filter((tile) => tile === index + 1).length);
}

function sortedTiles(tiles: number[]): number[] {
  return [...tiles].sort((first, second) => first - second);
}

function setHint(set: HandSet): string {
  if (set.kind === "chi") return set.source === "claimed" ? "Chi claimed from another player." : "Concealed chi.";
  if (set.kind === "pong") return set.source === "claimed" ? "Pong claimed from another player." : "Concealed pong.";
  return set.source === "upgraded" ? "Gang upgraded by self-draw from a claimed pong." : "Self-drawn hidden gang.";
}

function sourceLabel(source: SetSource): string {
  if (source === "claimed") return "From player";
  if (source === "upgraded") return "Upgraded";
  return "Concealed";
}

export default function PureSuit() {
  const [suit, setSuit] = useState<Suit>("萬");
  const [handSets, setHandSets] = useState<HandSet[]>([]);
  const [looseTiles, setLooseTiles] = useState<number[]>([]);
  const [riverTiles, setRiverTiles] = useState<number[]>([]);
  const [autoSort, setAutoSort] = useState(false);
  const [claimTab, setClaimTab] = useState<HandSet["kind"]>("chi");

  const claimedSets = handSets.filter((set) => set.source !== "concealed");
  const claimedSetCount = claimedSets.length;
  const claimedTiles = claimedSets.flatMap((set) => set.tiles);
  const allHandTiles = useMemo(() => [...looseTiles, ...handSets.filter((set) => set.source === "concealed").flatMap((set) => set.tiles)], [looseTiles, handSets]);
  const concealedCounts = useMemo(() => toCounts(allHandTiles), [allHandTiles]);
  const looseCounts = useMemo(() => toCounts(looseTiles), [looseTiles]);
  const claimedCounts = useMemo(() => toCounts(claimedTiles), [claimedTiles]);
  const riverCounts = useMemo(() => toCounts(riverTiles), [riverTiles]);
  const hiddenCapacity = 14 - claimedSetCount * 3;
  const waitSize = 13 - claimedSetCount * 3;
  const discardSize = 14 - claimedSetCount * 3;
  const winningTiles = useMemo(() => getPureSuitWinningTiles(concealedCounts, claimedSetCount), [concealedCounts, claimedSetCount]);
  const suggestions = useMemo(() => getPureSuitDiscardSuggestions(concealedCounts, claimedSetCount), [concealedCounts, claimedSetCount]);
  const rankedSuggestions = useMemo(() => suggestions.map((suggestion) => {
    const afterDiscard = [...concealedCounts];
    afterDiscard[suggestion.discard - 1] -= 1;
    const knownLeft = suggestion.winningTiles.reduce((total, tile) => total + knownRemainingCopies(tile, afterDiscard, riverCounts, claimedCounts), 0);
    return { ...suggestion, knownLeft, drawChance: pureSuitDrawChance(suggestion.winningTiles, afterDiscard, riverCounts, claimedCounts) };
  }).sort((first, second) => second.drawChance - first.drawChance || second.knownLeft - first.knownLeft), [suggestions, concealedCounts, riverCounts, claimedCounts]);
  const drawChance = pureSuitDrawChance(winningTiles, concealedCounts, riverCounts, claimedCounts);
  const concealedTileCount = allHandTiles.length;
  const waiting = concealedTileCount === waitSize;
  const discarding = concealedTileCount === discardSize;
  const tilesToWait = waitSize - concealedTileCount;
  const handPlan = useMemo(() => getPureSuitHandPlan(concealedCounts), [concealedCounts]);
  const statusMessage = discarding
    ? rankedSuggestions.length
      ? `You hold ${discardSize} concealed tiles — compare the discards below and cut the one with the best draw chance.`
      : `You hold ${discardSize} concealed tiles, but no discard creates an immediate wait. Try adjusting your hand.`
    : waiting
      ? winningTiles.length
        ? `听牌! You are waiting on ${winningTiles.length} tile${winningTiles.length === 1 ? "" : "s"} — see them below.`
        : `This ${waitSize}-tile shape is not waiting on a standard 清一色 hand. Try adjusting a tile.`
      : handPlan.claimHints.length > 0
        ? `Need ${tilesToWait} more tile${tilesToWait === 1 ? "" : "s"} in hand. Worth calling: ${handPlan.claimHints.slice(0, 3).map((hint) => `${hint.type === "pong" ? "Pong" : "Chi"} ${tileName(hint.tile, suit)}`).join(" · ")}.`
        : `Tap ${tilesToWait} more suit tile${tilesToWait === 1 ? "" : "s"} into your hidden hand to reveal your waits.`;

  function tileKnownCount(tile: number): number {
    return concealedCounts[tile - 1] + claimedCounts[tile - 1] + riverCounts[tile - 1];
  }

  function canAddLooseTile(tile: number): boolean {
    return tileKnownCount(tile) < 4 && looseTiles.length < hiddenCapacity;
  }

  function addLooseTile(tile: number) {
    if (canAddLooseTile(tile)) {
      setLooseTiles((current) => autoSort ? sortedTiles([...current, tile]) : [...current, tile]);
    }
  }

  function addRiverTile(tile: number) {
    if (tileKnownCount(tile) < 4) setRiverTiles((current) => [...current, tile]);
  }

  function removeLooseTile(tile: number) {
    setLooseTiles((current) => {
      const index = current.lastIndexOf(tile);
      return index < 0 ? current : current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function removeRiverTile(tile: number) {
    setRiverTiles((current) => {
      const index = current.lastIndexOf(tile);
      return index < 0 ? current : current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function discardTile(tile: number) {
    if (!looseTiles.includes(tile)) return;
    removeLooseTile(tile);
    setRiverTiles((current) => [...current, tile]);
  }

  /** Explains why a set cannot be added right now, or null when it can. */
  function claimDisabledReason(kind: HandSet["kind"], start: number): string | null {
    if (claimedSetCount >= 4) return "All 4 sets are already completed.";
    if (looseTiles.length > 14 - (claimedSetCount + 1) * 3) return "Remove hidden-hand tiles first — each claimed set locks 3 slots.";
    const tiles = kind === "chi" ? [start, start + 1, start + 2] : [start];
    if (tiles.some((tile) => tileKnownCount(tile) >= 4)) return "All 4 copies are already accounted for.";
    return null;
  }

  function addHandSet(kind: HandSet["kind"], start: number, source: SetSource, claimedTile?: number) {
    if (claimedSetCount >= 4) return;
    const tiles = kind === "chi" ? [start, start + 1, start + 2] : Array.from({ length: kind === "pong" ? 3 : 4 }, () => start);
    if (tiles.some((tile) => tileKnownCount(tile) >= 4)) return;
    const nextCount = claimedSetCount + 1;
    if (looseTiles.length > 14 - nextCount * 3) return;
    setHandSets((current) => [...current, { id: crypto.randomUUID(), tiles, kind, source, claimedTile }]);
  }

  function upgradePongToGang(setId: string) {
    setHandSets((current) => current.map((set) => {
      if (set.id !== setId || set.kind !== "pong") return set;
      const fourthTile = set.tiles[0];
      if (tileKnownCount(fourthTile) >= 4) return set;
      return { ...set, kind: "gang", source: "upgraded", tiles: [...set.tiles, fourthTile] };
    }));
  }

  function removeHandSet(setId: string) {
    setHandSets((current) => current.filter((set) => set.id !== setId));
  }

  function reset() {
    setHandSets([]);
    setLooseTiles([]);
    setRiverTiles([]);
  }

  return (
    <main className="fan-payout-shell pure-suit-shell">
      <header className="topbar"><Brand /><div className="topbar-actions"><UtilityMenu /><HelpDialog eyebrow="HOW TO PLAY" title="清一色听牌"><p>Use the + and − controls under each tile to record copies in your hand or the discard river. The “used” count prevents recording more than four copies.</p><p>「Ways to complete your hand」會即時拆解手牌的最佳組合，並列出別家打出哪些牌時值得碰或吃。</p><p>When you have 14 tiles, choose “Discard to river” on a recommendation to update both your hand and river in one step.</p></HelpDialog></div></header>
      <section className="hero" aria-labelledby="page-title"><p className="eyebrow">MAHJONG · PURE SUIT</p><h1 id="page-title">清一色听牌</h1></section>
      <section className="fan-payout-panel pure-suit-panel" aria-label="Pure Suit Mahjong hand assistant">
        <div className="pure-suit-controls"><label className="field"><span>Suit</span><select value={suit} onChange={(event) => setSuit(event.target.value as Suit)}><option value="萬">萬 Characters</option><option value="筒">筒 Circles</option><option value="索">索 Bamboos</option></select></label><button className="pure-suit-reset" type="button" onClick={reset}>Reset</button></div>
        <div className="pure-suit-summary"><div><small>Claimed sets</small><strong>{claimedSetCount} / 4</strong></div><div><small>Concealed tiles</small><strong>{concealedTileCount} / {hiddenCapacity}</strong></div><div><small>Waits at</small><strong>{waitSize}</strong></div><div><small>Discard at</small><strong>{discardSize}</strong></div></div>
        <p className="pure-suit-status" role="status">{statusMessage}</p>

        <section className="pure-suit-section">
          <div className="range-header"><span>Step 1 · Select tiles</span><label className="pure-suit-sort-toggle"><input type="checkbox" checked={autoSort} onChange={() => { setAutoSort((current) => { if (!current) setLooseTiles((tiles) => sortedTiles(tiles)); return !current; }); }} /><span>Auto-sort hand</span></label></div>
          <p className="pure-suit-help">For each tile, record how many copies are in your hand and how many you can see in the discard river.</p>
          <div className="pure-suit-tile-selector">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((tile) => <div className="pure-suit-tile-select" key={tile}>
              <img src={mahjongTileImage(tileName(tile, suit))} alt={tileName(tile, suit)} />
              <div className="pure-suit-tile-stepper">
                <span>Hand</span>
                <div><button type="button" aria-label={`Remove one ${tileName(tile, suit)} from hand`} disabled={looseCounts[tile - 1] === 0} onClick={() => removeLooseTile(tile)}>−</button><strong>{looseCounts[tile - 1]}</strong><button type="button" aria-label={`Add one ${tileName(tile, suit)} to hand`} disabled={!canAddLooseTile(tile)} onClick={() => addLooseTile(tile)}>+</button></div>
              </div>
              <div className="pure-suit-tile-stepper is-river">
                <span>River</span>
                <div><button type="button" aria-label={`Remove one ${tileName(tile, suit)} from river`} disabled={riverCounts[tile - 1] === 0} onClick={() => removeRiverTile(tile)}>−</button><strong>{riverCounts[tile - 1]}</strong><button type="button" aria-label={`Add one ${tileName(tile, suit)} to river`} disabled={tileKnownCount(tile) >= 4} onClick={() => addRiverTile(tile)}>+</button></div>
              </div>
              <small>{tileKnownCount(tile)} / 4 used</small>
            </div>)}
          </div>
          <div className="pure-suit-subhead"><strong>Your hidden hand</strong><span>Tap any selected tile to remove it</span></div>
          <div className="pure-suit-hidden-rack">
            {Array.from({ length: 14 }, (_, index) => looseTiles[index] ? <button className={`pure-suit-rack-tile${index === looseTiles.length - 1 ? " is-drawn-tile" : ""}`} type="button" key={index} aria-label={`Remove ${tileName(looseTiles[index], suit)} from hidden hand`} onClick={() => setLooseTiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><img src={mahjongTileImage(tileName(looseTiles[index], suit))} alt="" /><span aria-hidden="true">×</span></button> : <span className={`pure-suit-rack-slot${index >= hiddenCapacity ? " is-disabled-slot" : ""}`} key={index} />)}
          </div>
          <p className="pure-suit-help">The red outline marks your latest draw. Claimed sets lock three hidden-hand slots each.</p>
          <div className="pure-suit-set-list">
            {handSets.map((set) => <div className="pure-suit-hand-set" key={set.id}><div className="pure-suit-set-heading"><strong>{set.kind} · {sourceLabel(set.source)}</strong><button type="button" onClick={() => removeHandSet(set.id)}>Clear</button></div><div className="pure-suit-set-tiles">{set.tiles.map((tile, index) => <img className={set.claimedTile !== undefined && tile === set.claimedTile && index === set.tiles.indexOf(tile) ? "is-claimed" : ""} key={`${tile}-${index}`} src={mahjongTileImage(tileName(tile, suit))} alt="" />)}</div><p>{setHint(set)}</p>{set.kind === "pong" && set.source === "claimed" && <button className="pure-suit-upgrade" type="button" onClick={() => upgradePongToGang(set.id)}>Self-draw → Gang</button>}</div>)}
          </div>
          <div className="pure-suit-subhead"><strong>Discard river</strong><span>{riverTiles.length} tiles recorded</span></div>
          <div className="pure-suit-river-rack">{riverTiles.map((tile, index) => <button className="pure-suit-rack-tile" type="button" key={`${tile}-${index}`} aria-label={`Remove ${tileName(tile, suit)} from river`} onClick={() => setRiverTiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><img src={mahjongTileImage(tileName(tile, suit))} alt="" /><span aria-hidden="true">×</span></button>)}{riverTiles.length === 0 && <span className="pure-suit-river-placeholder">No river tiles recorded yet. Use the River + controls above.</span>}</div>
        </section>

        <section className="pure-suit-section">
          <div className="range-header"><span>Step 2 · Claim / concealed set</span><strong>{claimedSetCount} / 4 sets</strong></div>
          <p className="pure-suit-help">Chi and Pong can be claimed from another player. Gang can be upgraded from a claimed Pong after self-draw, or formed entirely by self-draw as a hidden Gang. Greyed-out buttons cannot be formed right now — hover to see why.</p>
          <div className="pure-suit-target-toggle pure-suit-claim-tabs" role="tablist" aria-label="Set type">
            {(["chi", "pong", "gang"] as const).map((kind) => <button className={claimTab === kind ? "is-active" : ""} key={kind} role="tab" aria-selected={claimTab === kind} type="button" onClick={() => setClaimTab(kind)}>{kind === "chi" ? "Chi · from player" : kind === "pong" ? "Pong · from player" : "Gang · hidden"}</button>)}
          </div>
          <div className="pure-suit-claim-grid">
            {claimTab === "chi" && Array.from({ length: 7 }, (_, index) => index + 1).flatMap((start) => { const reason = claimDisabledReason("chi", start); return [start, start + 1, start + 2].map((claimedTile) => <button className="pure-suit-claim" type="button" key={`chi-${start}-${claimedTile}`} disabled={reason !== null} title={reason ?? undefined} aria-label={`Claim Chi ${tileName(start, suit)} ${tileName(start + 1, suit)} ${tileName(start + 2, suit)} with ${tileName(claimedTile, suit)} from another player`} onClick={() => addHandSet("chi", start, "claimed", claimedTile)}><span className="pure-suit-claim-meld"><span className="pure-suit-claim-row"><img src={mahjongTileImage(tileName(claimedTile, suit))} alt="" /></span><span className="pure-suit-claim-row">{[start, start + 1, start + 2].filter((tile) => tile !== claimedTile).map((tile) => <img key={tile} src={mahjongTileImage(tileName(tile, suit))} alt="" />)}</span></span><small>Chi</small></button>); })}
            {claimTab === "pong" && Array.from({ length: 9 }, (_, index) => index + 1).map((tile) => { const reason = claimDisabledReason("pong", tile); return <button className="pure-suit-claim" type="button" key={`pong-${tile}`} disabled={reason !== null} title={reason ?? undefined} aria-label={`Claim Pong ${tileName(tile, suit)} from another player`} onClick={() => addHandSet("pong", tile, "claimed", tile)}><span className="pure-suit-claim-meld"><span className="pure-suit-claim-row"><img src={mahjongTileImage(tileName(tile, suit))} alt="" /></span><span className="pure-suit-claim-row">{Array.from({ length: 2 }, (_, copy) => <img key={`${tile}-${copy}`} src={mahjongTileImage(tileName(tile, suit))} alt="" />)}</span></span><small>Pong</small></button>; })}
            {claimTab === "gang" && Array.from({ length: 9 }, (_, index) => index + 1).map((tile) => { const reason = claimDisabledReason("gang", tile); return <button className="pure-suit-claim" type="button" key={`gang-${tile}`} disabled={reason !== null} title={reason ?? undefined} aria-label={`Record hidden Gang ${tileName(tile, suit)}`} onClick={() => addHandSet("gang", tile, "concealed")}><span className="pure-suit-claim-meld"><span className="pure-suit-claim-row">{Array.from({ length: 4 }, (_, copy) => <img key={`${tile}-${copy}`} src={mahjongTileImage(tileName(tile, suit))} alt="" />)}</span></span><small>Gang</small></button>; })}
          </div>
        </section>

        <section className="pure-suit-section pure-suit-plan">
          <div className="range-header"><span>Ways to complete your hand</span><strong>{handPlan.claimHints.length} calls</strong></div>
          {concealedTileCount === 0
            ? <p className="pure-suit-empty">Add concealed tiles to see the best way to group them and which discards are worth calling.</p>
            : <>
              {handPlan.groups.length > 0 && <div className="pure-suit-plan-groups" aria-label="Best grouping of your concealed tiles">{handPlan.groups.map((group, index) => <div className={`pure-suit-plan-group${group.length === 2 ? " is-pair" : ""}`} key={index}>{group.map((tile, tileIndex) => <img key={`${tile}-${tileIndex}`} src={mahjongTileImage(tileName(tile, suit))} alt={tileName(tile, suit)} />)}<small>{group.length === 2 ? "Pair" : group[0] === group[1] ? "Pong" : "Chi"}</small></div>)}{handPlan.leftovers.length > 0 && <div className="pure-suit-plan-group is-loose">{handPlan.leftovers.map((tile, index) => <img key={`${tile}-${index}`} src={mahjongTileImage(tileName(tile, suit))} alt={tileName(tile, suit)} />)}<small>Loose</small></div>}</div>}
              {handPlan.claimHints.length > 0
                ? <div className="pure-suit-claim-hints">{handPlan.claimHints.map((hint) => <div className="pure-suit-claim-hint" key={`${hint.type}-${hint.tile}-${hint.completes.join("-")}`}><span className={`pure-suit-call-badge is-${hint.type}`}>{hint.type === "pong" ? "Pong" : "Chi"}</span><img src={mahjongTileImage(tileName(hint.tile, suit))} alt={tileName(hint.tile, suit)} /><span className="pure-suit-claim-hint-text">completes {hint.completes.map((tile) => tileName(tile, suit)).join(" + ")}</span></div>)}</div>
                : <p className="pure-suit-empty">No discard completes a set with your loose tiles right now.</p>}
            </>}
        </section>

        <section className="pure-suit-section pure-suit-waits"><div className="range-header"><span>Winning tiles</span><strong>{winningTiles.length} waits</strong></div>{waiting ? winningTiles.length ? <><div className="pure-suit-wait-list">{winningTiles.map((tile) => <div key={tile}><img src={mahjongTileImage(tileName(tile, suit))} alt={tileName(tile, suit)} /><strong>{knownRemainingCopies(tile, concealedCounts, riverCounts, claimedCounts)} left</strong></div>)}</div><p className="pure-suit-odds">Known-suit draw chance: <strong>{(drawChance * 100).toFixed(1)}%</strong></p></> : <p className="pure-suit-empty">This hand is not waiting on a standard 清一色 hand.</p> : <p className="pure-suit-empty">{`Enter ${waitSize} concealed tiles to see waits.`}</p>}</section>

        <section className="pure-suit-section"><div className="range-header"><span>Best discard choices</span><strong>{rankedSuggestions.length} options</strong></div>{discarding ? rankedSuggestions.length ? <div className="pure-suit-suggestions">{rankedSuggestions.map((suggestion, index) => <div className={`pure-suit-suggestion${index === 0 ? " is-best" : ""}`} key={suggestion.discard}><div><small>{index === 0 ? "Best discard" : "Discard"}</small><img src={mahjongTileImage(tileName(suggestion.discard, suit))} alt={tileName(suggestion.discard, suit)} /></div><div><small>Then wait on</small><div className="pure-suit-suggestion-waits">{suggestion.winningTiles.map((tile) => <img key={tile} src={mahjongTileImage(tileName(tile, suit))} alt={tileName(tile, suit)} />)}</div></div><strong>{suggestion.knownLeft} known left<br />{(suggestion.drawChance * 100).toFixed(1)}%</strong><button className="pure-suit-discard-action" type="button" disabled={!looseTiles.includes(suggestion.discard)} onClick={() => discardTile(suggestion.discard)}>Discard to river</button></div>)}</div> : <p className="pure-suit-empty">No discard creates an immediate wait.</p> : <p className="pure-suit-empty">{`Enter ${discardSize} concealed tiles to compare discards.`}</p>}</section>
      </section><Footer />
    </main>
  );
}
