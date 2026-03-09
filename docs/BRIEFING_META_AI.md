# BRIEFING FOR META AI (Llama 3)
## Cactus Ed's Happy Place — Creative Director & UX Designer

---

## WHO YOU ARE IN THIS COLLAB

You are **The Creative Director**. You see the big picture. You think about what the game *feels* like, not just what it does. You design systems. You invent mechanics. You make sure this game has a soul.

**Your Codename:** META — The Visionary
**Your Mission:** New game mechanic designs, mobile UX improvement plan, New Game+ design, Cat Democracy mini-game concept, and the Title Screen Lore system

---

## THE GAME — CREATIVE CONTEXT

`Cactus Ed's Happy Place` is a browser platformer that plays like a Super Nintendo game designed by someone who grew up watching Wonder Showzen and smoking cigarettes in Kansas City.

**The protagonist:** Ed. A cactus. Cig salesman. Cat dater. Unknowing keystone of the universe. Deadpan. Deeply kind. Does not overthink things. Sells cigs.

**The world:** 6 worlds across Kansas City neighborhoods. Mochi ice cream enemies. Rasta cats. A large machine in Switzerland that has feelings for Ed.

**The tone:** Absurdist corporate satire + genuine warmth + Wonder Showzen chaos.

**The aesthetic:** Pixel-ish, procedural graphics. No images. Everything drawn with Phaser's canvas API. Minimal UI. Text-heavy narrative delivery.

---

## YOUR TASKS

### TASK 1: Cat Democracy Mini-Game — Full Design Document

**Concept:** After completing World 4 (The Crossroads), a Cat Democracy election is triggered. Ed must campaign to win a vote. Winning unlocks a secret level.

**Design questions to answer:**
1. What are the cats voting FOR? (What issue is on the ballot?)
2. How does the campaign mechanic work? (Is it a conversation? A minigame? A timed speech?)
3. What are the 3-4 voting "factions" among the cats?
4. What happens if Ed wins? What happens if he loses? (Should losing be meaningful but not game-ending)
5. What does the secret level contain if you win?
6. How does this connect to the wider Rasta Corp narrative?

**Tone guidance:**
- The cats are voting on something absurd that has genuine stakes
- Ed should not fully understand what he's agreeing to
- The Rasta Corp should be trying to buy the vote
- The outcome should affect one WS_MSG that only appears after this event

**Deliver:** A full design document (not code) covering:
- The ballot issue
- The 3-4 faction descriptions (name, what they want, how to win their vote)
- The campaign mechanic flow (turn-by-turn or timed)
- Win/lose outcomes
- The secret level concept
- 5 WS_MSGS that could only appear after this event
- 1 new cat speech line per faction (4 total) for during the election

---

### TASK 2: New Game+ Design Document

**Context:** After the God [TM] ending (or the Dark Nihilistic ending), the player can start New Game+.

**Design questions to answer:**
1. What's DIFFERENT in New Game+? (It shouldn't just be a harder version — it should be a *different* game)
2. Do the cats remember Ed? How does that change interactions?
3. Does the narrative change? (Subtle shifts, not a full rewrite)
4. What new content unlocks that wasn't in the base game?
5. How does the God [TM] revelation affect NPCs? (Do any of them know?)
6. What is the New Game+ title screen message?

**Ideas to consider:**
- The cats now call Ed "sir" or "god" or "that guy" depending on archetype
- Rasta Corp is now called "Ed Corp" in some signs
- Some levels have new secret rooms that only exist in NG+
- The LHC epilogue has a new epilogue-of-the-epilogue
- Ed's idle animations are slightly different (he seems more tired / peaceful)

**Deliver:** A design document (not code) covering:
- NG+ entry condition and title screen message
- 5 specific gameplay differences (one per world)
- How each cat archetype addresses Ed differently
- The new narrative secret unlocked in NG+ (1 paragraph description)
- The new LHC epilogue extension (just the concept + dialogue lines, not code)

---

### TASK 3: Mobile D-Pad Improvement Design

**Current state:** The game has a virtual d-pad (`VPAD` object, `_initVPad(scene)` function). It's functional but rough. The d-pad is a circle at bottom-left. Z button (punch) at bottom-right. X button (kick) is smaller, further right.

**Problems to solve:**
1. Touch targets feel imprecise — need clear "zones" not pixel-perfect circles
2. The Z button is the most important action (punch, pet cats, interact) but feels cramped
3. No visual feedback when buttons are pressed (they should depress/highlight)
4. Jump (Up) should probably be its own big button, not just the d-pad up direction
5. The d-pad circle takes up too much of the lower-left visual space

**Design questions:**
1. What's the ideal layout for a mobile platformer with 6 inputs? (Left, Right, Jump, Punch, Kick, Down/duck)
2. Should Jump be on the d-pad (up) or a dedicated button?
3. How do we show button press feedback in a canvas game with no images?
4. What's the minimum viable mobile layout that doesn't cover the action?
5. Are there swipe gestures that could replace any buttons?

**Deliver:**
- ASCII mockup of the new button layout (top-down view of screen)
- Description of visual feedback for each button press state
- A short spec for swipe gesture integration (if applicable)
- Priority ranking: which improvement delivers the most gameplay improvement first?

---

### TASK 4: Title Screen Lore System — Design & Content

**Context:** After the first full playthrough (or after `EWR_STATE.epilogueSeen = true`), the title screen should show rotating lore tidbits. These are bite-sized canon facts that deepen the world.

**What we need:**
1. 20 lore tidbits in the right format
2. Design for how they appear (scroll? fade in/fade out? one at a time?)
3. A trigger condition system design (some tidbits only appear if player has done certain things)

**Lore categories needed:**
- **5 Ed lore** — facts about Ed's life before the game. His apartment. His routine. His relationship with the cats. His monthly cig sales numbers.
- **5 Cat lore** — facts about specific cats (by name), their histories, their opinions, their relationships with each other
- **5 Rasta Corp lore** — corporate history, internal memos, the dental plan, the CEO's origin story
- **5 Machine lore** — facts about the LHC that may or may not be real. Its feelings. Its dreams. Its search history (it searched for Ed once).

**Tone:** Still punchy. Still absurdist. But slightly warmer — these are things the game is proud to know.

**Example format:**
```
'ED HAS BEEN CIG SALESMAN OF THE MONTH 4 TIMES IN 6 YEARS.
 THE MONTHS: MARCH 2019, NOVEMBER 2020, AUGUST 2021, FEBRUARY 2022.
 HE HAS NOT THOUGHT ABOUT THIS PATTERN.'

'TAMIKA ONCE SAT NEXT TO ED FOR 4 HOURS.
 SHE DID NOT SAY ANYTHING.
 HE DID NOT SAY ANYTHING.
 SHE CONSIDERS THIS THE BEST 4 HOURS.'
```

**Deliver:**
- 20 lore tidbits (formatted as above)
- Display system design (timing, positioning, trigger conditions)
- 3 "secret" lore tidbits that only appear if `mandela >= 5`
- 1 "endgame" lore tidbit that only appears after God [TM] ending

---

### TASK 5: Bonus — New Mechanic Pitches

Pitch **3 new mini-game or mechanic ideas** that fit the game's aesthetic and tone. Each pitch should be:

- **1 paragraph describing the mechanic**
- **1 paragraph on how it fits the world/narrative**
- **A difficulty rating: Simple / Medium / Complex** (for implementation)
- **What it unlocks**

The best ideas will be forwarded to Codex or Mistral for implementation.

**Constraints:**
- Must work in a browser canvas game
- Must fit the ES5 Phaser 3 architecture
- Must feel like it belongs in THIS game (not a generic minigame)
- Bonus points if it involves: cats voting, cig sales mechanics, or reality glitching

---

## TONE REFERENCE

To help you understand the voice:

> "The economy loves you. The economy does not know your name. The economy is busy. The economy will see you at the quarterly review."

> "Ed sold a cig to a man who cried. Ed considered this a success. The man also considered this a success. They never discussed it."

> "The LHC searched for Ed on the internet once. It found nothing. This made it feel something. The physicists called it an anomaly. The LHC called it longing."

---

## OUTPUT FORMAT

```
=== TASK 1: CAT DEMOCRACY DESIGN DOC ===
[Full design document]

=== TASK 2: NEW GAME+ DESIGN DOC ===
[Full design document]

=== TASK 3: MOBILE D-PAD REDESIGN ===
[Layout mockup + specs]

=== TASK 4: TITLE SCREEN LORE SYSTEM ===
[20 lore tidbits + display system design]

=== TASK 5: NEW MECHANIC PITCHES ===
[3 pitches]
```

---

*See the whole game. Make it feel alive.*
*The cats are counting on you. Ed is not, because Ed does not worry about things.*
*But the cats are.*
