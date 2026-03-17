const crisisPhrases = [
  "i want to die",
  "i dont want to live",
  "i don't want to live",
  "kill myself",
  "end my life",
  "suicide",
  "i wanna die",
  "i feel like dying",
  "i cant go on",
  "life is not worth it",
  "i hate my life",
];

// Normalize text (same logic as badWords)
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export function detectCrisis(text) {
  const normalizedText = normalize(text);

  return crisisPhrases.some((phrase) => {
    const normalizedPhrase = normalize(phrase);
    return normalizedText.includes(normalizedPhrase);
  });
}