// ── Filter state + matching logic ──────────────────────────────────
import { PERSONAL_TYPES, EVENTS } from "./data.js";
import { renderView } from "./ui.js";

export let activeRewardFilter = "all";
export let activeScopeFilter = "all";
export let activeTitleFilter = null;

export function setActiveRewardFilter(v) { activeRewardFilter = v; }
export function setActiveScopeFilter(v) { activeScopeFilter = v; }
export function setActiveTitleFilter(v) { activeTitleFilter = v; }

export function rewardToFilter(reward) {
  if (!reward) return "none";
  var r = reward.toLowerCase();
  if (r.indexOf("margrave") >= 0) return "margrave";
  if (r.indexOf("viscount") >= 0) return "viscount";
  if (r.indexOf("count") >= 0) return "count";
  if (r.indexOf("baron") >= 0) return "baron";
  if (
    r.indexOf("circus") >= 0 ||
    r.indexOf("script") >= 0 ||
    r.indexOf("potion") >= 0 ||
    r.indexOf("doll") >= 0 ||
    r.indexOf("mutation") >= 0
  )
    return "auction";
  if (r.indexOf("none") >= 0) return "none";
  return "familiar";
}

export function rankingScope(type) {
  if (type === "Guild") return "guild";
  if (type === "Team") return "team";
  if (type === "Auction") return "auction";
  if (PERSONAL_TYPES.has(type)) return "personal";
}

export function rankingMatchesFilters(r) {
  if (!r.reward && activeRewardFilter !== "all") return false;
  var rMatch =
    activeRewardFilter === "all" ||
    rewardToFilter(r.reward) === activeRewardFilter;
  var sMatch =
    activeScopeFilter === "all" ||
    rankingScope(r.type) === activeScopeFilter;
  return rMatch && sMatch;
}

/** Returns true if the event should be visible given current filters.
 *  Checks title search first, then reward tier + ranking scope. */
export function cardMatchesFilters(ev) {
  if (activeTitleFilter) {
    return eventMatchesName(ev, activeTitleFilter);
  }
  if (activeRewardFilter === "all" && activeScopeFilter === "all")
    return true;
  return ev.rankings.some(function (r) {
    return rankingMatchesFilters(r);
  });
}

/** Returns all event names sorted alphabetically, for the search dropdown. */
export function getAllEventNames() {
  return EVENTS.map(function (ev) {
    return ev.name;
  }).sort(function (a, b) {
    return a.localeCompare(b);
  });
}

export function eventMatchesName(ev, name) {
  return ev.name === name;
}

/** Sets the active reward-tier filter and re-renders. */
