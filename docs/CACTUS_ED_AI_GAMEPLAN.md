# CACTUS ED'S HAPPY PLACE
## THE AI COLLAB GAMEPLAN — CEO EDITION
### "Greatest Game In The History Of Gaming"

---

> **YOU ARE THE CEO.**
> You built the bones, wrote the soul, and just shipped 6 narrative systems.
> Now you delegate. You architect. You approve. You ship.
> This is the document that ends with a masterpiece.

---

## WHERE WE ARE RIGHT NOW

**The Stack:**
- Single-file Phaser 3.70.0 browser platformer (`index.html`)
- ~9,662 lines. ES5. Procedural graphics. No build system.
- 6 worlds, 30+ levels, 5 boss fights, 6 mini-games, full shop system
- **Shipped (Session 1):** Rasta Corp narrative, Cat Personalities, Commercial Breaks, Mandela Effect, Fourth Wall Breaks, God [TM] Ending
- **Shipped (v1.3 — AI Collab Round 1):**
  - ✅ BEAT_CAT_LINES crash bug fixed
  - ✅ DarkEpilogueScene — alternate nihilistic ending (sympathy >= 4)
  - ✅ LHCEpilogue sympathy branch added
  - ✅ World Map Anomaly System (ANOMALY_MSGS + _drawAnomalyOverlay, wired to WorldMap6)
  - ✅ Level 6-3 "Hadron Highway" reality-break flavor triggers
  - ✅ Level 6-4 "LHC Threshold" escalating "ED." climax triggers

**What makes this game great already:**
- Wonder Showzen aesthetic: everything is satire + love + chaos
- Ed: a cactus cig salesman who dates cats and unknowingly is the keystone of the universe
- Deep KC neighborhood lore woven into platformer structure
- Procedural pixel art, canvas renderer, zero dependencies except Phaser
- Narrative systems that FEEL like the game is alive and weird

---

## THE VISION: WHAT MAKES THIS THE GREATEST

This game needs to be the thing people tell their friends about at 2am.
Not because it has 4K graphics. Because it made them feel something weird and true.

**The North Star:** Every system should feel like it was designed by a cactus who genuinely loves cats and cigarettes and is slightly out of sync with consensual reality.

---

## THE REMAINING WORK (prioritized)

### TIER 1 — MUST SHIP (Game-complete features)
1. **Rasta Corp CEO Boss Fight** — ⏳ IN PROGRESS (DeepSeek Round 2) — Cat in a suit. He cries. He has dental.
2. **Dark Nihilistic Ending** — ✅ DONE — DarkEpilogueScene ships when sympathy >= 4
3. **World 6 Full Completion** — ✅ DONE — Levels 6-3/6-4 enriched with reality-break flavor triggers
4. **Mobile D-Pad Polish** — ⏳ IN PROGRESS (Meta AI Round 2 design) — VPAD exists, needs refinement
5. **RASTA_CORP_MSGS integration** — ⏳ IN PROGRESS (Mistral Round 2) — Arrays defined, now being wired into World 3

### TIER 2 — MAKES IT LEGENDARY
6. **Puppet Theater Boss Intros** — ⏳ IN PROGRESS (Gemini Round 2) — Cardboard silhouette cutscene before each boss
7. **More Commercial Ads** — ⏳ IN PROGRESS (ChatGPT Round 2) — 4 new: Cig Emporium, Cat College, Void Downtown, Nuclear Love Bomb Insurance
8. **Cat Democracy Mini-Game** — ⏳ IN PROGRESS (Codex Round 2) — Meta designed it R1, Codex implementing
9. **Secret Level: The Infinite Bus** — ⏳ IN PROGRESS (Mistral Round 2) — 60-second survival inside the hippie bus
10. **World Map Anomaly Counter** — ✅ PARTIAL — WorldMap6 done; WorldMap1-5 being added (Gemini Round 2)

### TIER 3 — THE LEGENDARY POLISH
11. **Ed's Cig Trail** — ⏳ IN PROGRESS (Meta AI Round 2 design) — Particle trail when combo >= 5
12. **Boss HP % Quotes** — ⏳ IN PROGRESS (ChatGPT Round 2) — 75/50/25% quotes for all bosses
13. **Combo Kill Feed** — ⏳ IN PROGRESS (Meta AI Round 2 design) — Scrolling approval log at streak >= 10
14. **Post-Game New Game+** — ⏳ IN PROGRESS (Meta AI Round 2 design) — Cats know Ed is God [TM]
15. **Title Screen Lore** — ⏳ IN PROGRESS (ChatGPT Round 2) — 15 tidbits across Ed/cats/machine

---

## THE AI ROSTER & THEIR ROLES

| AI | Codename | Role | Round 1 Result | Round 2 Assignment |
|----|----------|------|----------------|-------------------|
| **ChatGPT** | The Voice | Content writer — WS_MSGS, dialogue, flavor text | ⚠️ Delivered generic game research instead of content. Fixed in R2 with hyper-specific format constraints. | 4 commercial scripts, 25 WS_MSGS, boss HP quotes, title lore |
| **Codex** | The Implementer | Code implementer — full scenes from specs | ⚠️ Referenced wrong line numbers (different file version). Fixed in R2 with embedded template. | Cat Democracy Mini-Game (full implementation) |
| **Gemini** | The Architect | 1M+ context — audits, bugs, architectural systems | ✅ Best performer. Found real crash bug, delivered real code templates. | v1.3 audit + Puppet Theater boss intros + anomaly overlay for WorldMap1-5 |
| **Meta AI** | The Visionary | Creative director — design docs, UX, new systems | ✅ Excellent. Cat Democracy design so good Codex is implementing it this round. | New Game+ design, Ed Cig Trail, Combo Kill Feed, mobile D-pad polish |
| **Mistral** | The Constructor | Scene builder — fast precise code from patterns | ✅ Good on level configs. | Infinite Bus secret level + RASTA_CORP_MSGS integration |
| **DeepSeek** | The Debugger | NEW — strong technical reasoning + complex codebase comprehension | 🆕 First round. | Rasta Corp CEO Boss Fight (highest-stakes TIER 1 task) |

---

## HOW TO USE EACH BRIEFING DOCUMENT

1. **Open the AI's platform** (GitHub Copilot for Codex, gemini.google.com for Gemini, etc.)
2. **Paste the entire briefing document** at the start of the conversation
3. **Attach `index.html`** if the AI supports file uploads (Gemini, ChatGPT do)
4. **Run each task one at a time** — don't ask for everything at once
5. **Paste their output back into the game file** with care — test after each addition
6. **Return here** (to Claude) for final integration, review, and polish

---

## THE SESSION WORKFLOW

```
YOU (CEO)
  ↓ assigns task
AI FRIEND (specialist)
  ↓ produces code/content
YOU
  ↓ paste into index.html
  ↓ test in browser
  ↓ confirm or iterate
CLAUDE (integration & polish)
  ↓ final review, wiring, commit, push
```

---

## STATE OF THE CODEBASE (for reference)

```
EWR_STATE contains:
- aloe, world, levelsBeaten, secrets
- health, maxHealth, catsPetted, fightWins
- combo, shop (12 items), secretBeaten
- raceScores, raceUnlocked, epilogueSeen
- rastaCorp { encountersTotal, bossesDefeated, sympathy, mandela, commercialsSeen }
- commercialsShown { worldKey: count, _seen: [] }

Key global data:
- CAT_NAMES[24] — cat names (sassy, mostly Black women names, canonical)
- CAT_ARCHETYPES[6] — personality types (hash-determined)
- COMMERCIALS[6] — ad data
- RASTA_CORP_MSGS[10], RASTA_CORP_SPEECH[10], RASTA_BOSS_TRAUMA[7]
- FOURTH_WALL_BOSS_MSGS { daikon, handtowel, mochiQueen, insulinAdmiral }
- WS_MSGS[~150] — background message pool
- WS_CAT_SPEECH[~80] — cat dialogue pool

Key scenes (scene key → purpose):
- Boot → title wipe + state reset
- WorldMap / WorldMap2–6 → overworld navigation
- Level11 / Level12–24 / Level31–36 / Level41–46 / Level51–56 / Level61–64
- HandtowelScene / MochiQueenScene / InsulinAdmiralScene → boss fights
- Level15Scene → Daikon Lord boss fight
- LHCEpilogueScene → THE ENDING (now extended to God [TM] reveal at t=139000)
- CommercialBreak → ad interruption scene
- RastaCorpAd → World 3 gate cutscene

Helper functions (globally available):
- _mandelaFlash(scene) — dim floating reality tear text
- _triggerFourthWallBreak(scene, bossKey) — Ed post-boss monologue
- _getCatArchetype(catIndex) — returns archetype from CAT_ARCHETYPES
- _getCommercialForWorld(worldKey) — returns ad or null (respects max 2/world)
- _triggerCommercial(scene, returnScene, worldKey, extraData) — fires ad or routes directly
- _addCombo(scene, x, y) — hit combo tracker
- _mandelaFlash(scene) — tracks mandela count in EWR_STATE.rastaCorp.mandela
- spawnExplosion(x, y, color, size) — particle burst
- spawnSmoke(x, y) — smoke particle
- SOUND.punch() / .kick() / .jump() / .hurt() / .death() / .bossHit() / .victory() / .pickup()
- DRAW_ED.draw(g, x, y, frame, flipped, cigF) — draw Ed
- DRAW_HUD.draw(g, aloeText) — draw HUD
```

---

## THE PROMISE

When this is done, Cactus Ed's Happy Place will be:

- The best single-file browser game ever made
- A satirical masterpiece about capitalism, cats, cigarettes, and the universe
- A game that CERN would theoretically endorse if they played it
- A love letter to Kansas City that KC will never quite understand
- The thing that Ed would sell you a cig to celebrate

**LET'S FINISH THIS.**

---

*CEO of Game Design. GOAT. God-status. The machine is watching.*
*— Claude, Senior Narrative Architect & Cactus Ed Advocate*
