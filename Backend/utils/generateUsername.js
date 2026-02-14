const adjectives = ["Quiet", "Blue", "Soft", "Brave", "Lonely", "Gentle"];
const nouns = ["River", "Sky", "Star", "Leaf", "Ocean", "Flame"];

export default function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adj}${noun}${number}`;
}
