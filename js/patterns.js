const COMMON_PASSWORDS = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "welcome",
  "admin",
  "letmein",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "login",
  "princess",
  "master",
  "sunshine",
  "shadow",
  "trustno1",
];

const DICTIONARY_WORDS = [
  "password",
  "welcome",
  "admin",
  "login",
  "secret",
  "summer",
  "winter",
  "spring",
  "autumn",
  "family",
  "company",
  "school",
  "college",
  "computer",
  "security",
  "cipher",
  "sense",
  "india",
  "mumbai",
  "delhi",
  "kashi",
];

const KEYBOARD_PATTERNS = [
  "qwerty",
  "asdf",
  "zxcv",
  "qaz",
  "wsx",
  "1qaz",
  "2wsx",
  "qwe",
  "asd",
  "zxc",
  "poiuy",
  "lkj",
];

function hasSequentialRun(input, minLength = 4) {
  const lowered = input.toLowerCase();
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"];
  return sequences.some((sequence) => {
    for (let index = 0; index <= sequence.length - minLength; index += 1) {
      const chunk = sequence.slice(index, index + minLength);
      if (lowered.includes(chunk) || lowered.includes([...chunk].reverse().join(""))) return true;
    }
    return false;
  });
}

function hasBirthday(input) {
  return /\b(19[0-9]{2}|20[0-2][0-9])\b/.test(input) || /\b(0?[1-9]|[12][0-9]|3[01])[-/.]?(0?[1-9]|1[0-2])[-/.]?([0-9]{2,4})\b/.test(input);
}

export function detectPatterns(password) {
  const lowered = password.toLowerCase();
  const findings = [];
  const add = (type, severity, message) => findings.push({ type, severity, message });

  if (!password) return findings;
  if (COMMON_PASSWORDS.some((word) => lowered === word || lowered.includes(word))) {
    add("common", "high", "Contains a common password or credential stuffing target.");
  }
  if (DICTIONARY_WORDS.some((word) => word.length >= 5 && lowered.includes(word))) {
    add("dictionary", "medium", "Includes dictionary words that attackers try early.");
  }
  if (KEYBOARD_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    add("keyboard", "high", "Contains keyboard walks such as qwerty, asdf, or adjacent keys.");
  }
  if (hasSequentialRun(password)) {
    add("sequence", "high", "Contains sequential characters such as 1234 or abcd.");
  }
  if (/(.)\1{2,}/i.test(password)) {
    add("repeat", "medium", "Contains repeated characters that reduce unpredictability.");
  }
  if (/(..+)\1{1,}/i.test(password)) {
    add("reused-pattern", "medium", "Repeats a larger pattern, making it easier to guess.");
  }
  if (hasBirthday(password)) {
    add("personal", "medium", "Looks like it may contain a date or birthday.");
  }

  return findings;
}

export function patternPenalty(findings) {
  return findings.reduce((total, finding) => total + (finding.severity === "high" ? 14 : 8), 0);
}

export function hasCommonWord(password) {
  const lowered = password.toLowerCase();
  return [...COMMON_PASSWORDS, ...DICTIONARY_WORDS].some((word) => lowered.includes(word));
}
