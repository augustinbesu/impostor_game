import { useState, useEffect, useCallback, useRef } from "react";
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
 * Uses CSS-only opacity/transform transitions for smooth, flicker-free pass-and-play.
 */
export default function RevealScreen() {
  const { state, actions } = useGame();
  const { currentPlayerIndex, players, soundEnabled, language: lang } = state;

  const player = players[currentPlayerIndex];
  const isLast = currentPlayerIndex === players.length - 1;

  const [phase, setPhase] = useState("ready"); // "ready" | "revealed" | "passing"
  // Animation state: "visible" = shown, "exit" = fading out, "enter" = fading in
  const [anim, setAnim] = useState("visible");
  const prevIndexRef = useRef(currentPlayerIndex);

  // When currentPlayerIndex changes, run a smooth enter animation
  useEffect(() => {
    if (prevIndexRef.current !== currentPlayerIndex) {
      prevIndexRef.current = currentPlayerIndex;
      setAnim("enter");
      // Trigger reflow then set to visible for the CSS transition
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnim("visible"));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [currentPlayerIndex]);

  const handleReveal = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("revealed");
    actions.revealWord();
    if (soundEnabled) { playReveal(); haptic("medium"); }
  }, [phase, actions, soundEnabled]);

  const handleHide = useCallback(() => {
    if (phase !== "revealed") return;
    // Fade out the word card, then show pass overlay
    setAnim("exit");
    setTimeout(() => {
      setPhase("passing");
      actions.hideWord();
      // Enter the pass overlay smoothly
      setAnim("enter");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnim("visible"));
      });
    }, 280);
    if (soundEnabled) { playTap(); haptic("light"); }
  }, [phase, actions, soundEnabled]);

  const handleNext = useCallback(() => {
    // Fade out pass overlay, then advance to next player
    setAnim("exit");
    setTimeout(() => {
      setPhase("ready");
      actions.nextPlayer();
      // The useEffect above will handle the enter animation for the new player
      setAnim("enter");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnim("visible"));
      });
    }, 280);
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

  // Compute transition class
  const transClass =
    anim === "exit" ? "phase-exit" :
    anim === "enter" ? "phase-enter" :
    "phase-visible";

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
        <div className={`reveal-card-container ${transClass}`}>
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
        <div className={`reveal-card-container ${transClass}`}>
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
        <div className={`pass-overlay ${transClass}`}>
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
