import { useState, useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { t } from "../data/i18n";
import {
  IconEye, IconEyeOff, IconChevronRight, IconLock, IconShield,
} from "./Icons";
import { playReveal, playTap, haptic } from "../utils/sounds";

/**
 * RevealScreen  Secure pass-and-play word reveal.
 *
 * Flow: "Tap to Reveal" → word shown → "Hide Word" → pass overlay → next player.
 * Subtle visual distinction for impostor (border/accent color) without labeling.
 */
export default function RevealScreen() {
  const { state, actions } = useGame();
  const { currentPlayerIndex, players, soundEnabled, language: lang } = state;

  const player = players[currentPlayerIndex];
  const isLast = currentPlayerIndex === players.length - 1;

  const [phase, setPhase] = useState("ready"); // "ready" | "revealed" | "passing"
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 50);
    return () => clearTimeout(t);
  }, [currentPlayerIndex]);

  const handleReveal = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("revealed");
    actions.revealWord();
    if (soundEnabled) { playReveal(); haptic("medium"); }
  }, [phase, actions, soundEnabled]);

  const handleHide = useCallback(() => {
    if (phase !== "revealed") return;
    setPhase("passing");
    actions.hideWord();
    if (soundEnabled) { playTap(); haptic("light"); }
  }, [phase, actions, soundEnabled]);

  const handleNext = useCallback(() => {
    setPhase("ready");
    actions.nextPlayer();
    if (soundEnabled) { playTap(); haptic("light"); }
  }, [actions, soundEnabled]);

  // Block browser back
  useEffect(() => {
    const handler = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const progress = ((currentPlayerIndex + (phase === "passing" ? 1 : 0)) / players.length) * 100;

  return (
    <div className="screen reveal-screen">
      {/* Progress */}
      <div className="reveal-progress-bar">
        <div className="reveal-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="reveal-counter">
        {t(lang, "playerOf", { current: currentPlayerIndex + 1, total: players.length })}
      </div>

      {/* Ready */}
      {phase === "ready" && (
        <div className={`reveal-card-container ${entering ? "entering" : ""}`}>
          <div className="reveal-card ready-card" onClick={handleReveal}>
            <div className="reveal-card-icon">
              <IconLock size={44} />
            </div>
            <h2 className="reveal-player-label">{t(lang, "playerN", { n: player.id })}</h2>
            <p className="reveal-instruction">{t(lang, "tapToReveal")}</p>
            <div className="tap-indicator">
              <IconEye size={26} />
            </div>
          </div>
          <p className="reveal-privacy-note">
            <IconShield size={14} /> {t(lang, "privacyNote")}
          </p>
        </div>
      )}

      {/* Revealed */}
      {phase === "revealed" && (
        <div className="reveal-card-container">
          <div className={`reveal-card word-card ${player.isImpostor ? "impostor-card" : "normal-card"}`}>
            <div className="word-card-inner">
              <p className="word-card-label">{t(lang, "yourWordIs")}</p>
              <h1 className="word-card-word">{player.word}</h1>
              <div className={`word-card-accent ${player.isImpostor ? "accent-impostor" : "accent-normal"}`}>
                <span className="accent-dots">
                  {[0, 1, 2].map(i => (
                    <span key={i} className={`dot ${player.isImpostor ? "dot-alt" : ""}`} />
                  ))}
                </span>
              </div>
            </div>
          </div>
          <button className="btn-secondary hide-btn" onClick={handleHide}>
            <IconEyeOff size={18} />
            <span>{t(lang, "hideWord")}</span>
          </button>
        </div>
      )}

      {/* Passing */}
      {phase === "passing" && (
        <div className="pass-overlay">
          <div className="pass-content">
            <div className="pass-icon-ring">
              <IconChevronRight size={36} />
            </div>
            {isLast ? (
              <>
                <h2 className="pass-title">{t(lang, "allReady")}</h2>
                <p className="pass-subtitle">{t(lang, "everyoneSeen")}</p>
                <button className="btn-primary" onClick={handleNext}>
                  <span>{t(lang, "startDiscussion")}</span>
                  <IconChevronRight size={18} />
                </button>
              </>
            ) : (
              <>
                <h2 className="pass-title">{t(lang, "passDevice")}</h2>
                <p className="pass-subtitle">
                  {t(lang, "handToPlayer", { n: players[currentPlayerIndex + 1].id })}
                </p>
                <button className="btn-primary" onClick={handleNext}>
                  <span>{t(lang, "imReady", { n: players[currentPlayerIndex + 1].id })}</span>
                  <IconChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
