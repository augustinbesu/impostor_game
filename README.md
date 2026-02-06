# Impostor

A pass-and-play social deduction game for 3+ players. Everyone gets a secret word except the impostor, who gets a different one. Through discussion and questioning, figure out who's lying.

Built with React 19 + Vite 7.

[Features](#features) • [Deploy](#deployment) • [Development](#development)

---

## ✨ Features

### 🎨 **Premium Visual Design**
- Glassmorphism UI with animated background orbs
- Smooth staggered card entrance animations
- Dark mode optimized (with light mode support)
- Responsive design for all screen sizes

### 🌍 **Bilingual Support**
- 🇬🇧 **English** / 🇪🇸 **Español**
- Instant language switching
- Full UI + category localization

### 📦 **12 Built-in Categories**
- 🎬 **Películas** — Movies that make you think
- 📺 **Series** — Binge-worthy shows
- ⚽ **Futbolistas** — Football legends
- 🎵 **Reggaeton** — Urban music stars
- 😂 **Memes** — Spanish internet culture
- 🎮 **Videojuegos** — Gaming classics
## Features

**Language Support**
- English and Spanish UI
- 12 built-in Spanish-focused categories: movies, series, footballers, reggaeton artists, memes, YouTubers, video games, brands, celebrities, junk food, random stuff, and Spain vs. World comparisons

**Customization**
- Create your own categories with custom word pairs
- Add pairs to existing built-in categories
- Local storage persistence

**Gameplay**
- Configurable player count (3-10+) and impostor count
- Discussion timer with pause/resume (1-10 minutes)
- Secure pass-and-play with "tap to reveal" privacy
- Optional sound effects and haptic feedback

**UI**
- Glassmorphism design with animated backgrounds
- Dark mode (default) and light mode
- Responsive layout for mobile/desktop
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set build command: `npm run build`
   - Set output directory: `dist`

### **Option 3: GitHub Integration**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Vite settings ✅
6. Click "Deploy"

**🎉 Done!** Your game is live at `https://your-project.vercel.app`

---

## 🛠️ Development

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/impostor.git
cd impostor

# Install dependencies
npm install
## Deployment

### Vercel (Recommended)

**Via GitHub:**
1. Push to GitHub
2. Import repository at [vercel.com](https://vercel.com/new)
3. Vercel auto-detects Vite config
4. Deploy

**Via CLI:**
```bash
npm install -g vercel
npm run build
vercel --prod
```

The included `vercel.json` handles SPA routing automatically.
### **Results Phase**
## Development

**Requirements:** Node.js 18+

```bash
npm install
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run lint         # ESLint checks
```
│   │   ├── wordPacks.js        # 12 categories
│   │   └── i18n.js             # EN/ES translations
│   ├── utils/
│   │   └── sounds.js           # Audio effects
│   ├── App.jsx                 # Router + background
│   ├── index.css               # Complete styling
│   └── main.jsx                # Entry point
├── vercel.json                 # SPA routing config
├── vite.config.js
└── package.json
```

---

## 🎨 Screenshots
## Tech Stack

- React 19.2
- Vite 7.3
- Pure CSS (no framework)
- Web Audio API for sound
- LocalStorage for persistence
- Context API + useReducer

## Project Structurehttps://vercel.com)** • **[⭐ Star on GitHub](#)**

Made with 🎮 and ☕ by [Your Name]

</div>

├── vercel.json                 # SPA routing config
├── vite.config.js
└── package.json
```

## License

MIT