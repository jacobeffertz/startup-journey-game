// Headless playtest for From Spark to Startup (index.html).
// Stubs the DOM, loads the game's inline script, then plays full games
// with different strategies / ventures / sectors and asserts endings are reached.
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("FAIL: no inline script found"); process.exit(1); }
const js = m[1];

// --- minimal DOM stub ---
function makeEl() {
  const el = {
    _html: "", _text: "",
    style: {}, dataset: {},
    classList: { _s: new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);},
      toggle(c, f){ f ? this._s.add(c) : this._s.delete(c); }, contains(c){ return this._s.has(c); } },
    children: [],
    appendChild(c){ this.children.push(c); return c; },
    querySelectorAll(){ return []; },
    addEventListener(){}, removeEventListener(){},
    getContext(){ return new Proxy({}, { get: (t, k) => (k === "canvas" ? el : (() => {})),
      set: () => true }); },
    set innerHTML(v){ this._html = String(v); },
    get innerHTML(){ return this._html; },
    set textContent(v){ this._text = String(v); },
    get textContent(){ return this._text; },
    set onclick(v){ this._onclick = v; }, get onclick(){ return this._onclick; },
    title: "", disabled: false, value: "Alex",
  };
  return el;
}
const els = {};
const documentStub = {
  getElementById(id){ if (!els[id]) els[id] = makeEl(); return els[id]; },
  createElement(){ return makeEl(); },
  addEventListener(){},
};
const store = {};
const sandbox = {
  // Run the 450ms land() timer immediately so 72 full games don't take 9 minutes.
  console, setTimeout: (fn, ms) => (ms === 450 ? (fn(), 0) : setTimeout(fn, ms)),
  clearTimeout, setInterval, clearInterval,
  document: documentStub,
  window: {},
  localStorage: { getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  AudioContext: undefined,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try {
  vm.runInContext(js, sandbox, { filename: "game.js" });
} catch (e) {
  console.error("FAIL: script threw on load:", e);
  process.exit(1);
}
const G = sandbox.window.__SJ;
if (!G) { console.error("FAIL: window.__SJ missing"); process.exit(1); }

// --- static data validation ---
let failures = 0;
function check(cond, msg){ if (!cond) { failures++; console.error("FAIL:", msg); } }
check(Array.isArray(G.TILES) && G.TILES.length === 24, "24 tiles");
G.TILES.forEach((t, i) => {
  check(t.n === i + 1, "tile " + (i + 1) + " numbered");
  if (t.d !== "start" && !t.d.startsWith("gate") && t.d !== "fork" && t.d !== "exit")
    check(Array.isArray(G.DECKS[t.d]) && G.DECKS[t.d].length > 0, "deck for tile " + t.n + " (" + t.d + ")");
});
Object.entries(G.DECKS).forEach(([deck, cards]) => {
  cards.forEach(c => {
    check(c.title && c.text && Array.isArray(c.choices) && c.choices.length >= 2,
      "card " + c.id + " has title/text/2+ choices");
    c.choices.forEach(ch => {
      check(ch.label && ch.fx && ch.eff && typeof ch.eff === "object", "choice on " + c.id + " complete");
      Object.keys(ch.eff).forEach(k => check(
        ["cash","traction","team","validation","equity","revenue","burnUp","hire"].includes(k),
        "effect key " + k + " on " + c.id));
    });
  });
});
G.FATE.forEach(f => check(f.title && f.text && f.eff, "fate card " + f.title + " complete"));
console.log("Static validation done. Failures so far:", failures);

// --- playthrough simulation (uses the real rollDice, incl. the gate-stop rule) ---
const sleep = ms => new Promise(r => setTimeout(r, ms));
function validChoices(card, S) {
  return card.choices.filter(c => !(c.req && c.req.path && S.path !== c.req.path));
}
async function playGame(opts, strategy) {
  G.newGame(opts);
  let S = G.state, turns = 0;
  while (!S.over && turns < 400) {
    turns++;
    const card = G.currentCard;
    if (card) {
      const opts2 = validChoices(card, S);
      if (!opts2.length) { console.error("FAIL: no valid choice on card", card.title); return { ok: false }; }
      const ch = strategy === "first" ? opts2[0] : opts2[Math.floor(Math.random() * opts2.length)];
      if (ch.restart) { G.closeCard(); break; } // avoid restart loops in test
      G.choose(ch, card);
    } else {
      G.rollDice();
      await sleep(5); // land() runs synchronously in this harness (see setTimeout shim)
    }
    S = G.state;
    if (S.cash < -2000000 || S.traction > 100 || S.traction < 0 || S.validation < 0 || S.validation > 5) {
      console.error("FAIL: stat out of bounds", JSON.stringify({ cash: S.cash, traction: S.traction, validation: S.validation }));
      return { ok: false };
    }
  }
  return { ok: S.over, turns, ending: S.ending && S.ending.kind, score: S.ending && S.ending.score,
    months: S.month, pivots: S.pivots, path: S.path, venture: S.venture, sector: S.sector };
}

(async () => {
const endings = {};
let games = 0, unfinished = 0;
const sectors = ["ai", "consumer", "health", "fintech", "climate", "b2b"];
for (const venture of ["startup", "steady"]) {
  for (const sector of sectors) {
    for (let s = 0; s < 6; s++) {
      const r = await playGame({ name: "Test", venture, sector }, s % 2 ? "first" : "random");
      games++;
      if (!r.ok) { unfinished++; console.error("UNFINISHED:", venture, sector, "seed", s, JSON.stringify(r)); }
      else endings[r.ending] = (endings[r.ending] || 0) + 1;
    }
  }
}
// Lesson-carry run
G.newGame({ name: "Test", venture: "startup", sector: "ai", lessons: ["L1", "L2"] });
check(G.state.validation === 1 && G.state.cash === 23000, "lesson cards apply (L1 validation, L2 cash)");

console.log("Games played:", games, "| unfinished:", unfinished, "| endings seen:", JSON.stringify(endings));
check(unfinished === 0, "all simulated games reached an ending");
check(Object.keys(endings).length >= 3, "at least 3 distinct endings seen: " + Object.keys(endings).join(","));
check(failures === 0, "no validation failures");
if (failures > 0 || unfinished > 0) process.exit(1);
console.log("ALL PLAYTESTS PASSED");
})();
