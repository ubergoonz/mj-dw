import { useMemo, useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import {
  END_WALL_OPTIONS,
  EXPECTED_ROUNDS_OPTIONS,
  FAN_MAX_BOUND,
  FAN_MIN_BOUND,
  PING_HU_OPTIONS,
  SMOKING_OPTIONS,
  STAKE_OPTIONS,
  buildGoogleMapsUrl,
  calculateTotalHours,
  createInitialBeckonInviteForm,
  formatBeckonInviteForChat,
  isFanRangeValid,
  type BeckonInviteForm,
  type EndWallOption,
  type SmokingOption,
} from "../lib/beckonInvite";
import "../styles/beckonInvite.css";

const clampFan = (value: string): number =>
  Math.min(FAN_MAX_BOUND, Math.max(FAN_MIN_BOUND, Math.floor(Number(value) || 0)));

export default function BeckonInvite() {
  const [form, setForm] = useState<BeckonInviteForm>(createInitialBeckonInviteForm);
  const [copyStatus, setCopyStatus] = useState("");

  function update<K extends keyof BeckonInviteForm>(key: K, value: BeckonInviteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const totalHours = useMemo(
    () => calculateTotalHours(form.startDateTime, form.endDateTime),
    [form.startDateTime, form.endDateTime],
  );
  const mapsUrl = useMemo(() => buildGoogleMapsUrl(form.venueQuery), [form.venueQuery]);
  const isFanRangeInvalid = !isFanRangeValid(form.minFan, form.maxFan);
  const chatText = useMemo(() => formatBeckonInviteForChat(form), [form]);

  async function copyInvite() {
    await navigator.clipboard.writeText(chatText);
    setCopyStatus("Copied");
  }

  return (
    <main className="fan-payout-shell beckon-invite-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
          <HelpDialog eyebrow="HOW TO PLAY" title="招兵買馬">
            <p>組織者填寫場地、時間與遊戲規則，下方會自動生成一份可複製的邀請文字。</p>
            <p>場地會自動生成 Google Maps 搜尋連結；開始/結束時間會自動計算總時長。</p>
          </HelpDialog>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · BECKON INVITE</p>
        <h1 id="page-title">招兵買馬 - UNDER CONSTRUCTION</h1>
      </section>

      <section className="fan-payout-panel" aria-label="Beckon invite organizer form">
        <h2 className="form-section-title">Event info</h2>
        <div className="fan-payout-form">
          <label className="field">
            <span>Venue</span>
            <input
              value={form.venueQuery}
              onChange={(event) => update("venueQuery", event.target.value)}
              placeholder="Search a venue name or address"
            />
          </label>

          {mapsUrl && (
            <a className="beckon-maps-link" href={mapsUrl} target="_blank" rel="noreferrer">
              Open in Google Maps ↗
            </a>
          )}

          <div className="beckon-datetime-row">
            <label className="field compact-field">
              <span>Start</span>
              <input
                type="datetime-local"
                value={form.startDateTime}
                onChange={(event) => update("startDateTime", event.target.value)}
              />
            </label>

            <label className="field compact-field">
              <span>End</span>
              <input
                type="datetime-local"
                value={form.endDateTime}
                onChange={(event) => update("endDateTime", event.target.value)}
              />
            </label>
          </div>

          <div className="fan-summary">
            <div>
              <small>Total hours</small>
              <strong>{totalHours !== null ? `${totalHours}h` : "—"}</strong>
            </div>
          </div>

          <label className="field">
            <span>Expected number of rounds</span>
            <select
              value={form.expectedRounds}
              onChange={(event) => update("expectedRounds", Number(event.target.value))}
            >
              {EXPECTED_ROUNDS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="toggle-field" htmlFor="parking-available">
            <input
              id="parking-available"
              type="checkbox"
              checked={form.parkingAvailable}
              onChange={(event) => update("parkingAvailable", event.target.checked)}
            />
            <span>Parking available</span>
          </label>

          <label className="field">
            <span>Smoking</span>
            <select
              value={form.smoking}
              onChange={(event) => update("smoking", event.target.value as SmokingOption)}
            >
              {SMOKING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="form-section-title">Game rules</h2>
        <div className="fan-payout-form">
          <label className="field">
            <span>Stake size</span>
            <select value={form.stakeId} onChange={(event) => update("stakeId", event.target.value)}>
              {STAKE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="range-field">
            <div className={`range-header${isFanRangeInvalid ? " range-invalid" : ""}`}>
              <span>Fan range</span>
              <strong>
                {form.minFan}–{form.maxFan}
              </strong>
            </div>

            <div className="range-input-row">
              <label className={`field compact-field${isFanRangeInvalid ? " range-invalid" : ""}`}>
                <span>Minimum fan</span>
                <input
                  type="number"
                  min={FAN_MIN_BOUND}
                  max={FAN_MAX_BOUND}
                  step="1"
                  value={form.minFan}
                  onChange={(event) => update("minFan", clampFan(event.target.value))}
                />
              </label>

              <label className={`field compact-field${isFanRangeInvalid ? " range-invalid" : ""}`}>
                <span>Maximum fan</span>
                <input
                  type="number"
                  min={FAN_MIN_BOUND}
                  max={FAN_MAX_BOUND}
                  step="1"
                  value={form.maxFan}
                  onChange={(event) => update("maxFan", clampFan(event.target.value))}
                />
              </label>
            </div>

            {isFanRangeInvalid && (
              <p className="range-invalid" role="alert">
                Maximum fan must be greater than minimum fan.
              </p>
            )}
          </div>

          <label className="field">
            <span>鸡胡 (Ping Hu)</span>
            <select
              value={form.pingHu}
              onChange={(event) => update("pingHu", Number(event.target.value) as 3.5 | 4)}
            >
              {PING_HU_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="toggle-field" htmlFor="animal-bite">
            <input
              id="animal-bite"
              type="checkbox"
              checked={form.animalBite}
              onChange={(event) => update("animalBite", event.target.checked)}
            />
            <span>花獸咬 (Animal/Flower Bite)</span>
          </label>

          {form.animalBite && (
            <div className="beckon-subgroup">
              <p className="beckon-subgroup-label">Open bite</p>
              <label className="toggle-field" htmlFor="open-zheng">
                <input
                  id="open-zheng"
                  type="checkbox"
                  checked={form.openZheng}
                  onChange={(event) => update("openZheng", event.target.checked)}
                />
                <span>正</span>
              </label>
              <label className="toggle-field" htmlFor="open-chou">
                <input
                  id="open-chou"
                  type="checkbox"
                  checked={form.openChou}
                  onChange={(event) => update("openChou", event.target.checked)}
                />
                <span>臭</span>
              </label>

              <p className="beckon-subgroup-label">Close bite</p>
              <label className="toggle-field" htmlFor="close-zheng">
                <input
                  id="close-zheng"
                  type="checkbox"
                  checked={form.closeZheng}
                  onChange={(event) => update("closeZheng", event.target.checked)}
                />
                <span>正</span>
              </label>
              <label className="toggle-field" htmlFor="close-chou">
                <input
                  id="close-chou"
                  type="checkbox"
                  checked={form.closeChou}
                  onChange={(event) => update("closeChou", event.target.checked)}
                />
                <span>臭</span>
              </label>
            </div>
          )}

          <label className="toggle-field" htmlFor="seven-pair">
            <input
              id="seven-pair"
              type="checkbox"
              checked={form.sevenPair}
              onChange={(event) => update("sevenPair", event.target.checked)}
            />
            <span>7 Pair</span>
          </label>

          <label className="toggle-field" htmlFor="shooter">
            <input
              id="shooter"
              type="checkbox"
              checked={form.shooter}
              onChange={(event) => update("shooter", event.target.checked)}
            />
            <span>Shooter</span>
          </label>

          <label className="field">
            <span>End wall</span>
            <select
              value={form.endWall}
              onChange={(event) => update("endWall", event.target.value as EndWallOption)}
            >
              {END_WALL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="toggle-field" htmlFor="dice-bonus">
            <input
              id="dice-bonus"
              type="checkbox"
              checked={form.diceBonus}
              onChange={(event) => update("diceBonus", event.target.checked)}
            />
            <span>Dice Bonus</span>
          </label>

          {form.diceBonus && (
            <label className="field">
              <span>Bonus type</span>
              <input
                value={form.diceBonusType}
                onChange={(event) => update("diceBonusType", event.target.value)}
                placeholder="e.g. 花紅 双numbers"
              />
            </label>
          )}
        </div>

        <h2 className="form-section-title">Special hands</h2>
        <div className="fan-payout-form">
          <label className="toggle-field" htmlFor="da-san-yuan">
            <input
              id="da-san-yuan"
              type="checkbox"
              checked={form.daSanYuan}
              onChange={(event) => update("daSanYuan", event.target.checked)}
            />
            <span>大三元 · complete hand</span>
          </label>

          <label className="toggle-field" htmlFor="da-si-xi">
            <input
              id="da-si-xi"
              type="checkbox"
              checked={form.daSiXi}
              onChange={(event) => update("daSiXi", event.target.checked)}
            />
            <span>大四喜 · complete hand</span>
          </label>

          <label className="toggle-field" htmlFor="qi-dui-zi-hand">
            <input
              id="qi-dui-zi-hand"
              type="checkbox"
              checked={form.qiDuiZiHand}
              onChange={(event) => update("qiDuiZiHand", event.target.checked)}
            />
            <span>七对子 · complete hand</span>
          </label>

          <label className="toggle-field" htmlFor="hua-hu">
            <input
              id="hua-hu"
              type="checkbox"
              checked={form.huaHu}
              onChange={(event) => update("huaHu", event.target.checked)}
            />
            <span>花胡</span>
          </label>

          {form.huaHu && (
            <ul className="beckon-rule-notes">
              <li>自摸第 7 張可搶第 8 張，抓第 8 張者付 1 台出銃 + 2 台閒家</li>
              <li>自摸第 8 張，全體以出銃價支付</li>
            </ul>
          )}

          <label className="toggle-field" htmlFor="tian-di-hu">
            <input
              id="tian-di-hu"
              type="checkbox"
              checked={form.tianDiHu}
              onChange={(event) => update("tianDiHu", event.target.checked)}
            />
            <span>天地胡</span>
          </label>

          {form.tianDiHu && (
            <ul className="beckon-rule-notes">
              <li>僅限首圈</li>
              <li>天胡：限庄家，全體以出銃價支付</li>
              <li>地胡：自摸第 7 張可搶第 8 張，抓第 8 張者付 1 台出銃 + 2 台閒家</li>
            </ul>
          )}
        </div>

        <div className="copy-panel">
          <div className="range-header">
            <span>Copy invite for chat</span>
            <button className="utility-action" type="button" onClick={copyInvite}>
              Copy
            </button>
          </div>
          <textarea readOnly value={chatText} aria-label="Copyable invite text" rows={16} />
          {copyStatus && <small>{copyStatus}</small>}
        </div>
      </section>

      <Footer />
    </main>
  );
}
