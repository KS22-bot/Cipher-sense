import { formatLargeNumber } from "./utils.js";

export function characterPool(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 33;
  return pool;
}

export function estimateEntropy(password) {
  if (!password) {
    return { bits: 0, combinations: 0, pool: 0, difficulty: "Trivial" };
  }

  const pool = characterPool(password);
  const rawBits = password.length * Math.log2(Math.max(pool, 1));
  const uniqueRatio = new Set(password).size / password.length;
  const adjustedBits = rawBits * (0.72 + uniqueRatio * 0.28);
  const bits = Math.max(0, adjustedBits);
  const combinations = 2 ** Math.min(bits, 1023);

  return {
    bits,
    combinations,
    pool,
    difficulty: difficultyLabel(bits),
    formattedCombinations: formatLargeNumber(combinations),
  };
}

export function difficultyLabel(bits) {
  if (bits < 28) return "Trivial";
  if (bits < 45) return "Low";
  if (bits < 65) return "Moderate";
  if (bits < 90) return "Difficult";
  if (bits < 120) return "Extreme";
  return "Astronomical";
}
