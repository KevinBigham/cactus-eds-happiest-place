# CACTUS ED'S HAPPY PLACE
## BRIEFING FOR: Meta AI — "The Visionary" — ROUND 2
### Role: Creative Director. Systems Designer. The one who makes this feel like art.

---

## WHO YOU ARE IN THIS PROJECT

You design systems. You don't write code — you write **design documents** that are clear enough that a coder can implement them without asking questions.

Last round your Cat Democracy mini-game design was so good we handed it straight to our coder (Codex) to implement. That's the bar. Design with that level of specificity.

**Good news:** Your Cat Democracy design is being implemented! You don't need to redesign it.

---

## THE GAME — CREATIVE CONTEXT

**Cactus Ed's Happy Place** — psychedelic side-scrolling platformer.
Aesthetic: **Wonder Showzen × Adult Swim × Kansas City local color.**

### The Soul:
- **Ed** — chain-smoking cactus, West Bottoms KC, aloof, always right, sells cigarettes
- **Cats** — know everything, say little, have names like Destiny and Chairman Whiskers
- **Rasta Corp** — corporate spirituality empire, monetized enlightenment, sells vibes
- **The Machine** — CERN's Large Hadron Collider, 17 miles underground, becoming aware
- **Aloe** — the currency. It used to mean something.
- **Tone** — funny + sad + weird = the whole point. Ed never tries. The cats always judge.

### Current game systems you should know about:
- **Combo system:** `EWR_STATE.combo = {streak, mult, timer}` — consecutive hits build streak
- **Mandela counter:** `EWR_STATE.rastaCorp.mandela` — tracks reality-bending events
- **SMOKE_POOL:** global array of smoke particle objects
- **VPAD (virtual d-pad):** exists for mobile — left, right, up/down, punch, kick buttons
- **Shop:** 12 purchasable upgrades (doubleJump, speedBoost, explosiveCig, etc.)
- **Epilogue:** Game ends with LHCEpilogue. DarkEpilogue branches off if sympathy >= 4.

---

## TASK 1: NEW GAME+ DESIGN DOCUMENT

**Context:** After the player beats the LHC Epilogue (the true ending), they should be able to start a New Game+ that makes the world subtly different because the cats now **know** Ed was the keystone of the universe.

**Design this system fully. Answer these questions in your doc:**

1. **What triggers NG+?** How does the player start it? (A menu? Automatic after epilogue?)

2. **What changes for the cats?**
   - Do cats speak differently? (Examples of new dialogue lines for each of the 5 archetypes: anxious, nihilistic, spiritual, street-smart, optimistic)
   - Do cats react to Ed's presence? (Do they bow? Clear a path? Pretend they don't see him?)

3. **What changes on the world maps?**
   - Subtle visual differences? (A banner? A single changed sign?)
   - Any tiles renamed or recolored?

4. **What changes in level flavor text?**
   - New `intro` text for at least 3 levels (replace the originals in NG+)
   - Any WS_MSGS replaced?

5. **What changes in the shop?**
   - Any new NG+ exclusive items?
   - Prices adjusted?

6. **The Cig Salesman Arc:**
   - In NG+, Ed's title is "CIG SALESMAN KING OF THE UNIVERSE." Does anything reflect this in the game?
   - Do cats try to buy cigs from Ed? How does this work mechanically?

7. **The Ending in NG+:**
   - Does the LHCEpilogue change? Add 3-5 new lines to the sequence for NG+ runs.
   - Does the dark ending change if sympathy >= 4 in NG+?

**Output format:** Organized design doc with section headers. Be specific. Give actual dialogue lines and visual descriptions, not vague ideas.

---

## TASK 2: ED'S CIG TRAIL — MECHANIC SPEC

**Context:** When Ed's combo streak reaches 5+, a glowing cigarette particle trail should appear behind him as he walks. This is a visual reward for aggressive play, tied to the existing combo system.

**Design this fully:**

1. **Trigger:** At what combo count does the trail start? Does it intensify at higher combos?

2. **Visual description:**
   - Color: What color(s)? (Orange ember? Blue smoke? Describe the gradient.)
   - Particle size and shape: (Small circles? Elongated wisps?)
   - Density: How many particles per second?
   - Fade behavior: How quickly do they fade? Do they rise, drift, fall?

3. **Tie to SMOKE_POOL:** The game already has a global `SMOKE_POOL` array. Each smoke object has `{x, y, vx, vy, alpha, r}`. Describe how the cig trail particles should differ from normal cigarette smoke.

4. **Audio:** Any sound change when the trail activates? (Not required — just consider it.)

5. **UI indicator:** Should the HUD show anything when trail is active? (A glow on the cig icon? A color change on the combo counter?)

6. **Turn off condition:** When does the trail stop? Immediately when combo drops, or does it fade?

7. **Example timeline:** Walk me through 30 seconds of gameplay — when trail appears, intensifies, fades.

---

## TASK 3: COMBO KILL FEED — DESIGN SPEC

**Context:** When Ed's combo streak reaches 10+, a scrolling sidebar log appears showing approval/commentary messages — like a Twitch chat or kill feed but for cactus vibes.

**Design this fully:**

1. **Position:** Where on screen? (Right side? Bottom? Top-right corner?)

2. **Visual style:**
   - Background: transparent? Dark panel? Neon border?
   - Font: monospace? Serif? Size?
   - Color: Matches combo level? Always the same?
   - How many entries show at once?

3. **Content — the messages themselves:**
   Write 20 possible feed messages that appear at various combo milestones. Each 1-5 words. They should feel like absurdist approval:
   - At streak 10: something shocked
   - At streak 15: something reverent
   - At streak 20+: something cosmic
   - Examples to match: "GOD APPROVED", "THE CATS SAW", "RASTA CORP FILED A BRIEF"

4. **Entry behavior:**
   - How do new entries appear? (Fade in from right? Slide up from bottom?)
   - How long does each entry stay before fading?
   - Max entries visible at once?

5. **Disappear condition:** When does the feed disappear? (Combo drops below 10? Immediately? Fades over 3 seconds?)

6. **Integration with existing combo system:** EWR_STATE.combo.streak is already tracked. DRAW_HUD already exists. Where does the kill feed fit relative to existing HUD elements?

---

## TASK 4: MOBILE D-PAD POLISH — REFINED SPEC

**Context:** The game has a working virtual d-pad (VPAD) for mobile. Here's what currently exists:

**CURRENT VPAD — What's already built:**
```
Left stick area: center at (127, 432), radius 112
- Pressing in left quadrant: VPAD.left = true
- Pressing in right quadrant: VPAD.right = true
- Pressing in top quadrant: VPAD.up = true
- Pressing in bottom quadrant: VPAD.down = true (duck)

Action buttons:
- Punch: circle at (800, 479), radius 60
- Kick: circle at (912, 479), radius 42

Swipe support: directional swipes trigger movement
Mobile detection: MOBILE_MODE flag
Visual: Drawn as simple filled circles when MOBILE_MODE is true
```

**The problems (from player feedback):**
- Buttons are too small on smaller phones
- No visual feedback when buttons are pressed (no "pressed" state)
- d-pad center and action buttons feel like they're in slightly wrong positions
- Jump (up on d-pad) is hard to hit reliably
- Punch and kick are too close together on small screens

**Design the improved VPAD:**

1. **ASCII mockup of the new layout** — show exactly where each button sits on a 360×640 phone screen (portrait) and a 844×390 phone screen (landscape). Use ASCII art.

2. **Dedicated JUMP button:** Should jump have its own button instead of "up" on the d-pad? Where would it go?

3. **Visual states:**
   - Unpressed state: How does the button look normally?
   - Pressed state: How does it look when actively held? (Color change? Scale? Glow?)
   - Describe the exact visual delta between pressed and unpressed.

4. **Button sizing guidelines:**
   - Minimum tap target size (iOS recommends 44pt — translate to pixels at 2x and 3x density)
   - Recommended sizes for d-pad and action buttons

5. **Thumb zone analysis:** Where do thumbs naturally rest in landscape mode? Design around that.

6. **Priority ranking:** Of all the VPAD improvements, rank them 1-5 by impact on playability.

---

## OUTPUT FORMAT

Four clearly labeled design documents with headers. Be **specific** — give actual text examples, actual pixel values, actual ASCII mockups. Vague direction ("make it feel good") is not useful. Precise direction ("30px radius, #ffd700 when pressed, 200ms fade") is useful.

This is your canvas. Paint something weird and true.
