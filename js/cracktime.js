const ATTACK_SCENARIOS = [
  { name: "Consumer laptop", guessesPerSecond: 50_000_000 },
  { name: "Gaming PC", guessesPerSecond: 1_000_000_000 },
  { name: "High-end GPU", guessesPerSecond: 25_000_000_000 },
  { name: "GPU cluster", guessesPerSecond: 1_000_000_000_000 },
  { name: "Offline attack", guessesPerSecond: 100_000_000_000_000 },
];

export function estimateCrackTimes(entropyBits) {
  const combinations = 2 ** Math.min(entropyBits, 1023);
  return ATTACK_SCENARIOS.map((scenario) => {
    const seconds = combinations / 2 / scenario.guessesPerSecond;
    return {
      ...scenario,
      seconds,
      label: formatDuration(seconds),
      weight: durationWeight(seconds),
    };
  });
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 1) return "Instant";
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30.44;
  const year = day * 365.25;
  const century = year * 100;
  const millionYears = year * 1_000_000;

  if (seconds < minute) return "Seconds";
  if (seconds < hour) return "Minutes";
  if (seconds < day) return "Hours";
  if (seconds < month) return "Days";
  if (seconds < year) return "Months";
  if (seconds < century) return "Years";
  if (seconds < millionYears) return "Centuries";
  return "Millions of years";
}

function durationWeight(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(100, Math.max(5, Math.log10(seconds + 1) * 6));
}
