// ── Entry point ────────────────────────────────────────────────────
// Wires up all DOM event listeners and runs the initial render.
// Loaded as a module: <script type="module" src="js/main.js">

import { EVENTS } from "./data.js";
import {
  detectTZ,
  detectRegion,
  toggleTZ,
  onTZRegionChange,
} from "./timezone.js";
import { buildFilters, switchTab, tabKeydown, setView } from "./ui.js";
import { renderCards } from "./cards.js";
import { populateCalcSelect, setCalcMode, onEventSelect, recalc } from "./calculator.js";

// ── Wire up static controls ────────────────────────────────────────
function wireEvents() {
  // Timezone region select + DST toggle
  var region = document.getElementById("tz-region-select");
  if (region) region.addEventListener("change", onTZRegionChange);
  var tzBtn = document.getElementById("tz-toggle-btn");
  if (tzBtn) tzBtn.addEventListener("click", toggleTZ);

  // Tabs
  var tabCards = document.getElementById("tabbtn-cards");
  var tabCalc = document.getElementById("tabbtn-calc");
  if (tabCards) {
    tabCards.addEventListener("click", function () {
      switchTab("cards", tabCards);
    });
    tabCards.addEventListener("keydown", tabKeydown);
  }
  if (tabCalc) {
    tabCalc.addEventListener("click", function () {
      switchTab("calc", tabCalc);
    });
    tabCalc.addEventListener("keydown", tabKeydown);
  }

  // View toggle (Cards / Table)
  document.querySelectorAll(".view-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.textContent.toLowerCase().indexOf("table") >= 0
        ? "table"
        : "cards";
      setView(mode, btn);
    });
  });

  // Calculator: event select, mode toggle, number inputs
  var calcEvent = document.getElementById("calc-event");
  if (calcEvent) calcEvent.addEventListener("change", onEventSelect);

  var modeTarget = document.getElementById("mode-target-btn");
  var modeTime = document.getElementById("mode-time-btn");
  if (modeTarget)
    modeTarget.addEventListener("click", function () {
      setCalcMode("target");
    });
  if (modeTime)
    modeTime.addEventListener("click", function () {
      setCalcMode("time");
    });

  ["calc-current", "calc-target", "calc-hours"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", recalc);
  });
}

// ── Init ───────────────────────────────────────────────────────────
detectTZ();
detectRegion();

EVENTS.sort(function (a, b) {
  return a.name.localeCompare(b.name);
});

wireEvents();
buildFilters();
document.getElementById("tab-cards").classList.add("show-cards");
renderCards();
populateCalcSelect();
