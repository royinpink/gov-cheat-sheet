// ── Table rendering (full + mobile) ────────────────────────────────
import { EVENTS, IMGS } from "./data.js";
import { gimg } from "./utils.js";
import { gameHourToLocal, fmtLocalTime, getTZCode } from "./timezone.js";
import { cardMatchesFilters } from "./filters.js";
import { rankClass, rewardHTML, maxStamTime } from "./cards.js";
import { announceCount } from "./ui.js";
import { PERSONAL_TYPES } from "./data.js";

/** Builds the Personal / Single Game / All Time rankings cell for the table. */
export function buildPersonalCell(ev) {
  
  var parts = [];
  ev.rankings.forEach(function (r) {
    if (PERSONAL_TYPES.has(r.type)) {
      var cls = rankClass(r.type);
      var lbl = r.type;

      var rnote = r.rankNote
        ? '<span class="t-rank-note">' + r.rankNote + "</span>"
        : "";
      var reward = r.reward
        ? '<span style="color:var(--silver)">' + r.reward + "</span>"
        : '<span class="t-dim">no title</span>';
      // Multi-line rewards (Rite of War has newline-separated titles)
      if (r.reward && r.reward.indexOf("\n") >= 0) {
        r.reward.split("\n").forEach(function (line) {
          var trimmed = line.trim();
          if (trimmed)
            parts.push(
              '<div class="t-rank-row"><span class="rank-type ' +
                cls +
                '">' +
                lbl +
                '</span> <span style="color:var(--silver)">' +
                trimmed +
                "</span></div>",
            );
        });
      } else {
        parts.push(
          '<div class="t-rank-row"><span class="rank-type ' +
            cls +
            '">' +
            lbl +
            "</span>" +
            " " +
            reward +
            "</div>" +
            rnote,
        );
      }
    }
  });
  return parts.length
    ? '<div class="t-rank">' + parts.join("") + "</div>"
    : '<span class="t-dim">\u2014</span>';
}

/** Builds the Guild rankings cell (MVP + Members). */
export function buildGuildCell(ev) {
  var parts = [];
  ev.rankings.forEach(function (r) {
    if (r.type === "Guild") {
      var reward = r.reward
        ? '<span style="color:var(--silver)">' + r.reward + "</span>"
        : '<span class="t-dim">no title</span>';
      parts.push(
        '<div class="t-rank-row"><span class="rank-type rank-guild">Guild</span> ' +
          reward +
          "</div>",
      );
      if (r.mvpNote)
        parts.push(
          '<div class="t-rank-note">\u21b3 ' + r.mvpNote + "</div>",
        );
    }
  });
  return parts.length
    ? '<div class="t-rank">' + parts.join("") + "</div>"
    : '<span class="t-dim">\u2014</span>';
}

/** Builds the Team ranking cell. */
export function buildTeamCell(ev) {
  var parts = [];
  ev.rankings.forEach(function (r) {
    if (r.type === "Team") {
      var lbl = r.chipLabel || "Team";
      var reward = r.reward
        ? '<span style="color:var(--silver)">' + r.reward + "</span>"
        : '<span class="t-dim">no title</span>';
      parts.push(
        '<div class="t-rank-row"><span class="rank-type rank-team">' +
          lbl +
          "</span> " +
          reward +
          "</div>",
      );
    }
  });
  return parts.length
    ? '<div class="t-rank">' + parts.join("") + "</div>"
    : '<span class="t-dim">\u2014</span>';
}

/** Builds the Auction cell (Main + Underground on separate lines). */
export function buildAuctionCell(ev) {
  var parts = [];
  ev.rankings.forEach(function (r) {
    if (r.auctionMain) {
      parts.push(
        '<div><span style="color:var(--gold-bright);font-size:0.75rem">Main:</span> ' +
          rewardHTML(r.auctionMain) +
          "</div>",
      );
      parts.push(
        '<div><span style="color:var(--gold-bright);font-size:0.75rem">Underground:</span> ' +
          rewardHTML(r.auctionUnder) +
          "</div>",
      );
    }
  });
  return parts.length
    ? parts.join("")
    : '<span class="t-dim">\u2014</span>';
}

/** Builds the Redeem Shop cell for the table. */
export function buildShopCell(ev) {
  if (!ev.shop) return '<span class="t-dim">—</span>';
  var cls =
    ev.shop.type === "daily"
      ? "shop-daily"
      : ev.shop.type === "once"
        ? "shop-once"
        : ev.shop.type === "weekly"
          ? "shop-weekly"
          : "shop-none";
  var out =
    '<span class="shop-badge ' + cls + '">' + ev.shop.label + "</span>";
  if (ev.shopItems && ev.shopItems.length) {
    var keyMap = {
      "alchemy formula": "alchemy",
      "circus coins": "circus",
      "macabrian parts": "macabrian",
      "mutation potions": "potion",
      doll: "doll",
    };
    var items = ev.shopItems
      .map(function (item) {
        var key =
          keyMap[item.toLowerCase()] ||
          item.toLowerCase().replace(/ /g, "");
        return (IMGS[key] ? gimg(key, 13) : "") + item;
      })
      .join(", ");
    out +=
      '<br><span class="t-dim" style="font-size:0.7rem">Rec: ' +
      items +
      "</span>";
  }
  return out;
}

/** Builds a single table row <tr> string for one event. */
export function buildTableRow(ev) {
  var ph = !ev.regen && ev.startStam == null;

  // Start time
  var startStr =
    ev.startHourEDT !== null && ev.startHourEDT !== undefined
      ? fmtLocalTime(gameHourToLocal(ev.startHourEDT)) + " " + getTZCode()
      : "?";

  // Regen
  var regenStr = ev.regen
    ? '<span class="t-mono t-gold">' +
      ev.regen.stam +
      "/" +
      ev.regen.mins +
      "min</span>"
    : '<span class="t-dim">N/A</span>';

  // Stamina range
  var ss =
    ev.startStam !== null && ev.startStam !== undefined
      ? ev.startStam
      : "\u2014";
  var ms = ev.maxStam || "\u2014";
  var stamStr =
    '<span class="t-mono">' + ss + " \u2192 " + ms + "</span>";

  // Maxes at
  var maxT = maxStamTime(ev);
  var maxStr = maxT
    ? '<span class="t-mono t-gold">' + maxT + "</span>"
    : '<span class="t-dim">\u2014</span>';

  // Diamond per buy
  var diam1 = '<span class="t-dim">\u2014</span>';
  var diam2 = '<span class="t-dim">\u2014</span>';
  if (ev.diamond && ev.diamond.stamPerBuy) {
    var d = ev.diamond;
    var cost = d.cost ? d.cost : "?";
    diam1 =
      '<span class="t-mono t-red">' +
      cost +
      "</span>" +
      gimg("diamond", 13) +
      ' \u2192 <span class="t-mono t-red">' +
      d.stamPerBuy +
      ' stam</span>, <span class="t-mono">' +
      d.maxBuys +
      "\u00d7</span>";
    var totalCost = d.cost ? d.cost * d.maxBuys : "?";
    var totalStam = d.stamPerBuy * d.maxBuys;
    diam2 =
      '<span class="t-mono t-red">' +
      totalCost +
      "</span>" +
      gimg("diamond", 13) +
      ' \u2192 <span class="t-mono t-red">' +
      totalStam +
      " stam</span>";
  }

  var rowCls = "";
  if (ph) rowCls = "table-placeholder";
  else if (ev.weekly) rowCls = "table-weekly";

  return (
    '<tr class="' +
    rowCls +
    '">' +
    '<td><span class="t-evname">' +
    ev.name.replace(/\//g, "/<wbr>") +
    "</span></td>" +
    '<td class="t-mono">' +
    startStr +
    "</td>" +
    "<td>" +
    regenStr +
    "</td>" +
    "<td>" +
    stamStr +
    "</td>" +
    "<td>" +
    maxStr +
    "</td>" +
    "<td>" +
    diam1 +
    "</td>" +
    "<td>" +
    diam2 +
    "</td>" +
    "<td>" +
    buildShopCell(ev) +
    "</td>" +
    "<td>" +
    buildPersonalCell(ev) +
    "</td>" +
    "<td>" +
    buildGuildCell(ev) +
    "</td>" +
    "<td>" +
    buildTeamCell(ev) +
    "</td>" +
    "<td>" +
    buildAuctionCell(ev) +
    "</td>" +
    '<td class="t-dim">' +
    (ev.notes || "") +
    "</td>" +
    "</tr>"
  );
}

/** Filters EVENTS and renders them as a compact sortable table into #table-container. */
export function renderTable() {
  var container = document.getElementById("table-container");
  var filtered = EVENTS.filter(cardMatchesFilters);
  if (!filtered.length) {
    container.innerHTML =
      '<div style="padding:2rem;text-align:center;color:var(--parchment-dim);font-style:italic">No events match the current filters.</div>';
    return;
  }
  var heads = [
    "Event",
    "Starts",
    "Regen",
    "Start \u2192 Max",
    "Maxes At",
    '\ud83d\udc8e /Buy<br><small style="font-weight:400;font-style:italic">Cost\u2192Stam, Buys</small>',
    '\ud83d\udc8e Total<br><small style="font-weight:400;font-style:italic">Total\u2192Stam</small>',
    "Redeem Shop",
    "Personal Reward",
    'Guild Reward<br><small style="font-weight:400;font-style:italic">MVP / Members</small>',
    "Team Reward",
    "Auction",
    "Notes",
  ];
  var headerRow = heads
    .map(function (h) {
      return '<th scope="col">' + h + "</th>";
    })
    .join("");
  var rows = filtered.map(buildTableRow).join("");
  container.innerHTML =
    '<div class="table-wrap"><table class="compact-table"><caption class="sr-only">Game of Vampires events — stamina, economy, and ranking rewards</caption><thead><tr>' +
    headerRow +
    "</tr></thead><tbody>" +
    rows +
    "</tbody></table></div>";
  announceCount(filtered.length);
}

/** Builds a combined rankings cell (all titles, each on its own line)
 *  for the streamlined mobile table. Reuses the per-type cell builders. */
export function buildAllRewardsCell(ev) {
  var blocks = [];
  var personal = buildPersonalCell(ev);
  var guild = buildGuildCell(ev);
  var team = buildTeamCell(ev);
  var auction = buildAuctionCell(ev);
  // Each builder returns an em-dash span when empty; skip those.
  var dash = '<span class="t-dim">\u2014</span>';
  if (personal !== dash) blocks.push(personal);
  if (guild !== dash) blocks.push(guild);
  if (team !== dash) blocks.push(team);
  if (auction !== dash)
    blocks.push('<div class="t-rank">' + auction + "</div>");
  return blocks.length ? blocks.join("") : dash;
}

/** Builds the combined "Stamina & Regen" cell for the mobile table:
 *  regen rate on line 1, start → max on line 2. */
export function buildStamRegenCell(ev) {
  var regenStr = ev.regen
    ? '<span class="t-mono t-gold">' +
      ev.regen.stam +
      "/" +
      ev.regen.mins +
      "min</span>"
    : '<span class="t-dim">N/A</span>';
  var ss =
    ev.startStam !== null && ev.startStam !== undefined
      ? ev.startStam
      : "\u2014";
  var ms = ev.maxStam || "\u2014";
  var stamStr =
    '<span class="t-mono">' + ss + " \u2192 " + ms + "</span>";
  var startStr =
    ev.startHourEDT !== null && ev.startHourEDT !== undefined
      ? '<div class="t-dim" style="font-size:0.7rem">Starts ' +
        fmtLocalTime(gameHourToLocal(ev.startHourEDT)) +
        " " +
        getTZCode() +
        "</div>"
      : "";
  return (
    '<div class="t-rank">' +
    "<div>" +
    regenStr +
    "</div>" +
    "<div>" +
    stamStr +
    "</div>" +
    startStr +
    "</div>"
  );
}

/** Renders a streamlined 3-column table for mobile/narrow screens:
 *  Stamina & Regen | Redeem Shop | Rewards. Event name heads each row. */
export function renderMobileTable() {
  var container = document.getElementById("mobile-table-container");
  if (!container) return;
  var filtered = EVENTS.filter(cardMatchesFilters);
  if (!filtered.length) {
    container.innerHTML =
      '<div style="padding:2rem;text-align:center;color:var(--parchment-dim);font-style:italic">No events match the current filters.</div>';
    return;
  }
  var rows = filtered
    .map(function (ev) {
      var weeklyCls = ev.weekly ? " table-weekly" : "";
      return (
        '<tr class="' +
        weeklyCls.trim() +
        '">' +
        '<td colspan="3" class="m-evname-cell"><span class="t-evname">' +
        ev.name +
        "</span></td></tr>" +
        '<tr class="' +
        weeklyCls.trim() +
        '">' +
        "<td>" +
        buildStamRegenCell(ev) +
        "</td>" +
        "<td>" +
        buildShopCell(ev) +
        "</td>" +
        "<td>" +
        buildAllRewardsCell(ev) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
  container.innerHTML =
    '<div class="table-wrap"><table class="compact-table mobile-table">' +
    '<caption class="sr-only">Game of Vampires events — stamina, shop, and rewards</caption>' +
    '<thead><tr><th scope="col">Stamina &amp; Regen</th><th scope="col">Redeem Shop</th><th scope="col">Rewards</th></tr></thead>' +
    "<tbody>" +
    rows +
    "</tbody></table></div>";
}

