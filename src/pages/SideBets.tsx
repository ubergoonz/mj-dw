import { useMemo, useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import {
  SIDE_BET_TYPES,
  getSideBetRows,
} from "../lib/sideBets";

const formatMoney = (value: number): string => {
  const rounded = Number(value.toFixed(2));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

const baseOptions = [0.5, 1, 2, 3, 4, 5, 10, 20, 30, 40, 50];

export default function SideBets() {
  const [baseMin, setBaseMin] = useState(1);
  const baseMax = baseMin * 2;

  const rows = useMemo(() => getSideBetRows({ baseMin, baseMax }), [baseMin, baseMax]);

  return (
    <main className="fan-payout-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="花砲計算">
            <p>選擇底注最小值，最大值自動為最小值的兩倍。</p>
            <p>正咬（正動物 / 正花）與槓：正暗按最大值計，正明按最小值計。</p>
            <p>明槓另設出銃欄，顯示放槓者一人包付的金額，供對照參考。</p>
            <p>每一項由 Player A、Player B、Player C 各付相同金額給贏家。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · SIDE BETS</p>
        <h1 id="page-title">花砲計算</h1>
      </section>

      <section className="fan-payout-panel" aria-label="Side bet calculator">
        <div className="fan-payout-form">
          <div className="range-field">
            <div className="range-header">
              <span>Base range</span>
              <strong>
                {formatMoney(baseMin)}–{formatMoney(baseMax)}
              </strong>
            </div>

            <label className="field">
              <span>Base min (max is double)</span>
              <select value={baseMin} onChange={(event) => setBaseMin(Number(event.target.value))}>
                {baseOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatMoney(option)} / {formatMoney(option * 2)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {SIDE_BET_TYPES.map((type) => (
            <div className="range-field" key={type.id}>
              <div className="range-header">
                <span>{type.label}</span>
                <strong>{type.note}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="fan-summary" aria-live="polite">
          <div>
            <small>Min</small>
            <strong>{formatMoney(baseMin)}</strong>
          </div>
          <div>
            <small>Max</small>
            <strong>{formatMoney(baseMax)}</strong>
          </div>
          <div>
            <small>正暗</small>
            <strong>{formatMoney(baseMax)}</strong>
          </div>
          <div>
            <small>正明</small>
            <strong>{formatMoney(baseMin)}</strong>
          </div>
        </div>

        <div className="fan-table-wrap">
          <table className="fan-table">
            <thead>
              <tr>
                <th>Side bet</th>
                <th>Player A</th>
                <th>Player B</th>
                <th>Player C</th>
                <th>Shooter (包)</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="fan-row-active">
                  <td>
                    {row.typeLabel} · {row.stateLabel}
                  </td>
                  <td>{formatMoney(row.perPlayer)}</td>
                  <td>{formatMoney(row.perPlayer)}</td>
                  <td>{formatMoney(row.perPlayer)}</td>
                  <td>{row.hasShooter ? formatMoney(row.shooterPays) : "—"}</td>
                  <td>{formatMoney(row.winnerTakes)}</td>
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
