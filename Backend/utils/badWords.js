const bannedWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "kill yourself",
  "die",
  "stupid",
  "idiot",
];

// Normalize text (remove symbols & spaces)
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove symbols
    .replace(/\s+/g, ""); // remove spaces
}

export function containsBadWords(text) {
  const normalizedText = normalize(text);

  return bannedWords.some((word) => {
    const normalizedWord = normalize(word);
    return normalizedText.includes(normalizedWord);
  });
}