import { useEffect } from "react";
import { GameProvider, useGame, PHASES } from "./context/GameContext";
import SetupScreen from "./components/SetupScreen";
import CategoryScreen from "./components/CategoryScreen";
import RevealScreen from "./components/RevealScreen";
import DiscussionScreen from "./components/DiscussionScreen";
import ResultsScreen from "./components/ResultsScreen";
import "./index.css";

/** Floating background orbs for ambient visual depth */
function BackgroundOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
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
