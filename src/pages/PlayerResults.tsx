import { useMemo, useState } from "react";
import Brand from "../components/Brand";
import CopyActions from "../components/CopyActions";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import VersionBadge from "../components/VersionBadge";
import { SEAT_ORDER, type Seat } from "../lib/inGameDiceRoll";
import {
  calculateNet,
  createInitialSlots,
  createResultEntry,
  formatChips,
  formatPlayerResultsForChat,
  formatSignedChips,
  replaceSeatPlayer,
  type PlayerResultEntry,
  type PlayerSessionSlot,
} from "../lib/playerResults";
import { is } from "../lib/storage";
import { usePersistentState } from "../lib/usePersistentState";

const parseChips = (value: string): number => Math.max(0, Number(value) || 0);
const splitBaseChips = (value: string): number => parseChips(value) / SEAT_ORDER.length;

interface PersistedSession {
  defaultBaseInput: string;
  slots: PlayerSessionSlot[];
  leftInputs: Record<Seat, string>;
  nextPlayerInputs: Record<Seat, string>;
  entries: PlayerResultEntry[];
  startedAt: number | null;
}

const SESSION_KEY = "player-results:v1";

const isSeat = is.oneOf(SEAT_ORDER);
const isSeatTextMap = (value: unknown): value is Record<Seat, string> =>
  is.record(value) && SEAT_ORDER.every((seat) => is.string(value[seat]));
const isSlot = (value: unknown): value is PlayerSessionSlot =>
  is.record(value) && isSeat(value.seat) && is.string(value.playerName) && is.number(value.baseChips);
const isEntry = (value: unknown): value is PlayerResultEntry =>
  is.record(value) &&
  is.string(value.id) &&
  isSeat(value.seat) &&
  is.string(value.playerName) &&
  is.number(value.baseChips) &&
  is.number(value.leftChips) &&
  is.number(value.net) &&
  is.oneOf(["takeover", "end"] as const)(value.reason);
const isPersistedSession = (value: unknown): value is PersistedSession =>
  is.record(value) &&
  is.string(value.defaultBaseInput) &&
  is.arrayOf(isSlot)(value.slots) &&
  (value.slots as PlayerSessionSlot[]).length === SEAT_ORDER.length &&
  isSeatTextMap(value.leftInputs) &&
  isSeatTextMap(value.nextPlayerInputs) &&
  is.arrayOf(isEntry)(value.entries) &&
  (value.startedAt === null || is.number(value.startedAt));

function createSession(totalBase = "2000"): PersistedSession {
  const base = parseChips(totalBase);
  return {
    defaultBaseInput: totalBase,
    slots: createInitialSlots(base),
    leftInputs: createSeatTextMap(String(base / SEAT_ORDER.length)),
    nextPlayerInputs: createSeatTextMap(""),
    entries: [],
    startedAt: null,
  };
}

function formatStartedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlayerResults() {
  const [session, setSession] = usePersistentState<PersistedSession>(SESSION_KEY, () => createSession(), isPersistedSession);
  const { defaultBaseInput, slots, leftInputs, nextPlayerInputs, entries, startedAt } = session;
  const [lastRemoved, setLastRemoved] = useState<{ entry: PlayerResultEntry; index: number } | null>(null);

  function patch(updates: Partial<PersistedSession> | ((current: PersistedSession) => Partial<PersistedSession>)) {
    setSession((current) => ({
      ...current,
      ...(typeof updates === "function" ? updates(current) : updates),
      startedAt: current.startedAt ?? Date.now(),
    }));
  }

  const totalBaseChips = parseChips(defaultBaseInput);
  const baseTally = useMemo(
    () => slots.reduce((sum, slot) => sum + slot.baseChips, 0),
    [slots],
  );
  const leftChipsBySeat = useMemo(() => parseLeftInputs(leftInputs), [leftInputs]);
  const leftTally = useMemo(
    () => SEAT_ORDER.reduce((sum, seat) => sum + leftChipsBySeat[seat], 0),
    [leftChipsBySeat],
  );
  const baseTallyDifference = baseTally - totalBaseChips;
  const leftTallyDifference = leftTally - totalBaseChips;
  const isBaseTallyInvalid = Math.abs(baseTallyDifference) > 0.001;
  const isLeftTallyInvalid = Math.abs(leftTallyDifference) > 0.001;
  const isTallyInvalid = isBaseTallyInvalid || isLeftTallyInvalid;
  const chatText = useMemo(() => formatPlayerResultsForChat(entries), [entries]);
  const hasUnsavedWork = entries.length > 0 || slots.some((slot) => slot.playerName.trim() !== "");

  function updateSlot(seat: Seat, updates: Partial<PlayerSessionSlot>) {
    patch((current) => ({
      slots: current.slots.map((slot) => (slot.seat === seat ? { ...slot, ...updates } : slot)),
    }));
  }

  function updateLeftInput(seat: Seat, value: string) {
    patch((current) => ({ leftInputs: { ...current.leftInputs, [seat]: value } }));
  }

  function updateNextPlayerInput(seat: Seat, value: string) {
    patch((current) => ({ nextPlayerInputs: { ...current.nextPlayerInputs, [seat]: value } }));
  }

  function resetSession() {
    if (hasUnsavedWork && !window.confirm("Reset session? 所有座位、名字與已記錄的結果都會清除。")) return;
    setSession(createSession(defaultBaseInput));
    setLastRemoved(null);
  }

  function recordSeat(seat: Seat, reason: "takeover" | "end") {
    const slot = slots.find((candidate) => candidate.seat === seat);
    if (!slot) return;

    if (isLeftTallyInvalid && !window.confirm("剩餘籌碼總和與總起始籌碼不符。仍要記錄嗎？")) return;

    const leftChips = leftChipsBySeat[seat];
    const nextPlayerName = nextPlayerInputs[seat].trim();
    const entry = createResultEntry({
      id: `${Date.now()}-${seat}-${entries.length}`,
      slot,
      leftChips,
      reason,
      nextPlayerName: reason === "takeover" ? nextPlayerName : undefined,
    });

    patch((current) => {
      const next: Partial<PersistedSession> = { entries: [...current.entries, entry] };
      if (reason === "takeover") {
        next.slots = current.slots.map((candidate) =>
          candidate.seat === seat ? replaceSeatPlayer(candidate, nextPlayerName, leftChips) : candidate,
        );
        next.leftInputs = { ...current.leftInputs, [seat]: String(leftChips) };
        next.nextPlayerInputs = { ...current.nextPlayerInputs, [seat]: "" };
      }
      return next;
    });
    setLastRemoved(null);
  }

  function recordAllEnd() {
    if (!window.confirm("全完場：為四家各記錄一筆完場結果？")) return;
    if (isLeftTallyInvalid && !window.confirm("剩餘籌碼總和與總起始籌碼不符。仍要記錄嗎？")) return;

    const timestamp = Date.now();
    const endEntries = SEAT_ORDER.map((seat, index) => {
      const slot = slots.find((candidate) => candidate.seat === seat)!;

      return createResultEntry({
        id: `${timestamp}-${seat}-${entries.length + index}`,
        slot,
        leftChips: leftChipsBySeat[seat],
        reason: "end",
      });
    });

    patch((current) => ({ entries: [...current.entries, ...endEntries] }));
    setLastRemoved(null);
  }

  function removeEntry(id: string) {
    const index = entries.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    setLastRemoved({ entry: entries[index], index });
    patch((current) => ({ entries: current.entries.filter((entry) => entry.id !== id) }));
  }

  function undoRemove() {
    if (!lastRemoved) return;
    const { entry, index } = lastRemoved;
    patch((current) => {
      const next = [...current.entries];
      next.splice(Math.min(index, next.length), 0, entry);
      return { entries: next };
    });
    setLastRemoved(null);
  }

  return (
    <main className="fan-payout-shell result-recorder-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <VersionBadge />
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="成績記錄">
            <p>開局先輸入總起始籌碼，系統會平均分給東、南、西、北四家作為 base。</p>
            <p>四家的 base 與剩餘籌碼都可手動輸入；若總和不等於總起始籌碼，座位卡會以紅框提醒。</p>
            <p>中途有人離場時，輸入剩餘籌碼並按「接手」，系統記錄離場者輸贏，接手者用該剩餘籌碼作為新 base。</p>
            <p>完場時輸入各家剩餘籌碼並按「完場」，下方文字可直接複製貼到聊天。</p>
            <p>所有輸入會自動保存在此裝置上，鎖屏或重新整理都不會遺失；按「Reset session」才會清除。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · RESULTS</p>
        <h1 id="page-title">秋後算績</h1>
      </section>

      <section className="fan-payout-panel" aria-label="Player result recorder">
        <div className="fan-payout-form">
          {startedAt !== null && (
            <p className="session-banner" role="status">
              <span aria-hidden="true">💾</span> Session auto-saved on this device · started {formatStartedAt(startedAt)}
            </p>
          )}

          <div className="range-field">
            <div className="range-header">
              <span>Start of session</span>
              <strong>4 seats</strong>
            </div>
            <div className="range-input-row">
              <label className="field compact-field">
                <span>Total base chip</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={defaultBaseInput}
                  onChange={(event) => patch({ defaultBaseInput: event.target.value })}
                />
              </label>
              <div className="result-session-actions">
                <button className="utility-action utility-action-compact" type="button" onClick={resetSession}>
                  Reset session
                </button>
                <button className="utility-action utility-action-compact" type="button" onClick={recordAllEnd}>
                  全完場
                </button>
              </div>
            </div>
          </div>

          <div className="result-seat-row" aria-label="Player seats">
            {SEAT_ORDER.map((seat) => {
              const slot = slots.find((candidate) => candidate.seat === seat)!;
              const leftChips = leftChipsBySeat[seat];
              const net = calculateNet(slot.baseChips, leftChips);
              const isBaseChipMismatched = isBaseTallyInvalid && slot.baseChips !== splitBaseChips(defaultBaseInput);
              const isLeftChipMismatched = isLeftTallyInvalid && leftChips !== slot.baseChips;

              return (
                <section className={`result-seat${isTallyInvalid ? " result-seat-tally-invalid" : ""}`} key={seat}>
                  <div className="result-seat-heading">
                    <strong>{seat}</strong>
                    <span className={resultToneClass(net)}>{formatSignedChips(net)}</span>
                  </div>

                  <label className="field">
                    <span>Player</span>
                    <input
                      value={slot.playerName}
                      onChange={(event) => updateSlot(seat, { playerName: event.target.value })}
                      placeholder={`${seat} player`}
                    />
                  </label>

                  <label className="field">
                    <span>Base chip</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="decimal"
                      value={slot.baseChips}
                      onChange={(event) => updateSlot(seat, { baseChips: parseChips(event.target.value) })}
                      className={isBaseChipMismatched ? "result-input-invalid" : undefined}
                    />
                  </label>

                  <label className="field">
                    <span>Left chip</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="decimal"
                      value={leftInputs[seat]}
                      onChange={(event) => updateLeftInput(seat, event.target.value)}
                      className={isLeftChipMismatched ? "result-input-invalid" : undefined}
                    />
                  </label>

                  <div className="result-seat-net" aria-live="polite">
                    <small>Win / Loss</small>
                    <strong className={resultToneClass(net)}>{formatSignedChips(net)}</strong>
                    <span>
                      left {formatChips(leftChips)} - base {formatChips(slot.baseChips)}
                    </span>
                  </div>

                  <label className="field">
                    <span>Next player</span>
                    <input
                      value={nextPlayerInputs[seat]}
                      onChange={(event) => updateNextPlayerInput(seat, event.target.value)}
                      placeholder="takeover name"
                    />
                  </label>

                  <div className="result-seat-actions">
                    <button type="button" onClick={() => recordSeat(seat, "takeover")}>
                      接手
                    </button>
                    <button type="button" onClick={() => recordSeat(seat, "end")}>
                      完場
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="fan-summary" aria-live="polite">
          <div>
            <small>Records</small>
            <strong>{entries.length}</strong>
          </div>
          <div>
            <small>Base tally</small>
            <strong className={isBaseTallyInvalid ? "result-loss" : undefined}>{formatChips(baseTally)} / {formatChips(totalBaseChips)}</strong>
          </div>
          <div>
            <small>Left tally</small>
            <strong className={isLeftTallyInvalid ? "result-loss" : undefined}>{formatChips(leftTally)} / {formatChips(totalBaseChips)}</strong>
          </div>
          <div>
            <small>Difference</small>
            <strong className={resultToneClass(leftTallyDifference)}>{formatSignedChips(leftTallyDifference)}</strong>
          </div>
        </div>

        <div className="fan-table-wrap">
          <table className="fan-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Base</th>
                <th>Left</th>
                <th>Win/Loss</th>
                <th>Type</th>
                <th>
                  <span className="visually-hidden">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td className="fan-table-empty" colSpan={6}>
                    尚未記錄結果 · Records appear here after 接手 / 完場.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr className="fan-row-active" key={entry.id}>
                  <td>{entry.playerName}</td>
                  <td>{formatChips(entry.baseChips)}</td>
                  <td>{formatChips(entry.leftChips)}</td>
                  <td className={resultToneClass(entry.net)}>{formatSignedChips(entry.net)}</td>
                  <td>{entry.reason === "takeover" ? "離場" : "完場"}</td>
                  <td>
                    <button
                      className="row-remove"
                      type="button"
                      aria-label={`Remove ${entry.playerName} record`}
                      title="Remove record"
                      onClick={() => removeEntry(entry.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lastRemoved && (
          <p className="undo-bar" role="status">
            <span>Removed {lastRemoved.entry.playerName} ({formatSignedChips(lastRemoved.entry.net)}).</span>
            <button type="button" className="link-button" onClick={undoRemove}>
              Undo
            </button>
          </p>
        )}

        <div className="copy-panel">
          <div className="range-header">
            <span>Copy for chat</span>
          </div>
          <textarea readOnly value={chatText} aria-label="Copyable result text" />
          <CopyActions text={chatText} shareTitle="麻將成績" disabled={entries.length === 0} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function createSeatTextMap(value: string): Record<Seat, string> {
  return Object.fromEntries(SEAT_ORDER.map((seat) => [seat, value])) as Record<Seat, string>;
}

function parseLeftInputs(leftInputs: Record<Seat, string>): Record<Seat, number> {
  return Object.fromEntries(SEAT_ORDER.map((seat) => [seat, parseChips(leftInputs[seat])])) as Record<Seat, number>;
}

function resultToneClass(value: number): string | undefined {
  if (value > 0) return "result-win";
  if (value < 0) return "result-loss";
  return undefined;
}
