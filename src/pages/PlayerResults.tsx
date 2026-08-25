import { useMemo, useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
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

const parseChips = (value: string): number => Math.max(0, Number(value) || 0);
const splitBaseChips = (value: string): number => parseChips(value) / SEAT_ORDER.length;

export default function PlayerResults() {
  const [defaultBaseInput, setDefaultBaseInput] = useState("2000");
  const [slots, setSlots] = useState<PlayerSessionSlot[]>(() => createInitialSlots(2000));
  const [leftInputs, setLeftInputs] = useState<Record<Seat, string>>(() => createSeatTextMap("500"));
  const [nextPlayerInputs, setNextPlayerInputs] = useState<Record<Seat, string>>(() => createSeatTextMap(""));
  const [entries, setEntries] = useState<PlayerResultEntry[]>([]);
  const [copyStatus, setCopyStatus] = useState("");

  const totalBaseChips = parseChips(defaultBaseInput);
  const leftChipsBySeat = useMemo(() => parseLeftInputs(leftInputs), [leftInputs]);
  const leftTally = useMemo(
    () => SEAT_ORDER.reduce((sum, seat) => sum + leftChipsBySeat[seat], 0),
    [leftChipsBySeat],
  );
  const tallyDifference = leftTally - totalBaseChips;
  const isTallyInvalid = Math.abs(tallyDifference) > 0.001;
  const chatText = useMemo(() => formatPlayerResultsForChat(entries), [entries]);

  function updateSlot(seat: Seat, updates: Partial<PlayerSessionSlot>) {
    setSlots((current) => current.map((slot) => (slot.seat === seat ? { ...slot, ...updates } : slot)));
  }

  function updateLeftInput(seat: Seat, value: string) {
    setLeftInputs((current) => ({ ...current, [seat]: value }));
  }

  function updateNextPlayerInput(seat: Seat, value: string) {
    setNextPlayerInputs((current) => ({ ...current, [seat]: value }));
  }

  function resetSession() {
    const base = parseChips(defaultBaseInput);
    const seatBase = splitBaseChips(defaultBaseInput);
    setSlots(createInitialSlots(base));
    setLeftInputs(createSeatTextMap(String(seatBase)));
    setNextPlayerInputs(createSeatTextMap(""));
    setEntries([]);
    setCopyStatus("");
  }

  function recordSeat(seat: Seat, reason: "takeover" | "end") {
    const slot = slots.find((candidate) => candidate.seat === seat);
    if (!slot) return;

    const leftChips = leftChipsBySeat[seat];
    const nextPlayerName = nextPlayerInputs[seat].trim();
    const entry = createResultEntry({
      id: `${Date.now()}-${seat}-${entries.length}`,
      slot,
      leftChips,
      reason,
      nextPlayerName: reason === "takeover" ? nextPlayerName : undefined,
    });

    setEntries((current) => [...current, entry]);

    if (reason === "takeover") {
      setSlots((current) =>
        current.map((candidate) =>
          candidate.seat === seat ? replaceSeatPlayer(candidate, nextPlayerName, leftChips) : candidate,
        ),
      );
      updateLeftInput(seat, String(leftChips));
      updateNextPlayerInput(seat, "");
    }
  }

  function recordAllEnd() {
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

    setEntries((current) => [...current, ...endEntries]);
  }

  async function copyResults() {
    await navigator.clipboard.writeText(chatText);
    setCopyStatus("Copied");
  }

  return (
    <main className="fan-payout-shell result-recorder-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="成績記錄">
            <p>開局先輸入總起始籌碼，系統會平均分給東、南、西、北四家作為 base。</p>
            <p>四家的剩餘籌碼都可手動輸入；若總和不等於總起始籌碼，座位卡會以紅框提醒。</p>
            <p>中途有人離場時，輸入剩餘籌碼並按「接手」，系統記錄離場者輸贏，接手者用該剩餘籌碼作為新 base。</p>
            <p>完場時輸入各家剩餘籌碼並按「完場」，下方文字可直接複製貼到聊天。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · RESULTS</p>
        <h1 id="page-title">秋後算績</h1>
      </section>

      <section className="fan-payout-panel" aria-label="Player result recorder">
        <div className="fan-payout-form">
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
                  value={defaultBaseInput}
                  onChange={(event) => setDefaultBaseInput(event.target.value)}
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
              const isLeftChipMismatched = isTallyInvalid && leftChips !== slot.baseChips;

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
                      value={slot.baseChips}
                      onChange={(event) => updateSlot(seat, { baseChips: parseChips(event.target.value) })}
                    />
                  </label>

                  <label className="field">
                    <span>Left chip</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
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
            <small>Tally</small>
            <strong>{formatChips(leftTally)} / {formatChips(totalBaseChips)}</strong>
          </div>
          <div>
            <small>Difference</small>
            <strong className={resultToneClass(tallyDifference)}>{formatSignedChips(tallyDifference)}</strong>
          </div>
          <div>
            <small>Each base</small>
            <strong>{formatChips(splitBaseChips(defaultBaseInput))}</strong>
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
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr className="fan-row-active" key={entry.id}>
                  <td>{entry.playerName}</td>
                  <td>{formatChips(entry.baseChips)}</td>
                  <td>{formatChips(entry.leftChips)}</td>
                  <td className={resultToneClass(entry.net)}>{formatSignedChips(entry.net)}</td>
                  <td>{entry.reason === "takeover" ? "離場" : "完場"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="copy-panel">
          <div className="range-header">
            <span>Copy for chat</span>
            <button className="utility-action" type="button" onClick={copyResults}>
              Copy
            </button>
          </div>
          <textarea readOnly value={chatText} aria-label="Copyable result text" />
          {copyStatus && <small>{copyStatus}</small>}
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
