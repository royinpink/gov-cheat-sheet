// ── Stamina calculator (target + time-away modes) ──────────────────
import { EVENTS } from "./data.js";
import { selectedTZ, gameHourToLocal, getTZCode } from "./timezone.js";
import { switchTab } from "./ui.js";

/** Current calculator mode: 'target' (enter goal stamina) or
 *  'time' (enter hours away). */
let calcMode = "target";

/** Populates the event dropdown in the calculator tab.
 *  @param {string} [preselect] - Event name to pre-select */
export function populateCalcSelect(preselect) {
  var sel = document.getElementById("calc-event");
  sel.innerHTML = "<option value=''>- select event -</option>";
  EVENTS.filter(function (e) {
    return e.regen;
  }).forEach(function (e) {
    var o = document.createElement("option");
    o.value = e.name;
    o.textContent = e.name;
    if (preselect && e.name === preselect) o.selected = true;
    sel.appendChild(o);
  });
}

/** Switches the calculator between target-stamina and time-away modes. */
export function setCalcMode(mode) {
  calcMode = mode;
  var targetBtn = document.getElementById("mode-target-btn");
  var timeBtn = document.getElementById("mode-time-btn");
  var targetField = document.getElementById("field-target");
  var timeField = document.getElementById("field-time");
  var isTarget = mode === "target";
  targetBtn.classList.toggle("active", isTarget);
  timeBtn.classList.toggle("active", !isTarget);
  targetBtn.setAttribute("aria-checked", isTarget ? "true" : "false");
  timeBtn.setAttribute("aria-checked", !isTarget ? "true" : "false");
  targetField.style.display = isTarget ? "" : "none";
  timeField.style.display = isTarget ? "none" : "";
  recalc();
}

/** Handles selecting an event in the calculator:
 *  pre-fills current stam (start stam) and target stam (max stam). */
export function onEventSelect() {
  var evName = document.getElementById("calc-event").value;
  var ev = EVENTS.find(function (e) {
    return e.name === evName;
  });
  var cur = document.getElementById("calc-current");
  var tgt = document.getElementById("calc-target");
  var hint = document.getElementById("calc-hint");
  if (ev) {
    cur.value = 0;
    cur.placeholder = "0";
    hint.textContent =
      "Enter your current stamina. Defaults to 0.";
    tgt.value =
      ev.maxStam !== null && ev.maxStam !== undefined ? ev.maxStam : "";
    var hrs = document.getElementById("calc-hours");
    if (hrs) hrs.value = "";
  } else {
    cur.value = "";
    cur.placeholder = "0";
    tgt.value = "";
    var hrs2 = document.getElementById("calc-hours");
    if (hrs2) hrs2.value = "";
    hint.textContent = "";
  }
  recalc();
}

/** Reads calculator inputs and updates the results section.
 *  Supports two modes:
 *   - 'target': given a goal stamina, how long / when will you reach it?
 *   - 'time': given hours away, how much stamina will you have on return? */
export function recalc() {
  var evName = document.getElementById("calc-event").value;
  var current =
    parseFloat(document.getElementById("calc-current").value) || 0;
  var box = document.getElementById("calc-result");
  var grid = document.getElementById("calc-grid");
  var ev = EVENTS.find(function (e) {
    return e.name === evName;
  });
  if (!evName || !ev || !ev.regen) {
    box.style.display = "none";
    return;
  }
  var minsPerStam = ev.regen.mins / ev.regen.stam;
  var maxStam =
    ev.maxStam !== null && ev.maxStam !== undefined ? ev.maxStam : null;
  var results = [];

  if (calcMode === "target") {
    // ── Mode 1: target stamina → time to reach it ──
    var target = parseFloat(
      document.getElementById("calc-target").value,
    );
    if (isNaN(target) || target <= 0) {
      box.style.display = "none";
      return;
    }
    var needed = Math.max(0, target - current);
    results.push({ label: "Current Stamina", value: current });
    results.push({ label: "Stamina Needed", value: needed });
    if (needed === 0) {
      results.push({ label: "Status", value: "Already there \u2713" });
    } else {
      var totalMins = needed * minsPerStam;
      var h = Math.floor(totalMins / 60),
        m = Math.round(totalMins % 60);
      results.push({
        label: "Regen Time",
        value: h > 0 ? h + "h " + m + "m" : m + "m",
      });
      results.push({
        label: "Ready at (your time)",
        value: clockAfter(totalMins),
      });
      if (maxStam && target > maxStam)
        results.push({
          label: "\u26a0 Exceeds Max",
          value: "Cap is " + maxStam,
        });
    }
  } else {
    // ── Mode 2: hours away → stamina on return ──
    var hours = parseFloat(document.getElementById("calc-hours").value);
    if (isNaN(hours) || hours < 0) {
      box.style.display = "none";
      return;
    }
    var awayMins = hours * 60;

    // Simulate stamina across the away-time, accounting for the daily
    // 10pm EDT close (regen pauses) and the daily top-up to starting
    // stamina at each new event-day open.
    var sim = simulateStamina(ev, current, awayMins);
    var onReturn = sim.stamina;
    var gained = onReturn - current;

    results.push({ label: "Current Stamina", value: current });
    results.push({
      label: "Stamina on Return",
      value: onReturn + (maxStam !== null ? " / " + maxStam : ""),
    });

    if (sim.maxedDuringOpen && maxStam !== null && onReturn >= maxStam) {
      results.push({
        label: "\u26a0 Will Max Out",
        value: "Yes \u2014 capped at " + maxStam,
      });
      // Only suggest spending now if the player actually has stamina to spend
      if (current > 0)
        results.push({
          label: "Tip",
          value: "Spend some now to avoid waste",
        });
    } else {
      results.push({
        label: "Stamina Gained",
        value: (gained >= 0 ? "+" : "") + gained,
      });
      results.push({ label: "Will Max Out", value: "No" });
    }

    if (sim.toppedUp)
      results.push({
        label: "Daily Top-Up",
        value:
          "Refilled to " +
          (ev.startStam || 0) +
          " at a new event day (your leftover was lower).",
      });

    if (sim.crossedClose)
      results.push({
        label: "\u26a0 Note",
        value:
          "Event closes 10pm EDT \u2014 regen pauses overnight, so only " +
          Math.round((sim.openMins / 60) * 10) / 10 +
          "h of your time counts.",
      });
  }

  grid.innerHTML = results
    .map(function (r) {
      return (
        '<div class="calc-stat"><span class="calc-stat-label">' +
        r.label +
        '</span><span class="calc-stat-value">' +
        r.value +
        "</span></div>"
      );
    })
    .join("");
  box.style.display = "block";
}

/** Simulates stamina over a span of "away" minutes, accounting for:
 *   - the daily close (10pm EDT) during which regen pauses;
 *   - the daily top-up: when a new event day opens, if your carried-over
 *     stamina is below the event's starting amount, it tops up to start
 *     (you never lose stamina — higher carryover is kept).
 *  Rite of War is a 1-day event, so no daily top-up applies after day 1.
 *
 *  @param {object} ev - event (startHourEDT, regen, startStam, maxStam, weekly)
 *  @param {number} startStamina - stamina at "now"
 *  @param {number} awayMins - minutes the player will be away
 *  @returns {{stamina:number, openMins:number, crossedClose:boolean,
 *             toppedUp:boolean, maxedDuringOpen:boolean}} */
export function simulateStamina(ev, startStamina, awayMins) {
  var CLOSE_HOUR = 22; // 10pm EDT
  var startHour =
    ev.startHourEDT !== null && ev.startHourEDT !== undefined
      ? ev.startHourEDT
      : 0;
  var maxStam =
    ev.maxStam !== null && ev.maxStam !== undefined ? ev.maxStam : null;
  var baseStart =
    ev.startStam !== null && ev.startStam !== undefined
      ? ev.startStam
      : 0;
  var minsPerStam = ev.regen ? ev.regen.mins / ev.regen.stam : null;
  var isMultiDay = !ev.weekly; // Rite of War (weekly) is single-day

  // Default result if there is no regen data
  if (minsPerStam === null) {
    return {
      stamina: startStamina,
      openMins: 0,
      crossedClose: false,
      toppedUp: false,
      maxedDuringOpen: false,
    };
  }

  // Current time in EDT minutes-of-day.
  var now = new Date();
  var edtNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  var curMinOfDay = edtNow.getHours() * 60 + edtNow.getMinutes();
  var openStart = startHour * 60;
  var openEnd = CLOSE_HOUR * 60;

  var stam = startStamina;
  var remaining = awayMins;
  var cursor = curMinOfDay;
  var openMins = 0;
  var crossedClose = false;
  var toppedUp = false;
  var maxedDuringOpen = false;
  // Track whether we have passed at least one new day-open boundary.
  var dayOpensSeen = 0;
  var startedBeforeFirstOpen = curMinOfDay < openStart;

  // Accrue fractional stamina, floor at the end of each open block.
  var fracStam = stam;
  var guard = 0;
  while (remaining > 0 && guard < 20160) {
    var dayPos = cursor % 1440;
    var isOpen = dayPos >= openStart && dayPos < openEnd;
    if (isOpen) {
      var untilClose = openEnd - dayPos;
      var step = Math.min(untilClose, remaining);
      openMins += step;
      // Regen during this open block
      fracStam += step / minsPerStam;
      if (maxStam !== null && fracStam >= maxStam) {
        fracStam = maxStam;
        maxedDuringOpen = true;
      }
      cursor += step;
      remaining -= step;
    } else {
      crossedClose = true;
      var untilOpen;
      if (dayPos < openStart) untilOpen = openStart - dayPos;
      else untilOpen = 1440 - dayPos + openStart;
      var step2 = Math.min(untilOpen, remaining);
      cursor += step2;
      remaining -= step2;
      // If we actually reach a new day's open (consumed the full gap)
      if (step2 === untilOpen && remaining >= 0) {
        dayOpensSeen++;
        // Daily top-up applies only for multi-day events.
        if (isMultiDay && Math.floor(fracStam) < baseStart) {
          fracStam = baseStart;
          toppedUp = true;
        }
      }
    }
    guard++;
  }

  var finalStam = Math.floor(fracStam);
  if (maxStam !== null) finalStam = Math.min(finalStam, maxStam);
  return {
    stamina: finalStam,
    openMins: openMins,
    crossedClose: crossedClose,
    toppedUp: toppedUp,
    maxedDuringOpen: maxedDuringOpen,
  };
}

/** Returns a local clock-time string `mins` minutes from now,
 *  respecting the selected timezone region. */
export function clockAfter(mins) {
  var future = new Date(new Date().getTime() + mins * 60000);
  try {
    var tzOpts = { hour: "numeric", minute: "2-digit", hour12: true };
    if (selectedTZ) tzOpts.timeZone = selectedTZ;
    return future.toLocaleTimeString([], tzOpts);
  } catch (e) {
    return "";
  }
}

/** Switches to the Calculator tab with the event from the clicked card
 *  pre-selected. */
export function openCalc(btn) {
  var card = btn.closest(".event-card");
  var name = card ? card.getAttribute("data-name") : "";
  switchTab("calc", document.querySelectorAll(".tab-btn")[1]);
  populateCalcSelect(name);
  onEventSelect();
}

