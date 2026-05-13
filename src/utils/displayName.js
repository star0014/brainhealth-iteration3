// ─────────────────────────────────────────────────────────────────────────────
// displayName.js — generates and persists a fun random display name for guests.
//
// Format: "[Adjective] [Animal] #[1000-9999]"
// Example: "Cosmic Quokka #4821"
//
// The generated name is stored in localStorage under 'bb_display_name' so the
// same user always appears with the same name on the leaderboard.
// Signed-in Clerk users pass their first name from the frontend instead.
// ─────────────────────────────────────────────────────────────────────────────

const ADJECTIVES = [
  'Cosmic', 'Turbo', 'Neon', 'Speedy', 'Crispy', 'Zesty', 'Rogue', 'Hyper',
  'Stealth', 'Fuzzy', 'Spicy', 'Mighty', 'Cheeky', 'Snappy', 'Blazing',
  'Jolly', 'Savage', 'Sneaky', 'Groovy', 'Funky', 'Zippy', 'Dizzy', 'Wacky',
  'Bouncy', 'Goofy', 'Salty', 'Peppy', 'Witty', 'Quirky', 'Zany', 'Brave',
  'Chill', 'Slick', 'Fluffy', 'Grumpy', 'Peppy', 'Silky', 'Lucky', 'Plucky',
  'Sunny', 'Stormy', 'Frosty', 'Lively', 'Rapid', 'Swift', 'Keen', 'Bold',
  'Sharp', 'Fancy', 'Sassy',
]

const ANIMALS = [
  'Quokka', 'Koala', 'Platypus', 'Wombat', 'Dingo', 'Bilby', 'Echidna',
  'Panda', 'Capybara', 'Axolotl', 'Meerkat', 'Narwhal', 'Fennec', 'Sloth',
  'Pangolin', 'Okapi', 'Tapir', 'Binturong', 'Quoll', 'Numbat', 'Potoroo',
  'Wallaby', 'Possum', 'Bandicoot', 'Cassowary', 'Kookaburra', 'Lorikeet',
  'Galah', 'Dugong', 'Tanuki', 'Quetzal', 'Fossa', 'Aye-aye', 'Tarsier',
  'Caracal', 'Serval', 'Margay', 'Ocelot', 'Kinkajou', 'Coati', 'Peccary',
  'Tapir', 'Vicuna', 'Alpaca', 'Guanaco', 'Viscacha', 'Chinchilla', 'Degu',
  'Caiman', 'Tamarin',
]

// Returns a random element from an array.
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Returns a random 4-digit number between 1000 and 9999.
function randomNumber() {
  return Math.floor(Math.random() * 9000) + 1000
}

// Returns the stored display name for this browser session, generating and
// persisting one if it doesn't exist yet.
export function getOrCreateDisplayName() {
  const stored = localStorage.getItem('bb_display_name')
  if (stored) return stored
  const name = `${pick(ADJECTIVES)} ${pick(ANIMALS)} #${randomNumber()}`
  localStorage.setItem('bb_display_name', name)
  return name
}
