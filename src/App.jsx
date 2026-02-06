import { useEffect } from "react";
import { GameProvider, useGame, PHASES } from "./context/GameContext";
import SetupScreen from "./components/SetupScreen";
import CategoryScreen from "./components/CategoryScreen";
import RevealScreen from "./components/RevealScreen";
import DiscussionScreen from "./components/DiscussionScreen";
import ResultsScreen from "./components/ResultsScreen";
import "./index.css";

/** Immersive animated background with orbs, grid, and floating particles */
function BackgroundOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-grid" />
      <div className="bg-noise" />
      {/* Floating particles */}
      <div className="bg-particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className={`bg-particle bg-particle-${(i % 5) + 1}`}
               style={{
                 left: `${5 + (i * 4.7) % 90}%`,
                 top: `${3 + (i * 7.3) % 94}%`,
                 animationDelay: `${(i * 1.3) % 8}s`,
                 animationDuration: `${6 + (i % 5) * 2}s`,
               }}
          />
        ))}
      </div>
    </div>
  );
}

function GameRouter() {
  const { state } = useGame();

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  switch (state.phase) {
    case PHASES.SETUP:       return <SetupScreen />;
    case PHASES.CATEGORIES:  return <CategoryScreen />;
    case PHASES.REVEAL:      return <RevealScreen />;
    case PHASES.DISCUSSION:  return <DiscussionScreen />;
    case PHASES.RESULTS:     return <ResultsScreen />;
    default:                 return <SetupScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <BackgroundOrbs />
      <GameRouter />
    </GameProvider>
  );
}
