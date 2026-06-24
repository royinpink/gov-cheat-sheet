import { renderView } from "./ui.js";

// ── Timezone handling ──────────────────────────────────────────────
// Game events are stored in EDT (UTC-4). These helpers convert to the
// user's selected region + daylight/standard mode for display.

/* tzOffset: 0 = Daylight Time, -1 = Standard Time
   selectedTZ: IANA timezone string (null = auto-detect from browser) */
export let tzOffset = 0;
export let selectedTZ = null;

/** Lets other modules read/set the DST offset. */
export function setTzOffset(v) { tzOffset = v; }
/** Lets other modules read/set the selected region. */
export function setSelectedTZ(v) { selectedTZ = v; }

/** Maps the browser's IANA timezone to the nearest American region
 *  and pre-selects the dropdown accordingly. */
export function detectRegion() {
  try {
    var browserTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var map = {
      "America/New_York": "America/New_York",
      "America/Detroit": "America/New_York",
      "America/Indiana/Indianapolis": "America/New_York",
      "America/Kentucky/Louisville": "America/New_York",
      "America/Indiana/Marengo": "America/New_York",
      "America/Indiana/Vevay": "America/New_York",
      "America/Toronto": "America/New_York",
      "America/Chicago": "America/Chicago",
      "America/Winnipeg": "America/Chicago",
      "America/Menominee": "America/Chicago",
      "America/Indiana/Knox": "America/Chicago",
      "America/Denver": "America/Denver",
      "America/Boise": "America/Denver",
      "America/Phoenix": "America/Denver",
      "America/Los_Angeles": "America/Los_Angeles",
      "America/Vancouver": "America/Los_Angeles",
      "America/Tijuana": "America/Los_Angeles",
      "America/Anchorage": "America/Anchorage",
      "America/Juneau": "America/Anchorage",
      "America/Sitka": "America/Anchorage",
      "America/Yakutat": "America/Anchorage",
      "Pacific/Honolulu": "Pacific/Honolulu",
      "America/Adak": "Pacific/Honolulu",
    };
    var matched = map[browserTZ];
    var sel = document.getElementById("tz-region-select");
    if (matched && sel) {
      sel.value = matched;
      selectedTZ = matched;
    }
  } catch (e) {}
}

/** Converts a game hour (stored as EDT, UTC-4) to a local Date.
 *  Uses July (Daylight) or January (Standard) to let the browser
 *  apply the correct DST rules for the selected region.
 *  @param {number} gameHourEDT - Event hour in EDT (0–23)
 *  @returns {Date} */
export function gameHourToLocal(gameHourEDT) {
  var utcHour = gameHourEDT + 4; // EDT is UTC-4
  var year = new Date().getFullYear();
  var month = tzOffset === 0 ? 6 : 0; // July (15) for daylight preview, January (15) for standard
  return new Date(Date.UTC(year, month, 15, utcHour, 0));
}

/** Returns the short timezone code for the current region + DST mode (e.g. "EDT", "CST"). */
export function getTZCode() {
  var tz = selectedTZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    var month = tzOffset === 0 ? 6 : 0;
    var d = new Date(new Date().getFullYear(), month, 15);
    var str = d.toLocaleString("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    var parts = str.split(" ");
    return parts[parts.length - 1];
  } catch (e) {
    return "";
  }
}

/** Formats a Date as a local time string using the selected region.
 *  @param {Date} date
 *  @returns {string} e.g. '7:00 AM' */
export function fmtLocalTime(date) {
  var opts = { hour: "numeric", minute: "2-digit", hour12: true };
  if (selectedTZ) opts.timeZone = selectedTZ;
  return date.toLocaleTimeString([], opts);
}

export function tzLabel() {
  return tzOffset === 0 ? "Daylight" : "Standard";
}

export function updateTZButton() {
  var btn = document.getElementById("tz-toggle-btn");
  if (btn) {
    btn.innerHTML =
      '<span aria-hidden="true">\u23f0</span> ' + tzLabel() + " Time";
    btn.className = "tz-toggle " + (tzOffset === 0 ? "edt" : "est");
    btn.setAttribute(
      "aria-label",
      "Time mode: " + tzLabel() + " Time. Click to switch.",
    );
  }
}

/** Auto-detects whether the game server (Eastern) is currently in
 *  Daylight or Standard time, and updates tzOffset accordingly. */
export function detectTZ() {
  try {
    // Detect based on game server timezone (America/New_York)
    var s = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "short",
    });
    tzOffset = s.indexOf("EDT") >= 0 ? 0 : -1;
  } catch (e) {
    tzOffset = 0;
  }
  updateTZButton();
}

/** Manually flips between Daylight / Standard time and re-renders cards. */
export function toggleTZ() {
  tzOffset = tzOffset === 0 ? -1 : 0;
  updateTZButton();
  renderView();
}

/** Handles user selecting a timezone region from the dropdown. */
export function onTZRegionChange() {
  var sel = document.getElementById("tz-region-select");
  selectedTZ = sel && sel.value ? sel.value : null;
  renderView();
}
