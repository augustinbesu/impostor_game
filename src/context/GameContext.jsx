import { createContext, useContext, useReducer, useCallback } from "react";
import { getRandomPairFromCategories, getRandomPairFromAny, getBuiltInCategories } from "../data/wordPacks";

// +++ Game Phases +++
export const PHASES = {
  SETUP: "setup",
  CATEGORIES: "categories",
  REVEAL: "reveal",
  DISCUSSION: "discussion",
  RESULTS: "results",
};

// +++ Load persisted preferences +++
function loadPrefs() {
  try {
    const d = localStorage.getItem("impostor_prefs");
    return d ? JSON.parse(d) : {};
  } catch { return {}; }
}

function savePrefs(prefs) {
  try { localStorage.setItem("impostor_prefs", JSON.stringify(prefs)); }
  catch { /* */ }
}

const prefs = loadPrefs();

// Validate saved categories still exist (handles pack changes gracefully)
function getValidatedCategories(saved) {
  if (!saved || !saved.length) return getBuiltInCategories();
  const valid = getBuiltInCategories();
  const filtered = saved.filter(c => valid.includes(c));
  return filtered.length > 0 ? filtered : getBuiltInCategories();
}

// +++ Initial State +++
const initialState = {
  phase: PHASES.SETUP,
  language: prefs.language || "en",
  playerCount: prefs.playerCount || 4,
  impostorCount: prefs.impostorCount || 1,
  selectedCategories: getValidatedCategories(prefs.selectedCategories),
  useCustomWords: false,
  customNormalWord: "",
  customImpostorWord: "",
  normalWord: "",
  impostorWord: "",
  activeCategory: "",
  players: [],
  currentPlayerIndex: 0,
  revealState: "waiting",
  timerDuration: prefs.timerDuration || 180,
  timerRunning: false,
  timerPaused: false,
  darkMode: prefs.darkMode !== undefined ? prefs.darkMode : true,
  soundEnabled: prefs.soundEnabled !== undefined ? prefs.soundEnabled : true,
};

// +++ Action Types +++
const A = {
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_PLAYER_COUNT: "SET_PLAYER_COUNT",
  SET_IMPOSTOR_COUNT: "SET_IMPOSTOR_COUNT",
  SET_SELECTED_CATEGORIES: "SET_SELECTED_CATEGORIES",
  TOGGLE_CATEGORY: "TOGGLE_CATEGORY",
  SET_USE_CUSTOM: "SET_USE_CUSTOM",
  SET_CUSTOM_NORMAL: "SET_CUSTOM_NORMAL",
  SET_CUSTOM_IMPOSTOR: "SET_CUSTOM_IMPOSTOR",
  START_GAME: "START_GAME",
  REVEAL_WORD: "REVEAL_WORD",
  HIDE_WORD: "HIDE_WORD",
  NEXT_PLAYER: "NEXT_PLAYER",
  GO_TO_DISCUSSION: "GO_TO_DISCUSSION",
  SET_TIMER_DURATION: "SET_TIMER_DURATION",
  SET_TIMER_RUNNING: "SET_TIMER_RUNNING",
  SET_TIMER_PAUSED: "SET_TIMER_PAUSED",
  GO_TO_RESULTS: "GO_TO_RESULTS",
  PLAY_AGAIN: "PLAY_AGAIN",
  NEW_GAME: "NEW_GAME",
  TOGGLE_DARK_MODE: "TOGGLE_DARK_MODE",
  TOGGLE_SOUND: "TOGGLE_SOUND",
  SET_PHASE: "SET_PHASE",
};

// +++ Secure random +++
function secureRandom(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffleArray(arr) {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function assignPlayers(playerCount, impostorCount, normalWord, impostorWord) {
  const indices = Array.from({ length: playerCount }, (_, i) => i);
  const shuffled = shuffleArray(indices);
  const impostorSet = new Set(shuffled.slice(0, impostorCount));
  return Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    isImpostor: impostorSet.has(i),
    word: impostorSet.has(i) ? impostorWord : normalWord,
  }));
}

function generateGame(state) {
  let normalWord, impostorWord, activeCategory;
  if (state.useCustomWords && state.customNormalWord.trim() && state.customImpostorWord.trim()) {
    normalWord = state.customNormalWord.trim();
    impostorWord = state.customImpostorWord.trim();
    activeCategory = "Custom";
  } else {
    const result = state.selectedCategories.length > 0
      ? getRandomPairFromCategories(state.selectedCategories)
      : getRandomPairFromAny();
    normalWord = result.pair[0];
    impostorWord = result.pair[1];
    activeCategory = result.category;
  }
  const players = assignPlayers(state.playerCount, state.impostorCount, normalWord, impostorWord);
  return { normalWord, impostorWord, activeCategory, players };
}

// +++ Reducer +++
function gameReducer(state, action) {
  switch (action.type) {
    case A.SET_LANGUAGE: {
      savePrefs({ ...loadPrefs(), language: action.payload });
      return { ...state, language: action.payload };
    }
    case A.SET_PLAYER_COUNT: {
      const pc = action.payload;
      const ic = Math.min(state.impostorCount, Math.floor(pc / 2));
      savePrefs({ ...loadPrefs(), playerCount: pc, impostorCount: ic });
      return { ...state, playerCount: pc, impostorCount: ic };
    }
    case A.SET_IMPOSTOR_COUNT: {
      savePrefs({ ...loadPrefs(), impostorCount: action.payload });
      return { ...state, impostorCount: action.payload };
    }
    case A.SET_SELECTED_CATEGORIES: {
      savePrefs({ ...loadPrefs(), selectedCategories: action.payload });
      return { ...state, selectedCategories: action.payload };
    }
    case A.TOGGLE_CATEGORY: {
      const cat = action.payload;
      const cur = state.selectedCategories;
      const next = cur.includes(cat) ? cur.filter(c => c !== cat) : [...cur, cat];
      savePrefs({ ...loadPrefs(), selectedCategories: next });
      return { ...state, selectedCategories: next };
    }
    case A.SET_USE_CUSTOM:
      return { ...state, useCustomWords: action.payload };
    case A.SET_CUSTOM_NORMAL:
      return { ...state, customNormalWord: action.payload };
    case A.SET_CUSTOM_IMPOSTOR:
      return { ...state, customImpostorWord: action.payload };
    case A.START_GAME: {
      const g = generateGame(state);
      return {
        ...state, phase: PHASES.REVEAL,
        ...g, currentPlayerIndex: 0, revealState: "waiting",
        timerRunning: false, timerPaused: false,
      };
    }
    case A.REVEAL_WORD:
      return { ...state, revealState: "revealed" };
    case A.HIDE_WORD:
      return { ...state, revealState: "hiding" };
    case A.NEXT_PLAYER: {
      const next = state.currentPlayerIndex + 1;
      if (next >= state.playerCount) {
        return { ...state, phase: PHASES.DISCUSSION, revealState: "waiting" };
      }
      return { ...state, currentPlayerIndex: next, revealState: "waiting" };
    }
    case A.GO_TO_DISCUSSION:
      return { ...state, phase: PHASES.DISCUSSION };
    case A.SET_TIMER_DURATION: {
      savePrefs({ ...loadPrefs(), timerDuration: action.payload });
      return { ...state, timerDuration: action.payload };
    }
    case A.SET_TIMER_RUNNING:
      return { ...state, timerRunning: action.payload };
    case A.SET_TIMER_PAUSED:
      return { ...state, timerPaused: action.payload };
    case A.GO_TO_RESULTS:
      return { ...state, phase: PHASES.RESULTS, timerRunning: false, timerPaused: false };
    case A.PLAY_AGAIN: {
      const g = generateGame(state);
      return {
        ...state, phase: PHASES.REVEAL,
        ...g, currentPlayerIndex: 0, revealState: "waiting",
        timerRunning: false, timerPaused: false,
      };
    }
    case A.NEW_GAME:
      return {
        ...initialState,
        darkMode: state.darkMode,
        soundEnabled: state.soundEnabled,
        timerDuration: state.timerDuration,
        language: state.language,
        playerCount: state.playerCount,
        impostorCount: state.impostorCount,
        selectedCategories: state.selectedCategories,
      };
    case A.TOGGLE_DARK_MODE: {
      const dm = !state.darkMode;
      savePrefs({ ...loadPrefs(), darkMode: dm });
      return { ...state, darkMode: dm };
    }
    case A.TOGGLE_SOUND: {
      const se = !state.soundEnabled;
      savePrefs({ ...loadPrefs(), soundEnabled: se });
      return { ...state, soundEnabled: se };
    }
    case A.SET_PHASE:
      return { ...state, phase: action.payload };
    default:
      return state;
  }
}

// +++ Context +++
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = {
    setLanguage: useCallback(v => dispatch({ type: A.SET_LANGUAGE, payload: v }), []),
    setPlayerCount: useCallback(n => dispatch({ type: A.SET_PLAYER_COUNT, payload: n }), []),
    setImpostorCount: useCallback(n => dispatch({ type: A.SET_IMPOSTOR_COUNT, payload: n }), []),
    setSelectedCategories: useCallback(c => dispatch({ type: A.SET_SELECTED_CATEGORIES, payload: c }), []),
    toggleCategory: useCallback(c => dispatch({ type: A.TOGGLE_CATEGORY, payload: c }), []),
    setUseCustom: useCallback(v => dispatch({ type: A.SET_USE_CUSTOM, payload: v }), []),
    setCustomNormal: useCallback(w => dispatch({ type: A.SET_CUSTOM_NORMAL, payload: w }), []),
    setCustomImpostor: useCallback(w => dispatch({ type: A.SET_CUSTOM_IMPOSTOR, payload: w }), []),
    startGame: useCallback(() => dispatch({ type: A.START_GAME }), []),
    revealWord: useCallback(() => dispatch({ type: A.REVEAL_WORD }), []),
    hideWord: useCallback(() => dispatch({ type: A.HIDE_WORD }), []),
    nextPlayer: useCallback(() => dispatch({ type: A.NEXT_PLAYER }), []),
    goToDiscussion: useCallback(() => dispatch({ type: A.GO_TO_DISCUSSION }), []),
    setTimerDuration: useCallback(d => dispatch({ type: A.SET_TIMER_DURATION, payload: d }), []),
    setTimerRunning: useCallback(v => dispatch({ type: A.SET_TIMER_RUNNING, payload: v }), []),
    setTimerPaused: useCallback(v => dispatch({ type: A.SET_TIMER_PAUSED, payload: v }), []),
    goToResults: useCallback(() => dispatch({ type: A.GO_TO_RESULTS }), []),
    playAgain: useCallback(() => dispatch({ type: A.PLAY_AGAIN }), []),
    newGame: useCallback(() => dispatch({ type: A.NEW_GAME }), []),
    toggleDarkMode: useCallback(() => dispatch({ type: A.TOGGLE_DARK_MODE }), []),
    toggleSound: useCallback(() => dispatch({ type: A.TOGGLE_SOUND }), []),
    setPhase: useCallback(p => dispatch({ type: A.SET_PHASE, payload: p }), []),
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
