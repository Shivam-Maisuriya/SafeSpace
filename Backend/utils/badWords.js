const bannedWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "kill yourself",
  "die",
  "stupid",
  "idiot"
];

export function containsBadWords(text) {
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => lowerText.includes(word));
}
