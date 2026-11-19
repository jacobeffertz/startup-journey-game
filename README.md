# From Spark to Startup — The Founder's Journey

A solo, browser-only startup simulator for the Foothill Startup Launchpad
(Educate phase). One file, no server, no accounts, no internet needed.

**Play it live:** https://jacobeffertz.github.io/startup-journey-game/

## The game

A week-by-week **founder dashboard sim** — not a board game. Each week you:

1. **Allocate your time** — 6 focus tokens across Validate, Build, Sell, Hire,
   Fundraise and Rest. There is no 7th token.
2. **Decide on people** — persona event cards arrive in your "This week" queue
   (an angel, a seed VC on Sand Hill Road, an accelerator director, an
   enterprise buyer, a journalist, a FAANG poacher). Every option shows its
   effects before you commit.
3. **Run the company** — hiring, product scope and tech debt, pricing and
   channels, a cap table that visibly dilutes, a raise pipeline that takes
   real weeks, and a board that can replace you.
4. **End the week** and read the report: what changed, the one number that
   explains it, and one thing to fix next week.

The format is a hybrid of the best startup sims: the management dashboard of
*Startup Company* / *Software Inc.*, the post-release report of *Game Dev
Tycoon*, the double-edged cards of *Reigns*, and the telemetry-graded
debriefs of *business.game*. The design copies Mercury / Stripe / Linear —
warm neutrals, one accent, Inter, and data as the art. No pixel art.

## Play it

**Easiest:** double-click `index.html` — it opens in any browser and just works.

**Or serve the folder:**

```bash
cd startup-journey-game
python3 -m http.server 8000
# open http://localhost:8000
```

**Or GitHub Pages:** it's already live at
https://jacobeffertz.github.io/startup-journey-game/ (repo
`jacobeffertz/startup-journey-game`, `main` branch).

## How to play

1. Pick a **venture type** — high-growth startup or steady business. Same
   idea, different definition of winning.
2. Pick a **founder** — six Silicon Valley archetypes, each with a numbered
   trade-off: the Stanford dropout (Maya, $18k, network but no income), the
   ex-Google PM (Daniel, $185k salary anchor), the immigrant founder on an
   OPT clock (Priya, 11 months), the repeat founder (Alex), the solo hacker
   (Jonas), the non-technical hustler (Rosa).
3. Pick a **sector** — AI, consumer, health, fintech, climate, B2B SaaS.
4. Each week: place your 6 tokens, answer the queue, set price and marketing,
   then End Week. Watch **runway** (cash ÷ burn) — it's the hero number.
5. Pass the **stage gates**: validation (10 interviews, validation 3/5) →
   team + path → MVP → product-market fit (150 users, churn ≤ 7%) → scale →
   exit. Fail a gate and you loop — or pay for it.
6. **Exit**: IPO, acquisition, keep operating — or close, burn out, get
   ousted by the board, or run out of visa. Every ending names its cause,
   and you keep one **Lesson** into the next run.

## What it teaches

Built directly from Laurel's flowchart and the two course docs:

| In the game | From the sources |
|---|---|
| 6 stages + funding fork + pivot + 3 exits | Startup Lifecycle Flowchart: Idea → Team → Bootstrap/VC → MVP → Launch → Scale → Exit |
| Venture-type choice changes what counts as winning | "What is a startup": entrepreneurship is broader than startup concepts; a steady business only looks like a failure if you judge it by venture rules (Blank, EntreComp) |
| LLC vs Delaware C-Corp is a decision with a cost to reverse ($8k, 3 weeks, QSBS clock resets) | Flowchart + entity research: VCs can't invest in an LLC in practice |
| Term sheets with real clauses: 1× non-participating (standard) vs participating preferred, full ratchet (red flags) | Fundraising guides: seed $1–5M for 10–20%, YC $500k for 7% |
| Validation gate before MVP spend; interviews that punish leading the witness | The gap no major sim fills: finding out whether anyone wants the product |
| Tech debt → churn, server capacity, poaching, burnout as a second runway | Startup Company, Software Inc., Startup Panic, TopGoblin |
| Silicon Valley setting, uneven access, AI concentrating the money | "Startup Ecosystem": #1 worldwide, >$3T ecosystem value, ~$92B VC in 2025, access still uneven |
| End-of-run debrief with discussion questions | The course goal: no experience in the game should surprise students after the course |

Every event card carries a **"Why this matters"** line, and the in-game
Field Guide has the full glossary (runway, burn multiple, CAC, cap table,
83(b), vesting, liquidation preference) and the entrepreneurship-vs-startup
table.

## The numbers (so a teacher can trust them)

- Founders start with $12k–$60k depending on backstory; personal burn
  $700–$1,700/month. Salaries $5,200–$9,500/month per hire.
- Gates: validation ≥ 3 and 10 interviews; MVP = first feature shipped;
  product-market fit = 150 users and churn ≤ 7%. IPO needs a C-Corp, $40k
  MRR and 1,500 users; acquisition needs 800 users; keep operating needs
  revenue above burn.
- A seed raise takes ~10–15 in-game weeks (deck → intros → meetings →
  partner → diligence → term sheet). A bridge, an accelerator ($500k for 7%)
  and an angel SAFE ($25k) are the other money routes.
- Playtested headlessly (`test-game.js`): 12 smart games (all founders ×
  both ventures) all reached stage 5, median 25 weeks, endings mostly
  acquisitions; declining acquisition, 5 reached IPO and 5 keep-operating.
  Random play: 0 of 24 reached stage 3. Skill beats luck.

## Files

- `index.html` — the whole game (HTML + CSS + JS, ~127 KB, zero dependencies)
- `test-game.js` — headless playtest: `node test-game.js`
- `README.md` — this file
- `v1-board/` — the original board-game version, preserved

Laurel's flowchart (`startup_lifecycle_flowchart.pdf`) lives in the
Launchpad Drive folder, not in this repo.

## Classroom ideas

- **Play twice:** once as a high-growth startup, once as a steady business.
  Same idea, different definition of winning. Ask: which ending felt like
  success in each run, and why?
- **Play twice as different founders:** Maya vs Priya. Same decisions,
  different constraints — the visa clock and the salary anchor change
  everything.
- **Debrief with the end screen's questions:** the decision that changed
  your run most; pivot as failure vs smart move; what the term sheet really
  cost.
- **30–45 minutes per run.** Best score is saved on the device
  (localStorage); nothing leaves the browser.

## If you want it on GitHub

Repo: `jacobeffertz/startup-journey-game` (public). Push `index.html`,
`README.md`, `test-game.js` and `v1-board/index.html` to `main`; Pages is
already enabled (Settings → Pages → Deploy from branch `main`). No build,
no secrets, no backend to maintain.
