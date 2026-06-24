// ── UI: view switching, tabs, filter bar, live region ──────────────
import { EVENTS } from "./data.js";
import { renderCards } from "./cards.js";
import { renderTable, renderMobileTable } from "./table.js";
import { populateCalcSelect } from "./calculator.js";
import { REWARD_FILTERS, SCOPE_FILTERS, IMGS } from "./data.js";
import { gimg } from "./utils.js";
import { setActiveRewardFilter, setActiveScopeFilter,
         cardMatchesFilters } from "./filters.js";
import { buildTitleSearchRow } from "./search.js";
import { updateTZButton } from "./timezone.js";

/** Current display mode: 'cards' or 'table'. */
let viewMode = "cards";

/** Switches between card and table views and re-renders.
 *  In table mode, both the full table and the streamlined mobile table
 *  are rendered; CSS shows the right one for the screen width. */
export function setView(mode, btn) {
  viewMode = mode;
  document.querySelectorAll(".view-btn").forEach(function (b) {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
  }
  // Toggle a class on the events section so CSS can pick the view.
  var section = document.getElementById("tab-cards");
  section.classList.toggle("show-table", mode === "table");
  section.classList.toggle("show-cards", mode === "cards");
  if (mode === "cards") {
    renderCards();
  } else {
    renderTable();
    renderMobileTable();
  }
}

/** Renders whichever view is currently active. */
export function renderView() {
  if (viewMode === "cards") {
    renderCards();
  } else {
    renderTable();
    renderMobileTable();
  }
}

/** Dynamically builds the filter bar (reward tier, ranking type,
 *  timezone toggle, event search) and appends it to #filter-bar. */
export function buildFilters() {
  var bar = document.getElementById("filter-bar");
  bar.innerHTML = "";

  // Row 1: reward tier
  var row1 = document.createElement("div");
  row1.className = "filter-row";
  var lbl1 = document.createElement("span");
  lbl1.className = "filter-label";
  lbl1.textContent = "Reward tier:";
  row1.appendChild(lbl1);
  REWARD_FILTERS.forEach(function (f) {
    var ico = f.icon
      ? '<img src="' +
        IMGS[f.icon] +
        '" alt="" style="width:14px;height:14px;object-fit:contain">'
      : "";
    var btn = document.createElement("button");
    btn.className = "filter-chip" + (f.key === "all" ? " active" : "");
    btn.innerHTML = ico + f.label;
    btn.dataset.filterKey = f.key;
    btn.onclick = (function (fk, b) {
      return function () {
        setRewardFilter(fk, b);
      };
    })(f.key, btn);
    row1.appendChild(btn);
  });
  bar.appendChild(row1);

  // Row 2: scope
  var row2 = document.createElement("div");
  row2.className = "filter-row";
  var lbl2 = document.createElement("span");
  lbl2.className = "filter-label";
  lbl2.textContent = "Ranking type:";
  row2.appendChild(lbl2);
  SCOPE_FILTERS.forEach(function (f) {
    var btn = document.createElement("button");
    btn.className =
      "filter-chip scope-chip" + (f.key === "all" ? " active" : "");
    btn.innerHTML = f.label;
    btn.dataset.scopeKey = f.key;
    btn.onclick = (function (fk, b) {
      return function () {
        setScopeFilter(fk, b);
      };
    })(f.key, btn);
    row2.appendChild(btn);
  });
  bar.appendChild(row2);
  buildTitleSearchRow(bar);
}

/** Announces the visible result count to screen readers via the live region. */
export function announceCount(n) {
  var live = document.getElementById("result-count");
  if (live)
    live.textContent = n + (n === 1 ? " event" : " events") + " shown";
}

/** Switches the visible tab panel and updates ARIA state. */
export function switchTab(name, el) {
  document.querySelectorAll(".tab-panel").forEach(function (p) {
    p.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach(function (b) {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
    b.setAttribute("tabindex", "-1");
  });
  document.getElementById("tab-" + name).classList.add("active");
  el.classList.add("active");
  el.setAttribute("aria-selected", "true");
  el.setAttribute("tabindex", "0");
  if (name === "calc") populateCalcSelect();
}

/** Arrow-key navigation for the tablist (WCAG keyboard support). */
export function tabKeydown(e) {
  var tabs = Array.prototype.slice.call(
    document.querySelectorAll(".tab-btn"),
  );
  var i = tabs.indexOf(e.currentTarget);
  var next = -1;
  if (e.key === "ArrowRight" || e.key === "ArrowDown")
    next = (i + 1) % tabs.length;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
    next = (i - 1 + tabs.length) % tabs.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = tabs.length - 1;
  if (next >= 0) {
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }
}

/** Sets the active reward-tier filter and re-renders. */
export function setRewardFilter(f, el) {
  setActiveRewardFilter(f);
  document
    .querySelectorAll(".filter-chip:not(.scope-chip)")
    .forEach(function (c) {
      c.classList.remove("active");
    });
  el.classList.add("active");
  renderView();
}

/** Sets the active ranking-type filter and re-renders. */
export function setScopeFilter(f, el) {
  setActiveScopeFilter(f);
  document.querySelectorAll(".scope-chip").forEach(function (c) {
    c.classList.remove("active");
  });
  el.classList.add("active");
  renderView();
}

