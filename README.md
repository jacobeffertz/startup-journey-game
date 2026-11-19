# From Spark to Startup — The Founder's Journey

A solo, browser-only startup simulator for the Foothill Startup Launchpad
(Educate phase). One file, no server, no accounts, no internet needed.

## Play it

**Easiest:** double-click `index.html` — it opens in any browser and just works.

**Or serve the folder:**

```bash
cd startup-journey-game
python3 -m http.server 8000
# open http://localhost:8000
```

**Or GitHub Pages:** push this folder to a repo, turn on Pages for the
`main` branch, and anyone with the link can play. No build step.

## How to play

1. Name your founder, pick a **venture type** and a **sector**.
2. Roll the dice (1–4), move along the 24-tile board, and play the card you
   land on. Every card is a decision with its effects shown up front.
3. Watch your **runway** (cash ÷ burn). At $0 the company closes.
4. Pass the **gates**: validation (tile 4), the funding fork (tile 8),
   product-market fit (tile 18). Fail a gate and you go around a **pivot loop**
   — or push on and pay for it.
5. Reach tile 24 and **exit**: IPO, acquisition, keep operating, acqui-hire —
   or wind down. Keep one **Lesson card** and play again, smarter.

Your roll always stops at the next gate: gates are decisions, not scenery.

## What it teaches

Built directly from Laurel's flowchart
(`startup_lifecycle_flowchart.pdf` in this folder) and the two course docs:

| In the game | From the sources |
|---|---|
| 5 stages + funding fork + 2 pivot loops + 3 exits | Startup Lifecycle Flowchart: Idea → Team → Bootstrap/VC → MVP → Launch → Scale → Exit |
| Venture-type choice at the start (high-growth startup vs steady business) changes what counts as winning | "What is a startup": entrepreneurship is broader than startup concepts; a steady business only looks like a failure if you judge it by venture rules (Blank, EntreComp) |
| Sectors (AI, consumer, health, fintech, climate, B2B) change card costs | "What is a startup": an MVP in two weeks works for a consumer app, not for enterprise software sold to banks/hospitals |
| Market conditions, fate cards, rivals, a co-founder getting a job offer | Laurel's brief: skill vs fate — "market conditions, or your co-founder gets a full-time job" |
| Silicon Valley setting, uneven access, AI concentrating the money | "Startup Ecosystem": #1 worldwide, >$3T ecosystem value, ~$92B VC in 2025, access still uneven |
| Team hand: co-founders, advisors, hires with skill points and burn | Flowchart stakeholders: co-founders, legal/IP advisors, angels/VCs, board, C-suite, M&A lawyers |
| End-of-run debrief with discussion questions | The course goal: no experience in the game should surprise students after the course |

Every card carries a **"Why this matters"** line, and the in-game Field Guide
(📖 button) has the full glossary and the entrepreneurship-vs-startup table.

## The numbers (so a teacher can trust them)

- Start: $20,000 (savings + friends-and-family), burn $1,200/month solo,
  +$800/month per full-time hire. Revenue starts at traction 25 and scales
  after product-market fit.
- Gates: validation ≥ 3 (tile 4); product-market fit = traction ≥ 50 and
  validation ≥ 3 (tile 18). IPO needs traction ≥ 75, validation ≥ 4 and the
  VC path (or $100k cash); acquisition needs traction ≥ 55 and team ≥ 6;
  keep operating needs revenue ≥ burn.
- Playtested headlessly (`test-game.js`, 72 simulated games across all
  sectors × both venture types, using the real dice and gate rules):
  all 72 reached an ending — close 37, keep operating 21, IPO 6,
  acquisition 8. Skill matters: a "smart" strategy (validate, build
  traction, hire, take VC deliberately) reached a good ending in 29 of 30
  games; random play only 11 of 30.

## Files

- `index.html` — the whole game (HTML + CSS + JS, ~70 KB, zero dependencies)
- `test-game.js` — headless playtest: `node test-game.js`
- `README.md` — this file

Laurel's flowchart (`startup_lifecycle_flowchart.pdf`) lives in the
Launchpad Drive folder, not in this repo.

## Classroom ideas

- **Play twice:** once as a high-growth startup, once as a steady business.
  Same board, different definition of winning. Ask: which ending felt like
  success in each run, and why?
- **Debrief with the end screen's questions:** the decision that changed
  your run most; pivot as failure vs smart move; what you'd do differently
  in the first three tiles.
- **15–20 minutes per run.** A run is about 12–20 months of game time.
- Best score is saved on the device (localStorage); nothing leaves the browser.

## If you want it on GitHub

Suggested repo: `jacobeffertz/startup-journey-game` (public). Push
`index.html`, `README.md` and `test-game.js` to `main`, enable Pages
(Settings → Pages → Deploy from branch `main`), and share the Pages link
with students. No build, no secrets, no backend to maintain.
