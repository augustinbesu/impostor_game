/**
 * Word Packs Database
 * Each category: [normalWord, impostorWord] pairs.
 * Custom categories stored in localStorage and merged at runtime.
 */

const STORAGE_KEY = "impostor_custom_categories";
const ADDITIONS_KEY = "impostor_builtin_additions";

const builtInPacks = {
  // +++ Películas +++
  Peliculas: [
    ["Titanic", "Avatar"], ["El Padrino", "Goodfellas"],
    ["Matrix", "Blade Runner"], ["Gladiator", "Braveheart"],
    ["Forrest Gump", "Big Fish"], ["Pulp Fiction", "Reservoir Dogs"],
    ["El Señor de los Anillos", "Narnia"], ["Star Wars", "Dune"],
    ["Batman", "Iron Man"], ["Shrek", "Los Simpson"],
    ["Toy Story", "Lego La Película"], ["Coco", "El Libro de la Vida"],
    ["Interestelar", "2001 Odisea Espacial"], ["Jurassic Park", "Godzilla"],
    ["Avengers", "X-Men"], ["Rápidos y Furiosos", "Mad Max"],
    ["Tiburón", "Pirañas"], ["El Rey León", "Bambi"],
    ["Up", "Ratatouille"], ["IT", "Viernes 13"],
    ["Frozen", "La Sirenita"], ["Los Increíbles", "Big Hero 6"],
    ["Django", "Kill Bill"], ["Parásitos", "Oldboy"],
    ["Oppenheimer", "Imitation Game"], ["John Wick", "Equilibrium"],
    ["Deadpool", "The Mask"], ["Piratas del Caribe", "Hook"],
    ["El Lobo de Wall Street", "El Contador"], ["Joker", "Taxi Driver"],
    ["La La Land", "Chicago"], ["Hereditary", "Midsommar"],
  ],
  // +++ Series +++
  Series: [
    ["Breaking Bad", "The Wire"], ["La Casa de Papel", "Lupin"],
    ["Stranger Things", "The OA"], ["The Office", "Community"],
    ["Friends", "Seinfeld"], ["Los Simpson", "South Park"],
    ["Game of Thrones", "The Witcher"], ["The Walking Dead", "28 Days Later"],
    ["El Juego del Calamar", "Battle Royale"], ["Peaky Blinders", "Gangs of London"],
    ["La que se avecina", "7 Vidas"], ["Better Call Saul", "Fargo"],
    ["Chernobyl", "Mindhunter"], ["Rick and Morty", "Solar Opposites"],
    ["The Mandalorian", "Firefly"], ["Wednesday", "Sabrina"],
    ["Black Mirror", "Inside No. 9"], ["Élite", "Gossip Girl"],
    ["Física o Química", "Al salir de clase"], ["Euphoria", "13 Reasons Why"],
    ["Ted Lasso", "The Good Place"], ["The Bear", "Chef's Table"],
    ["One Piece", "Naruto"], ["Attack on Titan", "Fullmetal Alchemist"],
    ["Lupin", "Arsène Lupin"], ["Mr. Robot", "Person of Interest"],
    ["Succession", "House of Cards"], ["The Boys", "Umbrella Academy"],
    ["Lost", "The Leftovers"], ["Westworld", "Altered Carbon"],
  ],
  // +++ Futbolistas +++
  Futbolistas: [
    ["Messi", "Maradona"], ["Mbappé", "Neymar"],
    ["Haaland", "Vinícius Jr."], ["Cristiano Ronaldo", "Zlatan"],
    ["Zidane", "Iniesta"], ["Ronaldinho", "R9"],
    ["Ramos", "Pepe"], ["Modric", "Rakitic"],
    ["Benzema", "Suárez"], ["De Bruyne", "Özil"],
    ["Casillas", "Neuer"], ["Beckham", "Gerrard"],
    ["Raúl", "Villa"], ["Agüero", "Cavani"],
    ["Dani Alves", "Cafú"], ["Busquets", "Casemiro"],
    ["Salah", "Hazard"], ["Lamine Yamal", "Ansu Fati"],
    ["Gavi", "Camavinga"], ["Bellingham", "Foden"],
    ["Ter Stegen", "Oblak"], ["Son", "Mané"],
    ["Di María", "Robben"], ["Pogba", "Vidal"],
    ["Roberto Carlos", "Maldini"], ["Puyol", "Ramos"],
    ["Van Dijk", "Chiellini"], ["Pelé", "Garrincha"],
  ],
  // +++ Reggaeton y Música Urbana +++
  Reggaeton: [
    ["Bad Bunny", "Daddy Yankee"], ["J Balvin", "Maluma"],
    ["Karol G", "Rosalía"], ["Anuel AA", "Farruko"],
    ["Rauw Alejandro", "Feid"], ["Ozuna", "Nicky Jam"],
    ["Quevedo", "Rels B"], ["Jhayco", "Mora"],
    ["Blessd", "Ryan Castro"], ["Shakira", "Karol G"],
    ["Bizarrap", "Trueno"], ["Myke Towers", "Arcángel"],
    ["Eladio Carrión", "Lunay"], ["Wisin y Yandel", "Zion y Lennox"],
    ["Residente", "Vico C"], ["C. Tangana", "Morad"],
    ["Duki", "Khea"], ["El Alfa", "Chimbala"],
    ["Becky G", "Natti Natasha"], ["Tego Calderón", "Don Omar"],
    ["Beny Jr", "Morad"], ["Saiko", "DELLAFUENTE"],
    ["Tainy", "Sky Rompiendo"], ["Romeo Santos", "Aventura"],
    ["Luis Fonsi", "Ricky Martin"], ["Sebastián Yatra", "Manuel Turizo"],
    ["Paulo Londra", "Duki"], ["Tokischa", "La Materialista"],
  ],
  // +++ YouTubers / Streamers +++
  YouTubers: [
    ["Ibai", "ElRubius"], ["Auronplay", "TheGrefg"],
    ["Vegetta777", "Willyrex"], ["DjMaRiiO", "TheGrefg"],
    ["Jordi Wild", "Ter"], ["JuanSGuarnizo", "Spreen"],
    ["MrBeast", "Dude Perfect"], ["PewDiePie", "Markiplier"],
    ["Mikecrack", "Vegetta777"], ["xBuyer", "Outconsumer"],
    ["Quackity", "Luzu"], ["Alexby11", "Mangel"],
    ["Ari Gameplays", "Carola"], ["IlloJuan", "Cristinini"],
    ["Knekro", "Perxitaa"], ["BarbeQ", "Ampeterby7"],
    ["Jaime Altozano", "Jaime Lorente"], ["Dalas Review", "Reven"],
    ["Wismichu", "Loulogio"], ["Fernanfloo", "HolaSoyGerman"],
    ["Ninja", "DrLupo"], ["Shroud", "Summit1g"],
    ["KManus88", "Elded"], ["Coscu", "Zeko"],
    ["Rivers", "Lana"], ["xFaRgAnx", "Folagor"],
  ],
  // +++ Videojuegos +++
  Videojuegos: [
    ["Minecraft", "Roblox"], ["Fortnite", "Apex Legends"],
    ["GTA V", "Saints Row"], ["FIFA", "eFootball"],
    ["League of Legends", "Smite"], ["Valorant", "Overwatch"],
    ["Call of Duty", "Halo"], ["Mario Bros", "Crash Bandicoot"],
    ["Zelda", "Skyrim"], ["God of War", "Kratos"],
    ["The Last of Us", "Uncharted"], ["Among Us", "Fall Guys"],
    ["Pokémon", "Temtem"], ["Animal Crossing", "The Sims"],
    ["CS2", "Valorant"], ["Skyrim", "Oblivion"],
    ["Rocket League", "FIFA Street"], ["Clash Royale", "Hearthstone"],
    ["Elden Ring", "Dark Souls"], ["Roblox", "Minecraft"],
    ["Hollow Knight", "Ori"], ["Undertale", "Earthbound"],
    ["Hades", "Bastion"], ["Cyberpunk 2077", "Deus Ex"],
    ["Spider-Man PS5", "Infamous"], ["Wii Sports", "Mario Party"],
    ["Terraria", "Starbound"], ["Destiny", "Warframe"],
  ],
  // +++ Marcas +++
  Marcas: [
    ["Nike", "Puma"], ["Apple", "Microsoft"],
    ["Coca-Cola", "Fanta"], ["McDonald's", "KFC"],
    ["Netflix", "Prime Video"], ["Spotify", "YouTube Music"],
    ["PlayStation", "Nintendo"], ["Zara", "Mango"],
    ["Google", "Yahoo"], ["Amazon", "eBay"],
    ["WhatsApp", "Signal"], ["Instagram", "Snapchat"],
    ["YouTube", "Vimeo"], ["Twitter/X", "Mastodon"],
    ["Mercedes", "Audi"], ["Ferrari", "Porsche"],
    ["Telepizza", "Domino's"], ["KFC", "McDonald's"],
    ["Uber", "Lyft"], ["Glovo", "Uber Eats"],
    ["Primark", "Pull&Bear"], ["IKEA", "Conforama"],
    ["Red Bull", "Burn"], ["Mercadona", "Día"],
    ["El Corte Inglés", "Fnac"], ["Wallapop", "Milanuncios"],
    ["ChatGPT", "Claude"], ["Disney+", "Netflix"],
    ["Adidas", "Reebok"], ["Burger King", "Carl's Jr"],
  ],
  // +++ Famosos y Polémicas +++
  Famosos: [
    ["Elon Musk", "Mark Zuckerberg"], ["Kim Kardashian", "Kylie Jenner"],
    ["Donald Trump", "Joe Biden"], ["Shakira", "Bizarrap"],
    ["Taylor Swift", "Olivia Rodrigo"], ["Drake", "Travis Scott"],
    ["The Rock", "John Cena"], ["Belén Esteban", "Kiko Matamoros"],
    ["Jorge Javier Vázquez", "Jesús Vázquez"], ["Amaia Montero", "Shakira"],
    ["Leticia Sabater", "Chabelita Pantoja"], ["Santiago Abascal", "Ayuso"],
    ["Pedro Sánchez", "Feijóo"], ["Iker Casillas", "Piqué"],
    ["Penélope Cruz", "Antonio Banderas"], ["Bad Gyal", "Nathy Peluso"],
    ["David Broncano", "Andreu Buenafuente"], ["Pocholo", "Alfonso Díez"],
    ["Tamara Falcó", "Ana Boyer"], ["Lola Índigo", "Belén Aguilera"],
    ["Amancio Ortega", "Carlos Slim"], ["Alejandro Sanz", "Pablo Alborán"],
    ["Dabiz Muñoz", "Martín Berasategui"], ["Isabel Pantoja", "Rocío Jurado"],
    ["Bisbal", "Alejandro Sanz"], ["Chanel", "Cornelia Jakobs"],
    ["Cristina Pedroche", "Lalachus"], ["Joaquín", "Dani Rovira"],
  ],
  // +++ Comida Basura / Guilty Pleasures +++
  ComidaBasura: [
    ["Pizza", "Lasaña"], ["Hamburguesa", "Bocadillo"],
    ["Nuggets", "Alitas"], ["Patatas fritas", "Patatas bravas"],
    ["Doritos", "Ruffles"], ["Donut", "Berlina"],
    ["Helado", "Polo"], ["Churros", "Buñuelos"],
    ["Gofre", "Tortitas"], ["Nachos", "Totopos"],
    ["Palomitas", "Frutos secos"], ["Bollycao", "Tigretón"],
    ["Nocilla", "Crema de cacao"], ["ColaCao", "Cola Cao Turbo"],
    ["Fanta", "Sprite"], ["Kinder Bueno", "Ferrero Rocher"],
    ["Oreo", "Príncipe"], ["Gominolas", "Nubes"],
    ["Tarta de queso", "Tiramisú"], ["Batido", "Smoothie"],
    ["Wrap", "Durum"], ["Croquetas", "Flamenquines"],
    ["Cachopo", "San Jacobo"], ["Bocadillo calamares", "Bocadillo lomo"],
    ["Torreznos", "Oreja"], ["Ensaladilla rusa", "Patatas alioli"],
    ["Kebab", "Durum"], ["Tequeños", "Croquetas"],
  ],
};

// +++ Custom Category CRUD (localStorage) +++

export function loadCustomCategories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

export function saveCustomCategories(cats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cats)); }
  catch { /* storage full */ }
}

export function addCustomCategory(name, pairs) {
  const c = loadCustomCategories();
  c[name] = pairs;
  saveCustomCategories(c);
  return c;
}

export function updateCustomCategory(name, pairs) {
  const c = loadCustomCategories();
  c[name] = pairs;
  saveCustomCategories(c);
  return c;
}

export function deleteCustomCategory(name) {
  const c = loadCustomCategories();
  delete c[name];
  saveCustomCategories(c);
  return c;
}

export function getBuiltInAdditions() {
  try {
    const data = localStorage.getItem(ADDITIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

export function addPairsToBuiltIn(catName, newPairs) {
  try {
    const additions = getBuiltInAdditions();
    if (!additions[catName]) additions[catName] = [];
    additions[catName] = [...additions[catName], ...newPairs];
    localStorage.setItem(ADDITIONS_KEY, JSON.stringify(additions));
    return additions;
  } catch { return {}; }
}

// +++ Merged data API +++

export function getAllPacks() {
  const additions = getBuiltInAdditions();
  const custom = loadCustomCategories();
  const merged = {};
  for (const [cat, pairs] of Object.entries(builtInPacks)) {
    merged[cat] = [...pairs, ...(additions[cat] || [])];
  }
  for (const [cat, pairs] of Object.entries(custom)) {
    merged[cat] = pairs;
  }
  return merged;
}

export function getBuiltInCategories() {
  return Object.keys(builtInPacks);
}

export function getCustomCategoryNames() {
  return Object.keys(loadCustomCategories());
}

export function getCategories() {
  return [...Object.keys(builtInPacks), ...getCustomCategoryNames()];
}

export function getCategoryPairs(category) {
  const all = getAllPacks();
  return all[category] || [];
}

export function isBuiltIn(category) {
  return category in builtInPacks;
}

export function getRandomPair(category) {
  const pairs = getCategoryPairs(category);
  if (!pairs || pairs.length === 0) return null;
  return pairs[Math.floor(Math.random() * pairs.length)];
}

export function getRandomPairFromAny() {
  const categories = getCategories();
  if (!categories.length) return null;
  const cat = categories[Math.floor(Math.random() * categories.length)];
  return { pair: getRandomPair(cat), category: cat };
}

export function getRandomPairFromCategories(selected) {
  if (!selected || !selected.length) return getRandomPairFromAny();
  const cat = selected[Math.floor(Math.random() * selected.length)];
  const pair = getRandomPair(cat);
  if (!pair) return getRandomPairFromAny();
  return { pair, category: cat };
}

export default builtInPacks;
