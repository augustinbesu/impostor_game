import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { t, getCategoryDisplayName } from "../data/i18n";
import {
  IconMask, IconShield, IconRefresh, IconHome, IconStar,
} from "./Icons";
import { playDramaticReveal, playSuccess, playTap, haptic } from "../utils/sounds";

/**
 * ResultsScreen  Dramatic staggered reveal of who the impostors were.
 */
export default function ResultsScreen() {
  const { state, actions } = useGame();
  const { players, normalWord, impostorWord, activeCategory, soundEnabled, language: lang } = state;

  // Staggered reveal phases: 0→1→2→3→4
  const [revealPhase, setRevealPhase] = useState(0);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => { setRevealPhase(1); if (soundEnabled) playDramaticReveal(); }, 500));
    timers.push(setTimeout(() => setRevealPhase(2), 1400));
    timers.push(setTimeout(() => { setRevealPhase(3); if (soundEnabled) playDramaticReveal(); }, 2400));
    timers.push(setTimeout(() => { setRevealPhase(4); if (soundEnabled) playSuccess(); haptic("heavy"); }, 3200));
    return () => timers.forEach(clearTimeout);
  }, [soundEnabled]);

  const impostors = players.filter(p => p.isImpostor);
  const innocents = players.filter(p => !p.isImpostor);

  return (
    <div className="screen results-screen">
      {/* The word */}
      <div className={`results-section ${revealPhase >= 1 ? "revealed" : ""}`}>
        <div className="results-word-reveal">
          <p className="results-label">{t(lang, "theWordWas")}</p>
          <h1 className="results-word">{normalWord}</h1>
          {activeCategory && activeCategory !== "Custom" && (
            <span className="results-category">{getCategoryDisplayName(lang, activeCategory)}</span>
          )}
        </div>
      </div>

      {/* Player cards */}
      <div className={`results-section ${revealPhase >= 2 ? "revealed" : ""}`}>
        <div className="results-players-grid">
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`results-player-card ${player.isImpostor ? "is-impostor" : "is-innocent"}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="results-player-icon">
                {player.isImpostor ? <IconMask size={22} /> : <IconShield size={22} />}
              </div>
              <span className="results-player-name">{t(lang, "playerN", { n: player.id })}</span>
              {player.isImpostor && (
                <span className="results-impostor-badge">{t(lang, "impostor")}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Impostor word */}
      <div className={`results-section ${revealPhase >= 3 ? "revealed" : ""}`}>
        <div className="results-impostor-word">
          <p className="results-label">{t(lang, "impostorWordWas")}</p>
          <h2 className="results-word impostor-word-text">{impostorWord}</h2>
        </div>
      </div>

      {/* Summary + actions */}
      <div className={`results-section ${revealPhase >= 4 ? "revealed" : ""}`}>
        <div className="results-summary">
          <div className="summary-group">
            <div className="summary-icon innocent-icon"><IconStar size={16} /></div>
            <div>
              <strong>{t(lang, "innocentCount", { n: innocents.length })}</strong>
              <span className="summary-word">{normalWord}</span>
            </div>
          </div>
          <div className="summary-divider" />
          <div className="summary-group">
            <div className="summary-icon impostor-icon-badge"><IconMask size={16} /></div>
            <div>
              <strong>{t(lang, "impostorCount", { n: impostors.length })}</strong>
              <span className="summary-word">{impostorWord}</span>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn-primary" onClick={() => { if (soundEnabled) { playTap(); haptic("medium"); } actions.playAgain(); }}>
            <IconRefresh size={18} /> <span>{t(lang, "playAgain")}</span>
          </button>
          <button className="btn-secondary" onClick={() => { if (soundEnabled) { playTap(); haptic("light"); } actions.newGame(); }}>
            <IconHome size={18} /> <span>{t(lang, "newGame")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
