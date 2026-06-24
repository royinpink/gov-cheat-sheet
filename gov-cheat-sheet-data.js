/* ============================================================
   Game of Vampires — Event Cheat Sheet
   DATA FILE

   This file holds all the event data and reference tables.
   Edit event info here (stamina, rankings, rewards, etc.).
   The logic lives in gov-cheat-sheet.html.

   Loaded before the main script, so these become global
   variables the page can use.
   ============================================================ */

/* Currency / reward icon paths (keep the imgs/ folder alongside the page) */
var IMGS = {
  diamond: "imgs/diamond.png",
  potion: "imgs/potion.png",
  doll: "imgs/doll.png",
  macabrian: "imgs/macabrian.png",
  circus: "imgs/circus.png",
  script: "imgs/script.png",
  alchemy: "imgs/alchemy.png",
};

/* Ranking types that count as "personal" for filtering and the
   Personal Reward table column. */
const PERSONAL_TYPES = new Set([
  "Personal",
  "Single Game",
  "All Time",
  "Admiration",
  "Amulets"
]);

/* ────────────────────────────────────────────────────────────
   EVENTS
   Each event: name, start hour (EDT), regen {stam, mins},
   startStam, maxStam, shop, diamond, rankings[], items[], notes.
   Events with no regen/startStam show as "stamina not recorded".
   ──────────────────────────────────────────────────────────── */
var EVENTS = [
  {
    name: "Summer Nights",
    startHourEDT: 7,
    regen: { stam: 8, mins: 30 },
    startStam: 64,
    maxStam: 128,
    shop: { type: "once", label: "Refreshes once" },
    diamond: null,
    rankings: [{ type: "Personal", reward: "Count" }],
    items: [],
  },

  {
    name: "Soulfire Cemetery",
    startHourEDT: 10,
    regen: { stam: 1, mins: 10 },
    startStam: 24,
    maxStam: 48,
    shop: { type: "once", label: "Refreshes once" },
    diamond: { cost: 100, stamPerBuy: 3, maxBuys: 10 },
    rankings: [
      { type: "Personal", reward: "Pumpkin Avatar" },
      {
        type: "Guild",
        reward: "Ravenous Count",
        mvpNote:
          "Guild MVP: Ravenous Count \u00b7 Members: Baleful Baron",
      },
    ],
    items: [],
  },

  {
    name: "Monster Maker",
    startHourEDT: 7,
    regen: { stam: 25, mins: 30 },
    startStam: 200,
    maxStam: 400,
    shop: { type: "none", label: "No shop" },
    diamond: { cost: 60, stamPerBuy: 25, maxBuys: 10 },
    rankings: [
      { type: "Single Game", reward: "The Red Count" },
      { type: "All Time", reward: null },
    ],
    items: [],
  },

  {
    name: "Cupcake Chaos",
    startHourEDT: 7,
    regen: { stam: 4, mins: 30 },
    startStam: 30,
    maxStam: 60,
    shop: { type: "none", label: "No shop" },
    diamond: { cost: null, stamPerBuy: 4, maxBuys: 10 },
    rankings: [
      { type: "Single Game", reward: "The Red Count" },
      { type: "Guild", reward: null },
      {
        type: "Auction",
        auctionMain: "Circus Coins",
        auctionUnder: "Scripts + Macabrian Parts",
        reward: "Circus Coins / Scripts + Macabrian Parts",
      },
    ],
    items: [],
  },

  {
    name: "Ghost Hunting",
    startHourEDT: 7,
    regen: { stam: 1, mins: 6 },
    startStam: 40,
    maxStam: 80,
    shop: { type: "daily", label: "Refreshes daily (4x total)" },
    diamond: { cost: 100, stamPerBuy: 5, maxBuys: 10 },
    rankings: [
      { type: "Personal", reward: "Soulsworn Count" },
      { type: "Team", reward: "Macabre Baron" },
    ],
    items: [],
  },

  {
    name: "Shrouded Seas",
    startHourEDT: 7,
    regen: { stam: 4, mins: 30 },
    startStam: 32,
    maxStam: 64,
    shop: { type: "once", label: "Refreshes once" },
    diamond: { cost: 40, stamPerBuy: 2, maxBuys: 20 },
    rankings: [
      { type: "Personal", reward: "Soulsworn Count" },
      { type: "Team", chipLabel: "Team", reward: "Chatbox" },
      { type: "Amulets", reward: null },
    ],
    items: [],
  },

  {
    name: "Guardian Gargoyle",
    startHourEDT: 7,
    regen: { stam: 1, mins: 5 },
    startStam: 48,
    maxStam: 96,
    shop: { type: "none", label: "No shop" },
    diamond: { cost: null, stamPerBuy: 6, maxBuys: 10 },
    rankings: [
      { type: "Single Game", reward: "Count" },
      { type: "All Time", reward: null },
    ],
    items: [],
  },

  {
    name: "Abiogenesis Attack",
    startHourEDT: 7,
    regen: { stam: 10, mins: 30 },
    startStam: 80,
    maxStam: 160,
    shop: { type: "none", label: "No shop" },
    diamond: { cost: null, stamPerBuy: 12, maxBuys: 10 },
    rankings: [
      { type: "All Time", reward: "Bewitching Count" },
      {
        type: "Auction",
        auctionMain: "Mutation Potions + Food",
        auctionUnder: "Dolls + Food",
        reward: "Mutation Potions + Food / Dolls + Food",
      },
    ],
    items: [],
  },

  {
    name: "Finders Keepers",
    startHourEDT: 7,
    regen: { stam: 12, mins: 30 },
    startStam: 100,
    maxStam: 200,
    shop: { type: "once", label: "Refreshes once" },
    diamond: null,
    rankings: [
      { type: "Personal", reward: "Celebrated Viscount" },
      {
        type: "Guild",
        reward: "Bewitching Count",
        mvpNote:
          "Guild MVP: Bewitching Count \u00b7 Members: Charming Baron",
      },
      {
        type: "Auction",
        auctionMain: "Circus Coins",
        auctionUnder: "Scripts + Macabrian Parts",
        reward: "Circus Coins / Scripts + Macabrian Parts",
      },
    ],
    items: [],
  },

  {
    name: "Street of the Dead",
    startHourEDT: 7,
    regen: { stam: 4, mins: 30 },
    startStam: 30,
    maxStam: 60,
    shop: { type: "none", label: "No shop" },
    diamond: { cost: null, stamPerBuy: 4, maxBuys: 10 },
    rankings: [
      { type: "Single Game", reward: "Iron-willed Count" },
      { type: "All Time", reward: null },
    ],
    items: [],
  },

  {
    name: "Nightwings",
    startHourEDT: 10,
    regen: { stam: 1, mins: 10 },
    startStam: 20,
    maxStam: 40,
    shop: { type: "daily", label: "Refreshes daily (5x total)" },
    diamond: { cost: 30, stamPerBuy: 3, maxBuys: 10 },
    rankings: [
      { type: "Personal", reward: "Count" },
      {
        type: "Guild",
        reward: "Fearless Count",
        mvpNote:
          "Guild MVP: Fearless Count \u00b7 Members: Resolute Baron",
      },
    ],
    items: ["Alchemy Formula"],
    shopItems: ["Alchemy Formula"],
  },

  {
    name: "Nocturne Gallery",
    startHourEDT: 7,
    regen: null,
    startStam: null,
    maxStam: null,
    shop: { type: "none", label: "No shop" },
    diamond: { cost: 40, stamPerBuy: 1, maxBuys: 20 },
    rankings: [
      { type: "Personal", reward: "Bewitching Count" },
      { type: "Admiration", reward: "Imp (familiar)" },
    ],
    items: [],
    notes: "No stamina regen system",
  },

  {
    name: "Rite of War",
    startHourEDT: 10,
    weekly: true,
    regen: { stam: 1, mins: 30 },
    startStam: 12,
    maxStam: 16,
    shop: { type: "weekly", label: "Refreshes weekly · 3× per season" },
    diamond: null,
    rankings: [
      {
        type: "Personal",
        reward: "Ominous Viscount",
        rankNote: "Bronze League",
      },
      {
        type: "Personal",
        reward: "Sinister Count",
        rankNote: "Gold League",
      },
      {
        type: "Personal",
        reward: "Eldritch Margrave",
        rankNote: "Invincible League",
      },
    ],
    items: [],
    notes:
      "Guild competes in 1 of 3 leagues. Titles are only awarded for the Supreme ranking.",
  },

  {
    name: "Cake Caper / Winter Krampus / Anniversary Familiars",

    regen: null,
    startStam: null,
    maxStam: null,
    shop: null,
    diamond: null,
    rankings: [
      { type: "Personal", reward: "Malevolent Margrave" },
      {
        type: "Guild",
        reward: "Ravenous Count",
        mvpNote:
          "Guild MVP: Ravenous Count \u00b7 Members: Baleful Baron",
      },
    ],
    items: [],
    notes: "Seasonal reskin",
  },

  {
    name: "Festival Fun / Anniversary Dom",
    regen: null,
    startStam: null,
    maxStam: null,
    shop: null,
    diamond: null,
    rankings: [
      { type: "Personal", reward: "Indomitable Margrave" },
      {
        type: "Guild",
        reward: "Iron-willed Count",
        mvpNote:
          "Guild MVP: Iron-willed Count \u00b7 Members: Merciless Baron",
      },
    ],
    items: [],
    notes: "Seasonal reskin",
  },
];

/* Reward-tier filter buttons (title categories). */
var REWARD_FILTERS = [
  { key: "all", label: "All" },
  { key: "margrave", label: "Margrave" },
  { key: "count", label: "Count" },
  { key: "viscount", label: "Viscount" },
  { key: "baron", label: "Baron" },
  { key: "auction", label: "Auction", icon: "circus" },
  { key: "familiar", label: "Familiar / Other" },
];

/* Ranking-type filter buttons (Personal / Guild / Team). */
var SCOPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "personal", label: "Personal" },
  { key: "guild", label: "Guild" },
  { key: "team", label: "Team" },
];
