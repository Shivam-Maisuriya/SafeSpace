const crisisPhrases = [
  "i want to die",
  "i don't want to live",
  "kill myself",
  "end my life",
  "suicide"
];

export function detectCrisis(text) {
  const lowerText = text.toLowerCase();
  return crisisPhrases.some(phrase => lowerText.includes(phrase));
}
