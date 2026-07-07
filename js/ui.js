import { $, $$, formatBits, formatLargeNumber } from "./utils.js";
import { estimateCrackTimes } from "./cracktime.js";

export const EDUCATION_TOPICS = [
  ["Password entropy", "Entropy measures unpredictability. Higher entropy means a larger search space for attackers."],
  ["Hashing", "A hash turns input into a fixed fingerprint. Good systems store password hashes, not plain passwords."],
  ["SHA-1", "SHA-1 is no longer recommended for new password storage, but HIBP uses hash prefixes for private breach lookup."],
  ["k-Anonymity", "Range queries hide your exact password hash among many possible suffixes."],
  ["Credential stuffing", "Attackers try leaked username and password pairs across many sites."],
  ["Rainbow tables", "Precomputed hash tables can reverse weak unsalted hashes quickly."],
  ["Brute force attacks", "Brute force tries every possibility. Length and entropy make this expensive."],
  ["Dictionary attacks", "Dictionary attacks prioritize common words, names, dates, and predictable substitutions."],
  ["Password managers", "Managers create and remember unique high-entropy passwords for every account."],
  ["Passphrases", "Several unrelated words can be easier to remember and much harder to guess."],
  ["Multi-factor authentication", "MFA reduces account takeover risk even when a password leaks."],
];

export function renderAnalysis(analysis, breachState = "Unchecked") {
  $(".score-gauge").style.setProperty("--score", analysis.score);
  $("#score-value").textContent = analysis.score;
  $("#score-label").textContent = analysis.label;
  $("#score-summary").textContent = scoreSummary(analysis);
  $("#entropy-widget").textContent = formatBits(analysis.entropy.bits);
  $("#crack-widget").textContent = estimateCrackTimes(analysis.entropy.bits).at(-1).label;
  $("#breach-widget").textContent = breachState;
  $("#diversity-widget").textContent = `${analysis.diversity} classes`;
  $("#space-widget").textContent = analysis.entropy.formattedCombinations || formatLargeNumber(analysis.entropy.combinations);
  $("#grade-widget").textContent = analysis.grade;
  $("#entropy-value").textContent = formatBits(analysis.entropy.bits);
  $("#combinations-value").textContent = analysis.entropy.formattedCombinations || "0";
  $("#difficulty-value").textContent = analysis.entropy.difficulty;

  $("#checklist").innerHTML = analysis.checks
    .map((item) => `<li class="${item.pass ? "pass" : "fail"}"><i data-lucide="${item.pass ? "check" : "x"}"></i>${item.label}</li>`)
    .join("");

  $("#patterns-list").innerHTML = analysis.patterns.length
    ? analysis.patterns.map((item) => `<div class="finding ${item.severity}">${item.message}</div>`).join("")
    : `<div class="finding">No obvious weak patterns detected.</div>`;

  $("#crack-times").innerHTML = estimateCrackTimes(analysis.entropy.bits)
    .map(
      (item) => `
        <div class="timeline-row">
          <span>${item.name}</span>
          <span class="timeline-track"><span class="timeline-fill" style="--width: ${item.weight}%"></span></span>
          <strong>${item.label}</strong>
        </div>
      `,
    )
    .join("");

  $("#recommendations").innerHTML = analysis.recommendations
    .map((item) => `<article class="recommendation"><h4>${item.title}</h4><p>${item.why}</p></article>`)
    .join("");

  refreshIcons();
}

export function renderEducation() {
  $("#education-grid").innerHTML = EDUCATION_TOPICS.map(
    ([title, content], index) => `
      <article class="glass topic ${index === 0 ? "open" : ""}">
        <button type="button" aria-expanded="${index === 0}" aria-controls="topic-${index}">
          <span>${title}</span><i data-lucide="chevron-down"></i>
        </button>
        <div id="topic-${index}" class="topic-content"><div>${content}</div></div>
      </article>
    `,
  ).join("");

  $$(".topic button").forEach((button) => {
    button.addEventListener("click", () => {
      const topic = button.closest(".topic");
      const open = topic.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  });
  refreshIcons();
}

export function setBreachMessage(result) {
  const message = $("#breach-message");
  message.textContent = result.message;
  message.className = `breach-message ${result.status === "found" ? "danger" : result.status === "safe" ? "safe" : "neutral"}`;
  $("#breach-widget").textContent = result.status === "found" ? "Found" : result.status === "safe" ? "Not found" : "Unchecked";
}

export function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function scoreSummary(analysis) {
  if (!analysis.password) return "Start typing to see a complete security profile.";
  if (analysis.score >= 82) return "Excellent structure. Keep it unique and store it in a password manager.";
  if (analysis.score >= 65) return "Solid base. A little more length or unpredictability would improve it.";
  if (analysis.score >= 45) return "Usable only with caution. Remove predictable words or patterns.";
  return "High risk. Choose a longer, unique password or generate one below.";
}
