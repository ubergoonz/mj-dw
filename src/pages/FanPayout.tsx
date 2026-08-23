import { useMemo, useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import { FAN_BASE_OPTIONS, FAN_TABLE_MAX, getFanPayoutRows } from "../lib/fanPayout";

const formatMoney = (value: number): string => {
  const rounded = Number(value.toFixed(2));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

export default function FanPayout() {
  const [base, setBase] = useState(1);
  const [minFan, setMinFan] = useState(1);
  const [maxFan, setMaxFan] = useState(5);
  const [selfDrawBonus, setSelfDrawBonus] = useState(false);
  const [selfDrawBonusInput, setSelfDrawBonusInput] = useState("1");

  const selfDrawBonusAmount = Math.max(0, Math.floor(Number(selfDrawBonusInput) || 0));

  const rows = useMemo(
    () =>
      getFanPayoutRows({
        base,
        minFan,
        maxFan,
        selfDrawBonus,
        selfDrawBonusAmount,
      }),
    [base, minFan, maxFan, selfDrawBonus, selfDrawBonusAmount],
  );

  return (
    <main className="fan-payout-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="台數計算">
            <p>底注是「閒家 / 出銃」一對數值，直接作為 0 台的基礎，例如 1 / 2。</p>
            <p>0 台出銃時，Player A 與 Player B 各付 1，出銃者付 2，贏家共收 4。</p>
            <p>自摸沒有出銃者，三家都當作出銃者各付 2，贏家收 6；有自摸花紅時每家再各付花紅。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · 台 PAYOUT</p>
        <h1 id="page-title">台數計算</h1>
      </section>

      <section className="fan-payout-panel" aria-label="台 payout calculator">
        <div className="fan-payout-form">
          <label className="field">
            <span>Base (player / shooter)</span>
            <select value={base} onChange={(event) => setBase(Number(event.target.value))}>
              {FAN_BASE_OPTIONS.map((option) => (
                <option key={option.player} value={option.player}>
                  {option.player} / {option.shooter}
                </option>
              ))}
            </select>
          </label>

          <div className="range-field">
            <div className="range-header">
              <span>台 </span>
              <strong>
                {minFan}–{maxFan}
              </strong>
            </div>

            <div className="range-input-row" aria-label="台 range inputs">
              <label className="field compact-field">
                <span>Min 台</span>
                <input
                  type="number"
                  min="0"
                  max={FAN_TABLE_MAX}
                  step="1"
                  value={minFan}
                  onChange={(event) => {
                    const nextMinFan = Math.max(0, Number(event.target.value) || 0);
                    setMinFan(Math.min(nextMinFan, maxFan));
                  }}
                />
              </label>

              <label className="field compact-field">
                <span>Max 台</span>
                <input
                  type="number"
                  min="0"
                  max={FAN_TABLE_MAX}
                  step="1"
                  value={maxFan}
                  onChange={(event) => {
                    const nextMaxFan = Math.min(
                      FAN_TABLE_MAX,
                      Math.max(0, Number(event.target.value) || 0),
                    );
                    setMaxFan(Math.max(nextMaxFan, minFan));
                  }}
                />
              </label>
            </div>
          </div>

          <label className="toggle-field" htmlFor="self-draw-bonus">
            <input
              id="self-draw-bonus"
              type="checkbox"
              checked={selfDrawBonus}
              onChange={(event) => setSelfDrawBonus(event.target.checked)}
            />
            <span>Include 自摸 bonus</span>
          </label>

          {selfDrawBonus && (
            <label className="field">
              <span>自摸 bonus amount (each player)</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={selfDrawBonusInput}
                onChange={(event) => setSelfDrawBonusInput(event.target.value.replace(/[^\d]/g, ""))}
                onBlur={() => setSelfDrawBonusInput(String(selfDrawBonusAmount))}
              />
            </label>
          )}
        </div>

        <div className="fan-summary" aria-live="polite">
          <div>
            <small>Base</small>
            <strong>
              {formatMoney(base)} / {formatMoney(base * 2)}
            </strong>
          </div>
          <div>
            <small>Min</small>
            <strong>{minFan}</strong>
          </div>
          <div>
            <small>Limit</small>
            <strong>{maxFan}</strong>
          </div>
          <div>
            <small>自摸 bonus</small>
            <strong>{selfDrawBonus ? formatMoney(selfDrawBonusAmount) : "Off"}</strong>
          </div>
        </div>

        <div className="fan-table-wrap">
          <table className="fan-table">
            <thead>
              <tr>
                <th>台</th>
                <th>Other Players</th>
                <th>Shooter</th>
                <th>Winner</th>
                <th>自摸 each</th>
                <th>自摸 winner</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.fan} className={row.inRange ? "fan-row-active" : undefined}>
                  <td>{row.label}</td>
                  <td>{formatMoney(row.playerPays)}</td>
                  <td>{formatMoney(row.shooterPays)}</td>
                  <td>{formatMoney(row.winnerTakes)}</td>
                  <td>{formatMoney(row.selfDrawEach)}</td>
                  <td>{formatMoney(row.selfDrawWinnerTakes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </main>
  );
}
