import { estimateEntropy } from "./entropy.js";

const SETS = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*_-+=?~",
};

const AMBIGUOUS = /[O0Il1|`'"]/g;

export function generatePassword(options) {
  const enabledSets = [];
  if (options.upper) enabledSets.push(SETS.upper);
  if (options.lower) enabledSets.push(SETS.lower);
  if (options.numbers) enabledSets.push(SETS.numbers);
  if (options.symbols) enabledSets.push(SETS.symbols);
  if (!enabledSets.length) enabledSets.push(SETS.lower);

  const cleanedSets = enabledSets.map((set) => (options.avoidAmbiguous ? set.replace(AMBIGUOUS, "") : set)).filter(Boolean);
  const pool = cleanedSets.join("");
  const required = cleanedSets.map((set) => randomChar(set));
  const remaining = Array.from({ length: Math.max(0, options.length - required.length) }, () => randomChar(pool));
  return shuffle([...required, ...remaining]).join("");
}

export function generatedStats(password) {
  return estimateEntropy(password);
}

function randomChar(characters) {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return characters[bytes[0] % characters.length];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const swapIndex = bytes[0] % (index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
