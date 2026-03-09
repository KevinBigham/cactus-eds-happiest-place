# COMBAT / RACING STATUS DECISION
## Cactus Ed's Happy Place — Scope Priority and Experimental System Status
### Authority: Claude Sonnet 4.6, Normalization Pass
### Last updated: 2026-03-09
### Status: AUTHORITATIVE — defines World 1 as primary scope; combat/ and racing as experimental/secondary

---

> This document prevents scope drift by clearly stating what is primary, what is secondary, and what is still experimental. Read this before starting any work outside World 1.

---

## THE DECISION

**World 1 (five levels, Big Mochi boss, Super Mario World map) is the primary scope. It must ship clean and complete before any other system is promoted.**

**`combat/` is experimental and secondary. It must not be treated as a production system or migrated as a first-class citizen.**

---

## WORLD 1 SCOPE: PRIMARY — ALWAYS FIRST

### What "primary" means:
- World 1 must be playable, stable, and emotionally complete before any other world or system gets resources.
- If World 1 has any open bugs, unfinished levels, or broken transitions — fix those before touching anything else.
- The migration to a new repo should validate World 1 before validating anything else.
- In any reading order or feature priority list, World 1 comes first. Not as a polite convention — as a hard rule.

### World 1 checklist (required to be intact before any scope expansion):
- [ ] Level 1-1 ("Ed Wakes Up") — daytime, green, West Bottoms KC, 8 mochis, 5 cats, controls HUD 30s
- [ ] Level 1-2 ("The Cat Rave") — black room, neon lasers, all cats dancing, mochis with sunglasses
- [ ] Level 1-3 ("After Dark") — WS_TEXTS every ~8s, night-KC vibe, smoker cats
- [ ] Level 1-4 ("Hippie Bus Highway") — bus parallax intact, bus is lore
- [ ] Level 1-5 ("Mochi HQ") — Big Mochi 3-phase boss fight, 300 aloe reward
- [ ] World 1 map — Super Mario World style, tile grid, sequential unlock

If any item above is broken, it outranks all other work.

---

## COMBAT SYSTEM: EXPERIMENTAL — SECONDARY SCOPE

### What `combat/` is:
The `combat/` directory (if present) contains work toward a deeper fight system — likely the `RastaCorpBossScene` or extended enemy AI patterns that go beyond World 1's existing mochi/boss loop.

### What "experimental" means in practice:
- Do not migrate `combat/` to the new repo as a first-class system without Kevin's explicit sign-off.
- Do not reference `combat/` as production-ready in any briefing, spec, or status doc.
- Do not build new World 1 content that depends on `combat/` systems being complete.
- Treat any `combat/` code as a draft that may be rewritten or discarded.
- If `combat/` and World 1 ever conflict for resources or attention, World 1 wins.

### What experimental does NOT mean:
- `combat/` is not forbidden or deleted — it is valuable exploratory work.
- It can be read for design context.
- It can be promoted to primary scope when Kevin decides World 1 is complete and it's time.
- The `RastaCorpBossScene` spec in `docs/BRIEFING_DEEPSEEK.md` is a real, good spec. It just isn't the priority yet.

---

## RACING SYSTEM: SAME STATUS AS COMBAT

If a racing system exists or has been proposed:
- Same rules apply. World 1 first.
- Racing is secondary scope until Kevin explicitly promotes it.
- Do not migrate, spec, or build racing infrastructure ahead of World 1 stability.

---

## THE PROMOTION PATH

A system graduates from experimental/secondary to primary when:
1. Kevin explicitly says so.
2. World 1 is stable and complete (see checklist above).
3. The system has been playtested in a working branch and doesn't break World 1.

Until all three are true, the system stays secondary.

---

## MIGRATION IMPLICATIONS

When setting up the new repo:
- Copy World 1 first. Validate it. Play through it.
- Copy `combat/` only after World 1 is validated.
- In new-repo docs and READMEs, label `combat/` as experimental unless Kevin has changed its status.
- Do not list `combat/` in the same priority tier as World 1 in any spec, roadmap, or decision doc.

---

## WHY THIS DOCUMENT EXISTS

Previous guardrail docs (particularly `10_ARCHITECT_GUARDRAILS.md` and AI briefing docs) occasionally referenced `combat/` and the fight engine in ways that could imply parity with World 1. This creates scope drift risk: a future agent reads the docs, treats `combat/` as equal priority, and spends a migration pass polishing fight systems while World 1 levels are broken.

This document closes that ambiguity. **World 1 is the game. Everything else is future game.**

---

*If World 1 doesn't run, nothing else matters.*
