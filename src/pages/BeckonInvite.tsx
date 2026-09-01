import { useEffect, useMemo, useState } from "react";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import HelpDialog from "../components/HelpDialog";
import UtilityMenu from "../components/UtilityMenu";
import {
  DA_SAN_YUAN_OPTIONS,
  DA_SI_XI_OPTIONS,
  END_WALL_OPTIONS,
  EXPECTED_ROUNDS_OPTIONS,
  FAN_MAX_BOUND,
  FAN_MIN_BOUND,
  HOURS_PER_ROUND,
  MEN_QING_OPTIONS,
  PING_HU_OPTIONS,
  SMOKING_OPTIONS,
  STAKE_OPTIONS,
  TABLE_MODE_OPTIONS,
  addHoursToDateTimeLocal,
  buildGoogleMapsUrl,
  buildOsmEmbedUrl,
  calculateTotalHours,
  createInitialBeckonInviteForm,
  estimateRoundsFromHours,
  formatBeckonInviteForChat,
  formatBeckonInviteImagePrompt,
  geocodeVenue,
  isFanRangeValid,
  type BeckonInviteForm,
  type BigHandMode,
  type EndWallOption,
  type MenQingMode,
  type SmokingOption,
  type TableMode,
  type VenueGeocodeResult,
} from "../lib/beckonInvite";
import "../styles/beckonInvite.css";

const clampFan = (value: string): number =>
  Math.min(FAN_MAX_BOUND, Math.max(FAN_MIN_BOUND, Math.floor(Number(value) || 0)));

export default function BeckonInvite() {
  const [form, setForm] = useState<BeckonInviteForm>(createInitialBeckonInviteForm);
  const [copyStatus, setCopyStatus] = useState("");
  const [copyTab, setCopyTab] = useState<"chat" | "ai">("chat");
  const [venueResult, setVenueResult] = useState<VenueGeocodeResult | null>(null);
  const [venueLookupStatus, setVenueLookupStatus] = useState<"idle" | "loading" | "not-found">("idle");

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
  const imagePromptText = useMemo(() => formatBeckonInviteImagePrompt(form), [form]);

  useEffect(() => {
    const trimmed = form.venueQuery.trim();
    if (!trimmed) {
      setVenueResult(null);
      setVenueLookupStatus("idle");
      return;
    }

    const controller = new AbortController();
    setVenueLookupStatus("loading");
    const timer = setTimeout(() => {
      geocodeVenue(trimmed, controller.signal)
        .then((result) => {
          setVenueResult(result);
          setVenueLookupStatus(result ? "idle" : "not-found");
        })
        .catch(() => {
          if (!controller.signal.aborted) setVenueLookupStatus("not-found");
        });
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.venueQuery]);

  async function copyInvite() {
    await navigator.clipboard.writeText(copyTab === "chat" ? chatText : imagePromptText);
    setCopyStatus("Copied");
  }

  function handleStartChange(value: string) {
    setForm((current) => ({
      ...current,
      startDateTime: value,
      endDateTime: value ? addHoursToDateTimeLocal(value, current.expectedRounds * HOURS_PER_ROUND) : current.endDateTime,
    }));
  }

  function handleEndChange(value: string) {
    setForm((current) => {
      const hours = calculateTotalHours(current.startDateTime, value);
      return {
        ...current,
        endDateTime: value,
        expectedRounds: hours !== null ? estimateRoundsFromHours(hours) : current.expectedRounds,
      };
    });
  }

  function handleExpectedRoundsChange(value: number) {
    setForm((current) => ({
      ...current,
      expectedRounds: value,
      endDateTime: current.startDateTime
        ? addHoursToDateTimeLocal(current.startDateTime, value * HOURS_PER_ROUND)
        : current.endDateTime,
    }));
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
              placeholder="Search a venue name, address, or postal code"
            />
          </label>

          {venueLookupStatus === "loading" && <p className="beckon-venue-status">Searching venue…</p>}
          {venueLookupStatus === "not-found" && (
            <p className="beckon-venue-status">No matching location found.</p>
          )}

          {venueResult && (
            <div className="beckon-venue-preview">
              <iframe
                className="beckon-venue-map"
                title="Venue location preview"
                src={buildOsmEmbedUrl(venueResult.lat, venueResult.lon)}
                loading="lazy"
              />
              <p className="beckon-venue-description">{venueResult.displayName}</p>
              {mapsUrl && (
                <a className="beckon-maps-link" href={mapsUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps ↗
                </a>
              )}
            </div>
          )}

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
            <span>Parking situation</span>
            <input
              value={form.parkingSituation}
              onChange={(event) => update("parkingSituation", event.target.value)}
              placeholder="e.g. free street parking after 6pm"
            />
          </label>

          {!venueResult && mapsUrl && (
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
                onChange={(event) => handleStartChange(event.target.value)}
              />
            </label>

            <label className="field compact-field">
              <span>End</span>
              <input
                type="datetime-local"
                value={form.endDateTime}
                onChange={(event) => handleEndChange(event.target.value)}
              />
            </label>
          </div>

          <div className="beckon-datetime-row">
            <label className="field compact-field">
              <span>Expected number of rounds</span>
              <select
                value={form.expectedRounds}
                onChange={(event) => handleExpectedRoundsChange(Number(event.target.value))}
              >
                {EXPECTED_ROUNDS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="fan-summary beckon-total-hours">
              <div>
                <small>Total hours</small>
                <strong>{totalHours !== null ? `${totalHours}h` : "—"}</strong>
              </div>
            </div>
          </div>

          <label className="field">
            <span>Table mode</span>
            <select
              value={form.tableMode}
              onChange={(event) => update("tableMode", event.target.value as TableMode)}
            >
              {TABLE_MODE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

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
            <span>門清 (Men Qing) Concealed</span>
            <select
              value={form.menQing}
              onChange={(event) => update("menQing", event.target.value as MenQingMode)}
            >
              {MEN_QING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>平胡幾台 (Ping Hu)</span>
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
                <span>正 (加1台)</span>
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
                <span>正 (加1台)</span>
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

              <p className="beckon-subgroup-label">4隻</p>
              <label className="toggle-field" htmlFor="four-tiles-add-fan">
                <input
                  id="four-tiles-add-fan"
                  type="checkbox"
                  checked={form.fourTilesAddFan}
                  onChange={(event) => update("fourTilesAddFan", event.target.checked)}
                />
                <span>Add 1 fan</span>
              </label>
              <label className="toggle-field" htmlFor="four-tiles-pay-gang">
                <input
                  id="four-tiles-pay-gang"
                  type="checkbox"
                  checked={form.fourTilesPayGang}
                  onChange={(event) => update("fourTilesPayGang", event.target.checked)}
                />
                <span>Pay 花獸槓</span>
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

          <fieldset className="radio-field">
            <legend>Shooter</legend>
            <label htmlFor="shooter-yes">
              <input
                id="shooter-yes"
                type="radio"
                name="shooter"
                checked={form.shooter}
                onChange={() => update("shooter", true)}
              />
              <span>Yes</span>
            </label>
            <label htmlFor="shooter-no">
              <input
                id="shooter-no"
                type="radio"
                name="shooter"
                checked={!form.shooter}
                onChange={() => update("shooter", false)}
              />
              <span>No</span>
            </label>
          </fieldset>

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
          <label className="field">
            <span>大三元</span>
            <select
              value={form.daSanYuan}
              onChange={(event) => update("daSanYuan", event.target.value as BigHandMode)}
            >
              {DA_SAN_YUAN_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>大四喜</span>
            <select
              value={form.daSiXi}
              onChange={(event) => update("daSiXi", event.target.value as BigHandMode)}
            >
              {DA_SI_XI_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="toggle-field" htmlFor="qi-dui-zi-hand">
            <input
              id="qi-dui-zi-hand"
              type="checkbox"
              checked={form.qiDuiZiHand}
              onChange={(event) => update("qiDuiZiHand", event.target.checked)}
            />
            <span>七对子 — 有玩 / 沒有玩</span>
          </label>

          <label className="toggle-field" htmlFor="hua-hu">
            <input
              id="hua-hu"
              type="checkbox"
              checked={form.huaHu}
              onChange={(event) => update("huaHu", event.target.checked)}
            />
            <span>花胡 — 有玩 / 沒有玩</span>
          </label>

          {form.huaHu ? (
            <ul className="beckon-rule-notes">
              <li>自摸第 7 張可搶第 8 張，抓第 8 張者付 1 台出銃 + 2 台閒家</li>
              <li>自摸第 8 張，全體以出銃價支付</li>
            </ul>
          ) : (
            <ul className="beckon-rule-notes">
              <li>不設花胡：自摸可打到第 7 張，第 8 張仍可搶（付 1 台）</li>
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
            <div className="copy-tabs" role="tablist" aria-label="Copy invite format">
              <button
                type="button"
                role="tab"
                aria-selected={copyTab === "chat"}
                className={`copy-tab${copyTab === "chat" ? " copy-tab-active" : ""}`}
                onClick={() => {
                  setCopyTab("chat");
                  setCopyStatus("");
                }}
              >
                Chat
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={copyTab === "ai"}
                className={`copy-tab${copyTab === "ai" ? " copy-tab-active" : ""}`}
                onClick={() => {
                  setCopyTab("ai");
                  setCopyStatus("");
                }}
              >
                AI
              </button>
            </div>
            <button className="utility-action" type="button" onClick={copyInvite}>
              Copy
            </button>
          </div>
          {copyTab === "ai" && (
            <p className="beckon-venue-status">
              Paste this prompt into an AI image tool (ChatGPT, Gemini, Claude, DeepSeek, etc.) to generate a banner
              image.
            </p>
          )}
          <textarea
            readOnly
            value={copyTab === "chat" ? chatText : imagePromptText}
            aria-label={copyTab === "chat" ? "Copyable invite text" : "Copyable AI image prompt"}
            rows={16}
          />
          {copyStatus && <small>{copyStatus}</small>}
        </div>
      </section>

      <Footer />
    </main>
  );
}
