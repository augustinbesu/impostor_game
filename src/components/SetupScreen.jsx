import { useState, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { PHASES } from "../context/GameContext";
import { getCategories, getCategoryPairs } from "../data/wordPacks";
import { t, getCategoryDisplayName } from "../data/i18n";
import {
  IconUsers, IconMask, IconPlay, IconGrid, IconEdit, IconCheck,
  IconMinus, IconPlus, IconSun, IconMoon, IconVolume, IconVolumeOff,
  IconGlobe, IconChevronRight, IconFolder, IconHelpCircle, IconX,
} from "./Icons";
import { playTap, haptic } from "../utils/sounds";

/**
 * SetupScreen — Game configuration: players, impostors, word source, language.
 */
export default function SetupScreen() {
  const { state, actions } = useGame();
  const lang = state.language;
  const [showCustom, setShowCustom] = useState(state.useCustomWords);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  const maxImpostors = Math.floor(state.playerCount / 2);
  const categories = getCategories();

  // Count selected categories
  const selCount = state.selectedCategories.filter(c => categories.includes(c)).length;

  function handleStart() {
    if (state.playerCount < 3) { setError(t(lang, "errMinPlayers")); return; }
    if (state.impostorCount < 1) { setError(t(lang, "errMinImpostors")); return; }
    if (state.impostorCount >= state.playerCount) { setError(t(lang, "errTooManyImpostors")); return; }
    if (showCustom) {
      if (!state.customNormalWord.trim() || !state.customImpostorWord.trim()) {
        setError(t(lang, "errCustomEmpty")); return;
      }
      if (state.customNormalWord.trim().toLowerCase() === state.customImpostorWord.trim().toLowerCase()) {
        setError(t(lang, "errCustomSame")); return;
      }
    }
    setError("");
    if (state.soundEnabled) { playTap(); haptic("medium"); }
    actions.startGame();
  }

  function adj(fn, delta, min, max) {
    const cur = fn === "player" ? state.playerCount : state.impostorCount;
    const next = Math.max(min, Math.min(max, cur + delta));
    if (fn === "player") actions.setPlayerCount(next);
    else actions.setImpostorCount(next);
    if (state.soundEnabled) { playTap(); haptic("light"); }
  }

  function toggleCustom() {
    const next = !showCustom;
    setShowCustom(next);
    actions.setUseCustom(next);
    if (state.soundEnabled) playTap();
  }

  function openCategories() {
    if (state.soundEnabled) { playTap(); haptic("light"); }
    actions.setPhase(PHASES.CATEGORIES);
  }

  function toggleLang() {
    const next = state.language === "en" ? "es" : "en";
    actions.setLanguage(next);
    if (state.soundEnabled) playTap();
  }

  // Summary of selected categories (short, won't overflow)
  const totalCats = categories.length;
  const selCatSummary = selCount === 0
    ? t(lang, "noCategoriesHint")
    : selCount === totalCats
      ? t(lang, "allCategories")
      : t(lang, "categoryCount", { n: selCount });

  return (
    <div className="screen setup-screen">
      {/* Top bar */}
      <div className="setup-topbar">
        <button className="icon-btn" onClick={toggleLang} aria-label="Toggle language" title={t(lang, "language")}>
          <IconGlobe size={18} />
          <span className="lang-label">{state.language.toUpperCase()}</span>
        </button>
        <div className="topbar-right">
          <button className="icon-btn" onClick={actions.toggleDarkMode} aria-label="Toggle theme">
            {state.darkMode ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          <button className="icon-btn" onClick={() => { actions.toggleSound(); haptic("light"); }} aria-label="Toggle sound">
            {state.soundEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
          </button>
        </div>
      </div>

      {/* ── Hero Section (centered) ── */}
      <div className="hero-section">
        <div className="logo-icon">
          <IconMask size={40} />
        </div>
        <h1 className="logo-title">{t(lang, "appName")}</h1>
        <p className="logo-subtitle">{t(lang, "appSubtitle")}</p>
        <button
          className="rules-btn"
          onClick={() => { setShowRules(true); if (state.soundEnabled) playTap(); }}
        >
          <IconHelpCircle size={15} />
          <span>{t(lang, "howToPlayTitle")}</span>
        </button>
      </div>

      {/* ── Rules Modal ── */}
      {showRules && (
        <div className="rules-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-modal" onClick={e => e.stopPropagation()}>
            <div className="rules-modal-header">
              <h2 className="rules-modal-title">{t(lang, "howToPlayTitle")}</h2>
              <button className="rules-close-btn" onClick={() => setShowRules(false)}>
                <IconX size={18} />
              </button>
            </div>
            <div className="rules-modal-body">
              <div className="rules-step">
                <span className="step-num">1</span>
                <span>{t(lang, "howToStep1")}</span>
              </div>
              <div className="rules-step">
                <span className="step-num">2</span>
                <span>{t(lang, "howToStep2")}</span>
              </div>
              <div className="rules-step">
                <span className="step-num">3</span>
                <span>{t(lang, "howToStep3")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -- Section: Game Setup -- */}
      <div className="setup-section-label">
        <span className="section-line" />
        <span className="section-text">{t(lang, "gameSetup")}</span>
        <span className="section-line" />
      </div>

      {/* -- Player & Impostor counters - side by side -- */}
      <div className="counters-grid">
        <div className="setup-card counter-card">
          <div className="card-label">
            <IconUsers size={18} />
            <span>{t(lang, "players")}</span>
          </div>
          <div className="counter-row">
            <button className="counter-btn" onClick={() => adj("player", -1, 3, 20)} disabled={state.playerCount <= 3}><IconMinus size={16} /></button>
            <span className="counter-value">{state.playerCount}</span>
            <button className="counter-btn" onClick={() => adj("player", 1, 3, 20)} disabled={state.playerCount >= 20}><IconPlus size={16} /></button>
          </div>
        </div>

        <div className="setup-card counter-card">
          <div className="card-label">
            <IconMask size={18} />
            <span>{t(lang, "impostors")}</span>
          </div>
          <div className="counter-row">
            <button className="counter-btn" onClick={() => adj("imp", -1, 1, maxImpostors)} disabled={state.impostorCount <= 1}><IconMinus size={16} /></button>
            <span className="counter-value">{state.impostorCount}</span>
            <button className="counter-btn" onClick={() => adj("imp", 1, 1, maxImpostors)} disabled={state.impostorCount >= maxImpostors}><IconPlus size={16} /></button>
          </div>
          <div className="card-hint">{t(lang, "maxImpostors", { n: maxImpostors, p: state.playerCount })}</div>
        </div>
      </div>

      {/* -- Section: Word Configuration -- */}
      <div className="setup-section-label">
        <span className="section-line" />
        <span className="section-text">{t(lang, "wordConfig")}</span>
        <span className="section-line" />
      </div>

      {/* -- Word source card -- */}
      <div className="setup-card word-card-setup">
        {/* Toggle tabs */}
        <div className="word-source-toggle">
          <button className={`source-tab ${!showCustom ? "active" : ""}`} onClick={() => { if (showCustom) toggleCustom(); }}>
            <IconFolder size={15} />
            <span>{t(lang, "categories")}</span>
          </button>
          <button className={`source-tab ${showCustom ? "active" : ""}`} onClick={() => { if (!showCustom) toggleCustom(); }}>
            <IconEdit size={15} />
            <span>{t(lang, "customWords")}</span>
          </button>
        </div>

        {!showCustom ? (
          <div className="category-selector">
            <button className="category-browse-btn" onClick={openCategories}>
              <div className="browse-btn-left">
                <IconGrid size={20} />
                <div className="browse-btn-text">
                  <span className="browse-btn-title">{t(lang, "selectCategories")}</span>
                  <span className="browse-btn-count">{selCatSummary}</span>
                </div>
              </div>
              <div className="browse-btn-right">
                {selCount > 0 && <span className="browse-badge">{selCount}</span>}
                <IconChevronRight size={20} />
              </div>
            </button>
          </div>
        ) : (
          <div className="custom-words-form">
            <div className="custom-input-group">
              <label className="custom-label">{t(lang, "normalWord")}</label>
              <input
                type="text" className="custom-input"
                placeholder={t(lang, "normalWordPlaceholder")}
                value={state.customNormalWord}
                onChange={e => actions.setCustomNormal(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="custom-input-group">
              <label className="custom-label">{t(lang, "impostorWord")}</label>
              <input
                type="text" className="custom-input"
                placeholder={t(lang, "impostorWordPlaceholder")}
                value={state.customImpostorWord}
                onChange={e => actions.setCustomImpostor(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation error */}
      {error && <div className="validation-error">{error}</div>}

      {/* -- Start CTA -- */}
      <button className="btn-primary start-btn" onClick={handleStart}>
        <IconPlay size={20} />
        <span>{t(lang, "startGame")}</span>
      </button>

      {/* -- Quick tip -- */}
      <p className="quick-tip">{t(lang, "quickTip")}</p>
    </div>
  );
}
