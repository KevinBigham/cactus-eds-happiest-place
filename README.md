# Cactus Ed's Happy Place

> **Play Now:** [Cactus Ed's Happy Place](https://kevinbigham.github.io/Cactus-Eds-Happy-Place/)
> **Latest live game file:** `index.html`

## Fastest Way To Play

1. Click the **Play Now** link above.
2. To play locally from this folder, run:

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```
Then open [http://127.0.0.1:4175/index.html](http://127.0.0.1:4175/index.html).

## Current Build

- Current active scenes: `Title`, `Demo`, `World2`, `World3`
- Current focus: first-session trust, continuity, and boss-approach certification
- The live runtime is the single-file `index.html`
- Some deeper sections below describe older multi-world plans and historical project context; use `index.html` and the play link above as current truth

---

**A chain-smoking cactus walks into the Large Hadron Collider and becomes God.**

Cactus Ed's Happy Place is a browser-based platformer that plays like Wonder Showzen directed a SNES Contra remake while on a bad trip in Kansas City's West Bottoms. You are Ed — an aloof, sunglasses-wearing cactus whose cigarette doubles as a weapon. Fight evil Mochi Ice Cream creatures. Pet sassy cats. Survive commercial interruptions from a sinister corporation. Question the nature of reality. Become God [TM].

No sprites. No build system. No npm. Just one 24,000-line HTML file and pure, unfiltered chaos.

## What Is This?

A psychedelic action-platformer that's equal parts late-capitalism satire, absurdist comedy, and legitimate game engineering. Every pixel is procedurally drawn. Every cat has a name and a personality. Every boss fight comes with an existential crisis.

Ed doesn't want trouble. Ed just wants to smoke and vibe. But the universe has other plans.

### The World

- **6 Worlds** with Super Mario World-style overworld maps
- **30+ Playable Levels** with procedurally generated platforms and enemies
- **5 Boss Fights** — Daikon Lord, Mr. Handtowel, Mochi Queen, Insulin Admiral, and the Rasta Corp CEO
- **6+ Mini-Games** — Slot Machine, Scratch Cards, Nuclear Quiz, Ghost Dodge, F-Zero Racer, Mochi Smash
- **The Cats** — NPCs that dance, smoke, and have names like "Chairman Whiskers." They judge you. You can pet them.

### The Narrative

This isn't just a platformer. There's a whole conspiracy underneath:

- **Rasta Corp** — A sinister corporation that interrupts your game with actual commercial breaks. Your sympathy toward them determines which ending you get.
- **Mandela Effect System** — Reality-glitching messages that float across the screen, questioning what's real
- **4th-Wall Breaks** — Ed delivers deadpan monologues after boss fights about the nature of existence
- **Dark Epilogue** — If your Rasta Corp sympathy is high enough, you get the nihilistic ending
- **LHC Epilogue** — Ed walks into the Large Hadron Collider and becomes God [TM]. That's the real ending. Yes, really.

### Ed's Moveset

Ed is slow. Ed doesn't care. Ed's cigarette IS the weapon.

- **Punch** — The cigarette extends as a lance (56px range). It's exactly as ridiculous as it sounds.
- **Kick** — Leg extends with motion lines (72px range)
- **Walk** — 140 px/s. Ed is not in a hurry.
- **Jump** — Velocity of -520 with coyote frames (90ms) and jump buffering (130ms)

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Phaser 3.70.0 | Game engine (Canvas renderer, loaded via CDN) |
| ES5 JavaScript | Mandatory — no classes, no arrow functions, no let/const |
| HTML5 Canvas | All rendering (zero sprite assets) |
| Single HTML file | The entire game is one file. 24,146 lines. |

**Zero build system. Zero npm. Zero external assets.** Open the HTML file and play. That's it.

### Why ES5?

Not a mistake. A mandate. ES5 prototype-based OOP ensures maximum browser compatibility and forces a specific architectural discipline. The entire codebase uses constructor functions and prototype chains.

### Why One File?

Deployment friction = zero. Share a link, open a file, push to GitHub Pages. Done. The game IS the document.

### Why No Sprites?

Everything is drawn with Phaser Graphics primitives — rectangles, circles, lines, fills. Ed's walk cycle, the Mochi enemies, the cats, the bosses, the entire world. All procedural. All code. The color palette channels Adventure Time's aesthetic through an `AT` config object.

---

## Architecture

**Manual everything:**

- **Physics** — No Phaser Arcade. Ed's state object tracks position, velocity, grounding, and animation frame. Gravity, collision, and movement are hand-coded.
- **Collision** — AABB checks against a `platRects[]` array. No physics engine.
- **Animation** — Frame-based system: 0=idle, 1-3=walk cycle, 4=jump, 5=punch, 6=kick, 7=hurt
- **Combat** — Hitbox extends from Ed's center based on facing direction. Hitstop and knockback are frame-accurate.

**Fighting Engine (Level 15 — Daikon Lord Boss):**

The boss fight system is a separate, deterministic combat engine:

- Fixed-step simulation at 60 Hz
- Input logging and replay capability
- Snapshot/restore for testing
- State hashing for integrity verification
- 5-layer atmosphere rendering stack (parallax + depth)
- Material-tagged procedural generation (ROCK, TECH, ORGANIC, RUINS)
- Inspired by Mortal Kombat and GBA fighting games

**Feature Flags:** ~50+ flags control rendering paths, combat modes, mini-games, and debug overlays. Enables gradual rollouts and A/B testing.

**Global State:**
```
EWR_STATE = {
  aloe, world, levelsBeaten, secrets, health, maxHealth,
  catsPetted, fightWins, combo, shop (12 items), raceScores,
  rastaCorp {encountersTotal, bossesDefeated, sympathy, mandela}
}
```

---

## Project Structure

```
root/
  index.html                        → Canonical World 1 runtime entry
  TRANSFER/                         → Migration/source-of-truth pack (read first)
  docs/                             → Active docs + migration logs
  scripts/                          → Validation utilities
  src/world1/, content/, ui/, ...   → Active modularization scaffold (no build step)
  legacy/quarantine/                → Experimental/legacy material
    ├─ combat/                      → Secondary combat system (quarantined)
    ├─ racing/                      → Racing prototypes (quarantined)
    ├─ runtime-variants/            → Non-canonical HTML variants
    └─ ai-artifacts/, scratch/, docs-archive/
```

---

## The AI Collaboration Model

This is where it gets interesting. Cactus Ed's Happy Place is built by **the most ambitious multi-AI development team you've never heard of:**

- **ChatGPT 5.4** — Project architect. Designs systems, coordinates the build, writes the game plan.
- **OpenAI Codex** — Implements features, writes game logic, handles mini-game mechanics
- **Claude Code** — Modularization, fight engine presentation layer, build validation
- **Google Gemini** — Puppet theater boss intros, world map anomaly systems
- **Meta AI** — Mobile D-pad design, Cat Democracy mini-game design
- **Mistral** — Rasta Corp messaging system, Secret Level: The Infinite Bus
- **DeepSeek** — Rasta Corp CEO boss fight design

Each AI gets a **hyper-specific briefing document** with constraints, ownership boundaries, and style mandates. One feature per AI per round. The human vibes and directs. The AIs build. The game ships.

---

## Current Status

**Playable and deployed.** 6 worlds, 30+ levels, 5 boss fights, 6 mini-games, multiple endings.

**Active development** — Rasta Corp CEO boss fight, mobile polish, and Tier 2 legendary features (Puppet Theater boss intros, Cat Democracy, The Infinite Bus) in progress.

---

## Play It

Open your browser. Click the link. Meet Ed. Pet a cat. Fight some Mochi. Become God.

> [https://kevinbigham.github.io/Cactus-Eds-Happy-Place/](https://kevinbigham.github.io/Cactus-Eds-Happy-Place/)

---

## License

This project is a personal passion project by Kevin Bigham. All rights reserved.
