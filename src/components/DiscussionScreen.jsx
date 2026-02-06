import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { t } from "../data/i18n";
import {
  IconMessageCircle, IconClock, IconChevronRight,
  IconMinus, IconPlus, IconPause, IconPlay, IconStop, IconFlag,
} from "./Icons";
import { playTick, playSuccess, playTap, playPause, haptic } from "../utils/sounds";

/**
 * DiscussionScreen  Timer with pause/stop/resume + challenge-done button.
 *
 * States:
 *  - setup: choose timer duration, start, or skip
 *  - running: timer counting down, can pause or stop
 *  - paused: timer frozen, can resume or stop
 *  - done: time's up or stopped, show results button
 */
export default function DiscussionScreen() {
  const { state, actions } = useGame();
  const { timerDuration, soundEnabled, language: lang } = state;

  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [timerState, setTimerState] = useState("setup"); // setup | running | paused | done
  const intervalRef = useRef(null);
  const lastTickRef = useRef(0);

  // Timer countdown
  useEffect(() => {
    if (timerState !== "running") return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setTimerState("done");
          if (soundEnabled) playSuccess();
          haptic("heavy");
          return 0;
        }
        // Tick in last 10s
        if (prev <= 11 && soundEnabled) {
          const now = Date.now();
          if (now - lastTickRef.current > 800) {
            playTick();
            lastTickRef.current = now;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerState, soundEnabled]);

  const startTimer = useCallback(() => {
    setTimeLeft(timerDuration);
    setTimerState("running");
    if (soundEnabled) { playTap(); haptic("medium"); }
  }, [timerDuration, soundEnabled]);

  const pauseTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerState("paused");
    if (soundEnabled) { playPause(); haptic("light"); }
  }, [soundEnabled]);

  const resumeTimer = useCallback(() => {
    setTimerState("running");
    if (soundEnabled) { playTap(); haptic("light"); }
  }, [soundEnabled]);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerState("done");
    if (soundEnabled) { playTap(); haptic("medium"); }
  }, [soundEnabled]);

  const skipTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerState("done");
    if (soundEnabled) { playTap(); haptic("light"); }
  }, [soundEnabled]);

  const goResults = useCallback(() => {
    if (soundEnabled) { playTap(); haptic("medium"); }
    actions.goToResults();
  }, [actions, soundEnabled]);

  // Challenge done = immediate stop + go to results
  const challengeDone = useCallback(() => {
    clearInterval(intervalRef.current);
    if (soundEnabled) { playSuccess(); haptic("heavy"); }
    actions.goToResults();
  }, [actions, soundEnabled]);

  function adjustDuration(delta) {
    const next = Math.max(30, Math.min(600, timerDuration + delta));
    actions.setTimerDuration(next);
    setTimeLeft(next);
    if (soundEnabled) playTap();
  }

  // Format
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  // Ring
  const circumference = 2 * Math.PI * 90;
  const elapsed = timerDuration - timeLeft;
  const dashOffset = circumference * (elapsed / timerDuration);

  return (
    <div className="screen discussion-screen">
      {/* Header */}
      <div className="discussion-header">
        <div className="discussion-icon">
          <IconMessageCircle size={32} />
        </div>
        <h1 className="discussion-title">{t(lang, "discussionTime")}</h1>
        <p className="discussion-subtitle">{t(lang, "discussionSubtitle")}</p>
      </div>

      {/* Rules */}
      <div className="discussion-rules">
        {["rule1", "rule2", "rule3"].map((key, i) => (
          <div className="rule-item" key={key}>
            <span className="rule-number">{i + 1}</span>
            <span>{t(lang, key)}</span>
          </div>
        ))}
      </div>

      {/* Timer Setup */}
      {timerState === "setup" && (
        <div className="timer-setup">
          <div className="timer-setup-label">
            <IconClock size={16} />
            <span>{t(lang, "discussionTimer")}</span>
          </div>
          <div className="timer-adjust">
            <button className="counter-btn" onClick={() => adjustDuration(-30)} disabled={timerDuration <= 30}>
              <IconMinus size={16} />
            </button>
            <span className="timer-value">
              {Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, "0")}
            </span>
            <button className="counter-btn" onClick={() => adjustDuration(30)} disabled={timerDuration >= 600}>
              <IconPlus size={16} />
            </button>
          </div>
          <div className="timer-actions">
            <button className="btn-primary" onClick={startTimer}>
              <IconPlay size={16} />
              <span>{t(lang, "startTimer")}</span>
            </button>
            <button className="btn-ghost" onClick={skipTimer}>
              {t(lang, "skipTimer")}
            </button>
          </div>
        </div>
      )}

      {/* Timer Running / Paused */}
      {(timerState === "running" || timerState === "paused") && (
        <div className="timer-active-section">
          <div className="timer-ring-container">
            <svg className="timer-ring" viewBox="0 0 200 200">
              <circle className="timer-ring-bg" cx="100" cy="100" r="90" fill="none" strokeWidth="6" />
              <circle
                className={`timer-ring-progress ${timerState === "paused" ? "paused" : ""} ${timeLeft <= 10 ? "urgent" : ""}`}
                cx="100" cy="100" r="90" fill="none" strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="timer-ring-text">
              <span className={`timer-display ${timeLeft <= 10 ? "timer-urgent" : ""} ${timerState === "paused" ? "timer-paused-text" : ""}`}>
                {timeStr}
              </span>
              {timerState === "paused" && (
                <span className="timer-paused-label">{t(lang, "pause")}</span>
              )}
            </div>
          </div>

          {/* Timer controls */}
          <div className="timer-controls">
            {timerState === "running" ? (
              <button className="btn-secondary timer-ctrl-btn" onClick={pauseTimer}>
                <IconPause size={18} /> <span>{t(lang, "pause")}</span>
              </button>
            ) : (
              <button className="btn-primary timer-ctrl-btn" onClick={resumeTimer}>
                <IconPlay size={18} /> <span>{t(lang, "resume")}</span>
              </button>
            )}
            <button className="btn-ghost timer-ctrl-btn" onClick={stopTimer}>
              <IconStop size={16} /> <span>{t(lang, "stop")}</span>
            </button>
          </div>

          {/* Challenge Done button */}
          <button className="btn-challenge-done" onClick={challengeDone}>
            <IconFlag size={18} />
            <span>{t(lang, "challengeDone")}</span>
          </button>
        </div>
      )}

      {/* Timer Done */}
      {timerState === "done" && (
        <div className="timer-done-section">
          {timeLeft === 0 ? (
            <h2 className="timer-done-text">{t(lang, "timesUp")}</h2>
          ) : (
            <h2 className="timer-done-text">{t(lang, "challengeDone")}</h2>
          )}
          <button className="btn-primary results-btn" onClick={goResults}>
            <span>{t(lang, "revealImpostors")}</span>
            <IconChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
