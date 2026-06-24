// ── Card rendering ─────────────────────────────────────────────────
import { EVENTS, IMGS, PERSONAL_TYPES } from "./data.js";
import { gimg } from "./utils.js";
import { gameHourToLocal, fmtLocalTime, getTZCode } from "./timezone.js";
import { cardMatchesFilters } from "./filters.js";
import { announceCount } from "./ui.js";
import { openCalc } from "./calculator.js";

export function rewardHTML(reward) {
  if (!reward)
    return '<span style="color:var(--parchment-dim);font-style:italic">no title</span>';
  var r = reward.toLowerCase(),
    icons = "";
  if (r.indexOf("mutation potion") >= 0) icons += gimg("potion");
  if (r.indexOf("doll") >= 0) icons += gimg("doll");
  if (r.indexOf("circus coin") >= 0) icons += gimg("circus");
  if (r.indexOf("script") >= 0) icons += gimg("script");
  if (r.indexOf("macabrian") >= 0) icons += gimg("macabrian");
  if (r.indexOf("alchemy") >= 0) icons += gimg("alchemy");
  return icons + "<span>" + reward + "</span>";
}

export function rankClass(type) {
  var map = {
    Personal: "rank-personal",
    "All Time": "rank-alltime",
    "Single Game": "rank-singlegame",
    Guild: "rank-guild",
    Team: "rank-team",
    Auction: "rank-auction",
    Admiration: "rank-admiration",
    Amulets: "rank-admiration",
    "Team Progression": "rank-team",
  };
  return map[type] || "rank-personal";
}

/** Calculates the local time at which an event's stamina reaches max
 *  if left untouched from the event start.
 *  @param {object} ev - Event data object
 *  @returns {string|null} formatted time string, or null if data missing */
export function maxStamTime(ev) {
  if (
    !ev.regen ||
    ev.startStam === null ||
    ev.maxStam === null ||
    ev.startHourEDT === null ||
    ev.startHourEDT === undefined
  )
    return null;
  var minsPerStam = ev.regen.mins / ev.regen.stam;
  var minsToMax = (ev.maxStam - ev.startStam) * minsPerStam;
  var startDate = gameHourToLocal(ev.startHourEDT);
  var maxDate = new Date(startDate.getTime() + minsToMax * 60000);
  return fmtLocalTime(maxDate);
}

/** Builds the HTML string for a single event card.
 *  @param {object} ev - Event data object
 *  @returns {string} HTML for an <article> element */
export function buildCard(ev) {
  // An event is treated as a stamina placeholder if it has no regen data
  var ph = !ev.regen && ev.startStam == null;

  var stamHTML = "";
  if (!ph && (ev.regen || ev.startStam !== null)) {
    var maxT = maxStamTime(ev);
    var maxTimeHTML = maxT
      ? '<div class="stat-pill" style="flex:2"><span class="stat-pill-label">Maxes at (untouched)</span><span class="stat-pill-value" style="color:var(--gold-bright)">' +
        maxT +
        "</span></div>"
      : "";
    stamHTML =
      '<div class="stat-row">' +
      '<div class="stat-pill"><span class="stat-pill-label">Regen</span><span class="stat-pill-value">' +
      (ev.regen ? ev.regen.stam + "/" + ev.regen.mins + "min" : "N/A") +
      "</span></div>" +
      '<div class="stat-pill"><span class="stat-pill-label">Start</span><span class="stat-pill-value">' +
      (ev.startStam !== null && ev.startStam !== undefined
        ? ev.startStam
        : "0") +
      "</span></div>" +
      '<div class="stat-pill"><span class="stat-pill-label">Max</span><span class="stat-pill-value">' +
      (ev.maxStam || "—") +
      "</span></div>" +
      maxTimeHTML +
      "</div>";
  }

  var startTimeHTML = "";
  if (!ph && ev.startHourEDT !== null && ev.startHourEDT !== undefined) {
    var startDate = gameHourToLocal(ev.startHourEDT);
    var startStr = fmtLocalTime(startDate);
    startTimeHTML =
      '<div><span class="section-label">Starts:</span> ' +
      '<span style="font-size:0.75rem;color:var(--parchment)">' +
      startStr +
      " " +
      getTZCode() +
      "</span></div>";
  }


  var shopHTML = "";
  if (!ph && ev.shop) {
    var cls =
      ev.shop.type === "daily"
        ? "shop-daily"
        : ev.shop.type === "once"
          ? "shop-once"
          : ev.shop.type === "weekly"
            ? "shop-weekly"
            : "shop-none";
    var shopItemsHTML = "";
    if (ev.shopItems && ev.shopItems.length) {
      var sitags = ev.shopItems
        .map(function (item) {
          var keyMap = {
            "alchemy formula": "alchemy",
            "circus coins": "circus",
            "macabrian parts": "macabrian",
            "mutation potions": "potion",
            "mutation potion": "potion",
          };
          var key =
            keyMap[item.toLowerCase()] ||
            item.toLowerCase().replace(/ /g, "");
          var im = IMGS[key] ? gimg(key, 22) : "";
          return '<span class="item-tag">' + im + item + "</span>";
        })
        .join("");
      shopItemsHTML =
        '<div class="shop-rec"><span class="shop-rec-label">Recommended Item</span><div class="items-wrap">' +
        sitags +
        "</div></div>";
    }
    shopHTML =
      '<div><div class="section-label">Redeem Shop</div><span class="shop-badge ' +
      cls +
      '">' +
      ev.shop.label +
      "</span>" +
      shopItemsHTML +
      "</div>";
  }

  var diamHTML = "";
  if (!ph && ev.diamond) {
    var d = ev.diamond,
      cs = d.cost ? d.cost : "?",
      ts = d.stamPerBuy * d.maxBuys,
      tc = d.cost ? d.cost * d.maxBuys : null;
    diamHTML =
      '<div><div class="section-label">Diamond Stamina</div><div class="diamond-row"> <span class="diamond-highlight">' +
      cs +
      gimg("diamond", 18) +
      "</span>" +
      ' \u2192 <span class="diamond-highlight">' +
      d.stamPerBuy +
      " stam</span>" +
      ' <span style="color:var(--ash)">\u00b7</span>' +
      ' max <span class="diamond-highlight">' +
      d.maxBuys +
      "x</span>" +
      ' = <span class="diamond-highlight">' +
      ts +
      " stam</span>" +
      (tc
        ? ' <span style="color:var(--parchment-dim);font-size:0.78rem">(' +
          tc +
          gimg("diamond", 18)+ ")</span>"
        : "") +
      "</div></div>";
  }

  var rankHTML = "";
  if (ev.rankings && ev.rankings.length) {
    var rows = ev.rankings
      .map(function (r) {
        var chipLabel = r.chipLabel || r.type;

        var rankNote = r.rankNote
          ? ' <span style="font-size:0.7rem;color:var(--gold);font-style:italic">' +
            r.rankNote +
            "</span>"
          : "";
        var rewardContent = r.auctionMain
          ? '<div><span style="color:var(--gold-bright);font-size:0.8rem">Main:</span> ' +
            rewardHTML(r.auctionMain) +
            "</div>" +
            '<div><span style="color:var(--gold-bright);font-size:0.8rem">Underground:</span> ' +
            rewardHTML(r.auctionUnder) +
            "</div>"
          : rewardHTML(r.reward);
        var note = r.mvpNote
          ? '<span class="rank-note">\u21b3 ' + r.mvpNote + "</span>"
          : "";
        return (
          '<li class="ranking-row"><span class="rank-type ' +
          rankClass(r.type) +
          '">' +
          chipLabel +
          "</span>" +
          rankNote +
          ' <span class="rank-arrow">\u2192</span>' +
          ' <span class="rank-reward" style="flex-direction:column;align-items:flex-start">' +
          rewardContent +
          "</span>" +
          note +
          "</li>"
        );
      })
      .join("");
    rankHTML =
      '<div><div class="section-label">Rankings &amp; Rewards</div><ul class="rankings">' +
      rows +
      "</ul></div>";
  }

  var notesHTML = ev.notes
    ? '<div class="card-note">' + ev.notes + "</div>"
    : "";
  var calcLink =
    ev.regen && !ph
      ? '<button class="calc-btn" type="button"><span aria-hidden="true">\u23f3</span> Calculate stamina time</button>'
      : "";
  var phBody = ph
    ? '<div class="placeholder-msg"><span aria-hidden="true">\ud83d\udd6f</span> Stamina data not yet recorded</div>'
    : "";
  return (
    '<article class="event-card' +
    (ph ? " placeholder" : "") +
    (ev.weekly ? " weekly-card" : "") +
    '" data-name="' +
    ev.name.replace(/"/g, "&quot;") +
    '">' +
    '<header class="card-header"><h3 class="card-title">' +
    ev.name +
    "</h3></header>" +
    '<div class="card-body">' +
    phBody +
    startTimeHTML +
    stamHTML +
    shopHTML +
    diamHTML +
    rankHTML +
    notesHTML +
    "</div>" +
    calcLink +
    "</article>"
  );
}

/** Filters EVENTS and renders them as cards into #cards-grid. */
export function renderCards() {
  var grid = document.getElementById("cards-grid");
  var filtered = EVENTS.filter(cardMatchesFilters);
  grid.innerHTML = filtered.map(buildCard).join("");
  announceCount(filtered.length);
  // Wire up the per-card "Calculate stamina time" buttons.
  grid.querySelectorAll(".calc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openCalc(btn);
    });
  });
}

