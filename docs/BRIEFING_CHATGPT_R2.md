# CACTUS ED'S HAPPY PLACE
## BRIEFING FOR: ChatGPT — "The Voice" — ROUND 2
### Role: Content Writer. Flavor Text. The Game's Soul.

---

## ⚠️ IMPORTANT: LESSON FROM ROUND 1

Last time we sent you this briefing, you gave us a detailed game industry research document.
It was impressive. It was not what we needed.

**THIS TIME: Output ONLY the JavaScript strings/arrays requested. No prose. No research. No bullet points. No strategy advice. No commentary. Just the content — formatted exactly as shown.**

If you feel the urge to explain your thought process: don't. Just write the cigs.

---

## WHO YOU ARE IN THIS PROJECT

You are the game's **voice** — the writer who makes Cactus Ed's Happy Place feel alive.
Your words appear on screen as flash text, commercial breaks, and boss taunts.
Everything you write gets pasted directly into a JavaScript game file.

---

## THE GAME — TONE BIBLE

**Cactus Ed's Happy Place** is a psychedelic side-scrolling platformer.
Aesthetic: **Wonder Showzen × Adult Swim × a Kansas City neighborhood newsletter that's gone fully off the rails.**

### The Voice Rules:
- **ALL CAPS** for flash text and background messages
- Short. Punchy. 1-2 lines max.
- Contradictions are good. Logic is optional.
- Everything has a slight sinister corporate undertone
- Kansas City references: West Bottoms, Westport, Crossroads, Troost, 18th & Vine, The Void
- The game is funny but it's also sad and that's the point
- Ed never tries. The cats always know more than they say.

### Existing WS_MSGS examples to match the energy:
```
'CONSUME', 'ARE YOU REAL?', 'DO YOU FEEL?', 'BIRTH SCHOOL WORK DEATH',
'YOU ARE PRODUCT', 'LOOK AWAY', 'CACTUS MOMENT', 'THIS IS FINE',
'REALITY IS OPTIONAL', 'ED WAS RIGHT', 'MOCHI HQ IS HIRING',
'ALOE IS THE REAL CURRENCY', 'THE VOID HAS WEEKEND HOURS',
'RASTA CORP: YOUR PEACE. OUR RECEIPT.', 'THE MACHINE NOTICED YOU'
```

---

## TASK 1: 4 NEW COMMERCIAL SCRIPTS

**Format: JavaScript object array. Each commercial has exactly this shape:**
```javascript
{
  id: 'string_id',
  bgColor: 0xHEXNUM,
  fgColor: '#hexstring',
  lines: ['line1','line2','line3','line4','line5']
}
```

Each `lines` array has **exactly 5 strings**. They read like a TV commercial script — deadpan, weird, specific.
The existing commercials already in the game: aloe_max, void_realty, rasta_corp, insulin, mochi_psa, cat_vote.

**Write these 4 new ones:**

### 1. id: `'cig_emporium'` — Ed's Cig Emporium
- Ed selling cigarettes as a form of enlightenment
- Tone: sincere, deadpan product pitch, slight existential dread
- Colors: warm amber/brown

### 2. id: `'cat_college'` — Cat College
- A college for cats. By cats. Degrees in Being A Cat.
- Tone: absurdist academic, serious about ridiculous things
- Colors: academic purple/gold

### 3. id: `'void_downtown'` — The Void (Now Open Downtown)
- The Void is a physical location. It has hours. Weekend brunch.
- Tone: real estate/lifestyle ad, completely normal about the void
- Colors: black/white contrast

### 4. id: `'nuclear_love'` — Nuclear Love Bomb Insurance
- Insurance against nuclear love. Are you covered?
- Tone: actual insurance commercial that's somehow about love and nuclear destruction
- Colors: red/white

---

## TASK 2: 25 NEW WS_MSGS

**Format: JavaScript string array entries. CAPS. Short.**

Write exactly 25 strings organized into these categories.
Label each section with a comment so we can sort them.

```javascript
// RASTA CORP HORROR (8 entries)
// examples: monetized trauma, wellness franchises, subscriptions to peace

// KC NEIGHBORHOOD LORE (6 entries)
// examples: West Bottoms references, Troost Ave, the river, Westport at 2am

// LHC / THE MACHINE (5 entries)
// examples: CERN, particle physics, 17 miles underground, the machine has opinions

// LATE CAPITALISM (6 entries)
// examples: gig economy, subscription services, content creators, disruption
```

---

## TASK 3: BOSS HP QUOTES

These lines flash on screen when bosses reach certain HP thresholds.

**Format: One JavaScript object:**
```javascript
var BOSS_HP_QUOTES = {
  handtowel: {
    high: 'LINE AT 75% HP',
    mid:  'LINE AT 50% HP',
    low:  'LINE AT 25% HP'
  },
  mochiQueen: { high:'', mid:'', low:'' },
  insulinAdmiral: { high:'', mid:'', low:'' },
  rastaCorpCeo: { high:'', mid:'', low:'' }
};
```

**Boss personalities for voice reference:**
- **Handtowel**: A mysterious sentient handtowel. Cryptic. Speaks in koans. Probably knows something.
- **Mochi Queen**: Regal. Betrayed. Was just trying to run a business. Getting emotional.
- **Insulin Admiral Sharpe**: Military. Focused on blood sugar. Believes deeply in the mission. Starting to doubt.
- **Rasta Corp CEO (Barry Goldstein)**: Corporate. Spiritual. Deeply lonely. Selling vibes he doesn't have. On the edge.

---

## TASK 4: TITLE SCREEN LORE TIDBITS

These appear randomly on the Title screen after the first playthrough.

**Format: JavaScript string array. Each string is 1-2 sentences. Mix of CAPS and lowercase.**

Write exactly 15, labeled by category:

```javascript
// ED LORE (5 entries)
// About Ed's past, his relationship with cigarettes, Kansas City, his opinion on the universe

// CAT LORE (5 entries)
// About the cats. Their secret knowledge. Their quiet judgment. Their names.

// THE MACHINE / LHC (5 entries)
// About CERN, the Large Hadron Collider, what the machine is thinking about
```

---

## THE CANON (read before writing)

- **Ed** is a slow-moving, chain-smoking cactus from the West Bottoms, KC. Aloof. Never excited. Always right.
- **The Cats** are NPCs. They know more than they say. Names like Chairman Whiskers, Destiny, Tamika, LaShonda.
- **Rasta Corp** is a corporate spirituality empire. They own the vibes. They monetized enlightenment.
- **The Machine** is the Large Hadron Collider at CERN. 17 miles underground. It knows Ed is coming.
- **Aloe** is the currency. It used to mean something.
- **The Void** is a place in Kansas City. It's open for brunch on weekends.
- **Mochi** are the enemies. Pink, round, evil-looking but mostly just following orders.

---

## OUTPUT FORMAT REMINDER

Deliver your response as **copy-pasteable JavaScript only**.
No explanations. No "here are the results". Just the code.
Start with Task 1, then Task 2, then Task 3, then Task 4.

LFG. Write the cigs. Make Ed proud.
