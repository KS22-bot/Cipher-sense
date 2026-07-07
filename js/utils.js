export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function formatLargeNumber(value) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value < 1_000_000) return Math.round(value).toLocaleString();
  const exponent = Math.floor(Math.log10(value));
  const mantissa = value / 10 ** exponent;
  return `${mantissa.toFixed(2)}e+${exponent}`;
}

export function formatBits(bits) {
  return `${Math.max(0, bits).toFixed(bits >= 100 ? 0 : 1)} bits`;
}

export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

export async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
