import { estimateEntropy } from "./entropy.js";
import { detectPatterns, hasCommonWord, patternPenalty } from "./patterns.js";
import { clamp } from "./utils.js";

export function analyzePassword(password) {
  const entropy = estimateEntropy(password);
  const patterns = detectPatterns(password);
  const checks = createChecks(password, entropy, patterns);
  const diversity = countDiversity(password);
  const repeatedPenalty = /(.)\1{2,}/.test(password) ? 8 : 0;
  const score = clamp(
    Math.round(
      Math.min(40, password.length * 2.4) +
        Math.min(28, entropy.bits * 0.32) +
        diversity * 7 -
        patternPenalty(patterns) -
        repeatedPenalty,
    ),
    0,
    100,
  );

  return {
    password,
    score,
    label: strengthLabel(score),
    grade: grade(score),
    entropy,
    patterns,
    checks,
    diversity,
    recommendations: recommendations(password, entropy, patterns, checks),
  };
}

function createChecks(password, entropy, patterns) {
  return [
    { key: "length", label: "Length of at least 12 characters", pass: password.length >= 12 },
    { key: "upper", label: "Uppercase letters", pass: /[A-Z]/.test(password) },
    { key: "lower", label: "Lowercase letters", pass: /[a-z]/.test(password) },
    { key: "number", label: "Numbers", pass: /[0-9]/.test(password) },
    { key: "symbol", label: "Symbols", pass: /[^A-Za-z0-9]/.test(password) },
    { key: "repeat", label: "No repeated patterns", pass: !patterns.some((item) => item.type === "repeat" || item.type === "reused-pattern") },
    { key: "keyboard", label: "No keyboard patterns", pass: !patterns.some((item) => item.type === "keyboard") },
    { key: "common", label: "No common words", pass: !hasCommonWord(password) },
    { key: "entropy", label: "Good entropy", pass: entropy.bits >= 65 },
    { key: "unique", label: "Good uniqueness", pass: password.length > 0 && new Set(password).size / password.length > 0.58 },
  ];
}

function countDiversity(password) {
  return [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((regex) => regex.test(password)).length;
}

function strengthLabel(score) {
  if (score < 25) return "Very Weak";
  if (score < 45) return "Weak";
  if (score < 65) return "Fair";
  if (score < 82) return "Strong";
  return "Very Strong";
}

function grade(score) {
  if (score >= 92) return "A+";
  if (score >= 82) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function recommendations(password, entropy, patterns, checks) {
  const tips = [];
  const add = (title, why) => tips.push({ title, why });

  if (password.length < 16) add("Increase password length", "Each extra character multiplies the search space and usually improves security more than symbol substitution.");
  if (!checks.find((item) => item.key === "symbol")?.pass) add("Add unique symbols", "Symbols expand the character pool and make brute-force guesses less efficient.");
  if (patterns.some((item) => item.type === "sequence")) add("Remove sequential numbers or letters", "Attackers test predictable runs like 1234 and abcd very early.");
  if (patterns.some((item) => item.type === "dictionary" || item.type === "common")) add("Avoid dictionary words", "Dictionary attacks combine common words with numbers and symbols at high speed.");
  if (patterns.some((item) => item.type === "repeat" || item.type === "reused-pattern")) add("Break repeated patterns", "Repeated chunks lower effective entropy because they are easier to model.");
  if (entropy.bits < 65) add("Use a longer passphrase", "Several unrelated words plus separators can create high entropy while staying memorable.");
  add("Use a password manager", "Unique generated passwords prevent one leaked account from endangering another.");
  add("Enable MFA", "Multi-factor authentication adds a second barrier if a password is guessed or stolen.");

  return tips.slice(0, 5);
}
