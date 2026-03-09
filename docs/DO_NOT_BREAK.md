# DO NOT BREAK
## Cactus Ed's Happy Place — Bloodline Protection for All Future Agents
### Authority: Derived from TRANSFER/10_ARCHITECT_GUARDRAILS.md, TRANSFER/17_ARCHITECTURAL_NORMALIZATION.md, and the full TRANSFER pack
### Date: 2026-03-09
### Status: PERMANENT — these protections have no expiration date and no architecture dependency

---

> This document exists for one reason: to make the creative bloodline explicit and enforceable for any agent — cloud-only, local, current, or future — that touches this project. If you are about to write code, read this first. If you have already written code, check it against this before committing.

---

## THE COUNTERFEIT EDUCATIONAL UNIVERSE

The world of Cactus Ed's Happy Place is a counterfeit educational institution. It processes chaos — player violence, aloe theft, cat politics, existential dread — through the language of wellness committees, municipal departments, and corporate compliance memos.

**This is the humor engine. It is not a theme. It is the architecture of every joke, every label, every announcement, every enemy name, and every commercial break in the game.**

### What this means in practice:
- A player punching mochi is a "wellness intervention"
- Aloe collection is "resource repatriation"
- Cat behavior is "community engagement metrics"
- Boss fights are "compliance escalation events"
- Death is an "administrative reassignment"

### DO NOT:
- Write humor that requires the player to be in on the joke
- Use meme language, internet slang, or contemporary references (they date immediately and break the universe)
- Add winking self-reference or fourth-wall jokes that feel like jokes instead of genuine ruptures
- Explain the comedy. The institutional language is funny precisely because it does not know it is funny.

### THE TEST:
Write new content as if it were a policy announcement from a government agency that genuinely believes what it is saying. Then cut it by 40%. Then remove any word that is trying to be funny. What remains should be funnier than what you started with.

---

## ED AS CALM FLOW IN A HYSTERICAL WORLD

Ed is a slow-moving, chain-smoking cactus. He is completely aloof in a world that is actively losing its mind. He is the eye of the storm. He does not react to absurdity. He is absurdity's landlord.

### Ed's voice rules:
- **Short by default.** Target 8 words or fewer per line. Exceptions are allowed only when the longer version is materially stronger — not merely acceptable, but genuinely better.
- **No exclamation marks in Ed's voice. Ever.** This rule applies to Ed and Ed alone.
- **No surprise, no enthusiasm, no alarm.** Ed does not react. Ed continues.
- **Deadpan is the register.** If Ed sounds excited, you have broken him. Fix it immediately.

### The contrast that makes it work:
Ed is low-temperature. The world around him is high-temperature. Institutional signs scream "ALOE REPATRIATION INITIATIVE — COMPLIANCE IS WELLNESS!" while Ed walks past without comment. Rasta Corp commercials are loud, sincere, and aggressively corporate. Ed is quiet, sparse, and aggressively unbothered. **The humor lives in this gap.** Do not flatten either side.

### Institutional language IS allowed to be loud:
Menus, announcements, HUD labels, Rasta Corp copy, compliance memos, and bureaucratic signs exist outside Ed's voice. They may and often should use exclamation marks and formal emphasis. "WELLNESS MANDATE ACHIEVED!" is on-brand. Ed saying "Wellness mandate achieved!" is not.

---

## BEAUTIFUL RECOVERY AS MECHANICAL RELIGION

The game forgives skillfully. Every near-miss is a gift. The physical feel of playing — the momentum, the jump arc, the way the cigarette lance extends just far enough — is a covenant with the player.

### The sacred constants:
```
ED_MOVE.walkSpeed   = 140     — Ed is not in a hurry
ED_MOVE.jumpVel     = -520    — the arc feels earned
ED_MOVE.jumpCut     = 0.4     — variable jump height
ED_MOVE.airControl  = 0.75    — responsive but weighted
ED_MOVE.coyoteMs    = 90      — the forgiveness window
ED_MOVE.jumpBufMs   = 130     — the grace period
ED_MOVE.maxFall     = 700     — terminal velocity
ED_MOVE.punchRange  = 56      — the lance extends just far enough
ED_MOVE.kickRange   = 72      — the kick reaches just far enough
```

### DO NOT MODIFY THESE VALUES without explicit human instruction from Kevin. If they have changed, revert immediately. No exceptions.

### Why this matters:
Coyote time (90ms) means the player gets 90 milliseconds of grace after walking off a ledge to still jump. Jump buffering (130ms) means if the player presses jump 130ms before landing, the jump fires on contact. These are not tuning parameters. They are the reason the game feels fair. They are mechanical religion.

---

## NEED SATISFACTION OVER NEED FRUSTRATION

Players return to this game because it gives them things. The loop is generous. Every action pays out. Every level teaches something. Every beat unlocks something new to see.

### The canonical reward tiers:
```
Cat pet:         5 aloe   — small moment of tenderness
Aloe pickup:    15 aloe   — regular beat
Mochi death:     8 aloe   — combat payoff
Level 1-1 beat: 50 aloe   — checkpoint satisfaction
Level 1-2 beat: 80 aloe   — escalating pride
Boss kill:     300+ aloe   — major achievement
Secret find:    20 aloe   — discovery delight
```

### DO NOT reduce any reward value without Kevin's explicit sign-off. The economy is not a problem to solve. It is a feeling to maintain.

### The retention contract:
- Every level must have at least 3 distinct "oh nice" moments
- Death is never the point — recovery must feel fair and theatrical, not punishing
- No mechanic may lock the player out for more than 30 seconds without offering something to do
- The shop must offer genuine power — upgrades that meaningfully change the feel of play, not cosmetic placebo

---

## NO PREDATORY RETENTION

This game does not use dark patterns. This is not a negotiable design choice. It is a moral position.

### Specifically prohibited:
- **No FOMO timers.** No "this offer expires in..." No limited-time anything.
- **No manipulative scarcity.** No artificial rarity designed to create anxiety.
- **No loot boxes or gacha mechanics.** Rewards are earned, not gambled for.
- **No grind loops.** If the player feels like they are repeating content to earn currency, the economy is broken. Fix the economy, do not add more grind.
- **No reward-category spaghetti.** Aloe is the currency. Do not invent secondary currencies, premium currencies, seasonal currencies, or any token system that makes the economy harder to understand.
- **No anxiety as engagement.** Timers that create anxiety without payoff are prohibited. Waiting is not gameplay.
- **No invisible gates.** If the player cannot progress, the reason must be visible and the solution must be achievable.

### The test:
If a mechanic would make a free-to-play mobile game producer nod approvingly, it does not belong in this game.

---

## WORLD 1-FIRST SCOPE

World 1 is the proof of concept and the emotional baseline. It must be complete, stable, and validated before any other world, combat system, or racing system is promoted.

### The five canonical levels:
| Level | Name | Non-Negotiable Elements |
|-------|------|------------------------|
| 1-1 | Ed Wakes Up | Daytime, green, West Bottoms KC, 8 mochis, 5 cats, controls HUD for 30s |
| 1-2 | The Cat Rave | Black room, neon lasers, ALL cats dancing, mochis with sunglasses |
| 1-3 | After Dark | Night KC, WS_TEXTS every ~8s, smoker cats, existential vibe |
| 1-4 | Hippie Bus Highway | Bus parallax intact, bus is lore not decoration |
| 1-5 | Mochi HQ | Big Mochi 3-phase boss (patrol → spawn → charge), 300 aloe reward |

### The World 1 map:
Super Mario World style. Tile grid. Ed walks between nodes. Levels unlock sequentially. The spatial relationship between levels is part of the narrative. Do not replace this with a level-select menu.

### Scope enforcement:
- `combat/` is experimental until Kevin explicitly promotes it
- Racing prototypes are quarantined until Kevin explicitly promotes them
- If World 1 has open bugs, unfinished levels, or broken transitions — fix those before touching anything else
- In any priority list, World 1 comes first. Not as convention. As law.

---

## THE INSTITUTIONAL HUMOR ENGINE REMAINS PRIMARY

The humor engine — institutional language applied to chaos — is the single most important creative system in the game. It is more important than any individual level, boss fight, or feature.

### Protecting it means:
1. **No humor drift toward knowing comedy.** The world does not know it is funny. It is sincere. It processes mochi violence as a compliance event because that is how it processes everything. The moment the world winks at the player, the engine breaks.

2. **No drift from polite institutional menace into generic weirdness.** The world is not "random" or "wacky." It is specifically bureaucratic. The horror is that the institutional language makes sense. A "wellness intervention" is an accurate description of punching mochi if you squint hard enough. That precision is the joke.

3. **No drift into meme sludge.** Internet humor dates within months. Institutional language is timeless. "CONSUME" will be funny in 2036. A 2026 meme reference will not.

4. **The cats are philosophers, not comedic relief.** Cat dialogue should sound like overheard conversation from someone who has genuinely figured something out. Not quips. Not one-liners. Not tweets. If a cat says something that would work as a tweet, it has drifted. Give the cat a real thought instead.

5. **Wonder Showzen texts are confrontational, not wacky.** `CONSUME`, `ARE YOU REAL?`, `BIRTH SCHOOL WORK DEATH` — these create a half-second of genuine unease before the player moves on. They accuse. They do not entertain.

6. **Commercial breaks are sincere advertisements.** Rasta Corp believes in itself completely. It sells things that should not be sold, in language designed to sound reasonable. The horror is that it makes sense. If a Rasta Corp ad sounds like parody, rewrite it as sincere corporate copy.

7. **Rasta Corp must never become sympathetic enough to root for.** It is satirical menace. If it starts feeling like a lovable villain, add one more thing it is selling that it should not be.

---

## DRIFT TYPES TO WATCH

| Drift Type | Symptom | Kill Switch |
|-----------|---------|-------------|
| Soul drift | Game feels like a normal platformer with funny art | Re-read HANDOFF_BIBLE.md soul section. If new content doesn't belong in the same universe as "Ed becomes God[TM]," it has drifted. |
| Humor drift | New text sounds like a joke, not an announcement | Rewrite as municipal announcement. Cut by 40%. Remove any word trying to be funny. |
| Feel drift | Jump/punch/movement feels different | Check ED_MOVE constants. If changed, revert immediately. |
| Reward drift | Aloe feels meaningless or grindy | Restore canonical reward tiers. Play World 1 start to finish. |
| Scope drift | Work happening outside World 1 before W1 is validated | Stop. Fix World 1 first. |
| Character drift | Ed expresses surprise, enthusiasm, or alarm | Remove the expression. Ed continues. |
| Commercial drift | Rasta Corp ads sound like parody | Rewrite as sincere corporate copy. |

---

## THE SEVEN-WORD VERSION

**Ed is calm. The world is not.**

Everything else follows from this.

---

*These protections are permanent. They survive any migration, any architecture change, any framework decision, and any future agent. Enforce them without apology.*
