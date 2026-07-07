import { $, $$, copyText, debounce, formatBits, formatLargeNumber } from "./utils.js";
import { analyzePassword } from "./strength.js";
import { checkPwnedPassword } from "./hibp.js";
import { generatePassword, generatedStats } from "./generator.js";
import { renderAnalysis, renderEducation, refreshIcons, setBreachMessage } from "./ui.js";

const passwordInput = $("#password-input");
let currentAnalysis = analyzePassword("");

function updateAnalysis() {
  currentAnalysis = analyzePassword(passwordInput.value);
  renderAnalysis(currentAnalysis, $("#breach-widget").textContent);
  rememberLocalReuseSignal(passwordInput.value);
}

function rememberLocalReuseSignal(password) {
  if (!password || password.length < 8) return;
  const key = `ciphersense_seen_${password.length}_${password.charCodeAt(0)}_${password.charCodeAt(password.length - 1)}`;
  const seen = localStorage.getItem(key);
  if (seen) {
    $("#recommendations").insertAdjacentHTML(
      "afterbegin",
      `<article class="recommendation"><h4>Password reuse warning</h4><p>A similar local fingerprint was analyzed before. Use unique passwords for every account.</p></article>`,
    );
  }
  localStorage.setItem(key, "1");
}

async function runBreachCheck() {
  const button = $("#breach-check");
  button.disabled = true;
  button.innerHTML = `<i data-lucide="loader"></i>Checking`;
  refreshIcons();

  try {
    const result = await checkPwnedPassword(passwordInput.value);
    setBreachMessage(result);
  } catch (error) {
    setBreachMessage({
      status: "empty",
      message: "Breach check is unavailable. Confirm your internet connection and try again.",
    });
  } finally {
    button.disabled = false;
    button.innerHTML = `<i data-lucide="radar"></i>Check breaches`;
    refreshIcons();
  }
}

function setupGenerator() {
  const controls = {
    length: $("#length-slider"),
    upper: $("#gen-upper"),
    lower: $("#gen-lower"),
    numbers: $("#gen-numbers"),
    symbols: $("#gen-symbols"),
    ambiguous: $("#gen-ambiguous"),
  };

  const readOptions = () => ({
    length: Number(controls.length.value),
    upper: controls.upper.checked,
    lower: controls.lower.checked,
    numbers: controls.numbers.checked,
    symbols: controls.symbols.checked,
    avoidAmbiguous: controls.ambiguous.checked,
  });

  const updateGenerated = () => {
    $("#length-value").textContent = controls.length.value;
    const password = generatePassword(readOptions());
    const stats = generatedStats(password);
    $("#generated-password").textContent = password;
    $("#generated-entropy").textContent = formatBits(stats.bits);
    $("#generated-space").textContent = stats.formattedCombinations || formatLargeNumber(stats.combinations);
  };

  $("#generate-password").addEventListener("click", updateGenerated);
  $("#copy-generated").addEventListener("click", async () => {
    const copied = await copyText($("#generated-password").textContent);
    $("#copy-generated").innerHTML = copied ? `<i data-lucide="check"></i>Copied` : `<i data-lucide="copy-x"></i>Copy failed`;
    refreshIcons();
    window.setTimeout(() => {
      $("#copy-generated").innerHTML = `<i data-lucide="copy"></i>Copy`;
      refreshIcons();
    }, 1400);
  });

  Object.values(controls).forEach((control) => control.addEventListener("input", updateGenerated));
  updateGenerated();
}

function setupTheme() {
  const savedTheme = localStorage.getItem("ciphersense_theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;

  $$(".theme-option").forEach((button) => {
    const active = button.dataset.theme === savedTheme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
    button.addEventListener("click", () => {
      document.documentElement.dataset.theme = button.dataset.theme;
      localStorage.setItem("ciphersense_theme", button.dataset.theme);
      $$(".theme-option").forEach((option) => {
        const selected = option === button;
        option.classList.toggle("active", selected);
        option.setAttribute("aria-checked", String(selected));
      });
    });
  });
}

function setupNavigation() {
  const toggle = $(".nav-toggle");
  const nav = $("#main-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("#main-nav a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("open")));
}

function setupPasswordControls() {
  passwordInput.addEventListener("input", debounce(updateAnalysis, 80));
  $("#clear-password").addEventListener("click", () => {
    passwordInput.value = "";
    setBreachMessage({ status: "empty", message: "Breach check has not run." });
    updateAnalysis();
    passwordInput.focus();
  });
  $("#toggle-visibility").addEventListener("click", () => {
    const hidden = passwordInput.classList.toggle("is-masked");
    $("#toggle-visibility").setAttribute("aria-label", hidden ? "Show password" : "Hide password");
    $("#toggle-visibility").innerHTML = hidden ? `<i data-lucide="eye"></i>` : `<i data-lucide="eye-off"></i>`;
    refreshIcons();
  });
  $("#breach-check").addEventListener("click", runBreachCheck);
}

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupNavigation();
  setupPasswordControls();
  setupGenerator();
  renderEducation();
  updateAnalysis();
  refreshIcons();
});
