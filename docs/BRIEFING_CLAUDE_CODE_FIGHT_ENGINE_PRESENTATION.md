# Claude Code Fighting Engine Presentation Briefing

This briefing is for the live `Cactus-Eds-Happy-Place` repo fighting-engine presentation work.

## Scope

- Repo root: `/Users/tkevinbigham/Downloads/Cactus-Eds-Happy-Place`
- Branch target: `main`
- Product slice: `Cactus Ed` vs `Daikon Lord`
- Main proof surface: `Combat Lab`
- Presentation work only

Do not treat the fight presentation as a separate product. It is the current embedded arcade-fighter slice inside the broader Cactus Ed universe.

## Reality Check

The live presentation path already exists and is already integrated.

Do not add a second renderer.

The live boot/integration files are:

- `index.html`
- `combat/index.js`
- `combat/data/fighters/ed.visual.js`
- `combat/data/fighters/daikon.visual.js`
- `combat/data/stages/tournamentFlat.visual.js`
- `combat/presentation/poseLibrary.js`
- `combat/presentation/animPlayer.js`
- `combat/presentation/fighterRig.js`
- `combat/presentation/fighterRenderer.js`
- `combat/presentation/stageRenderer.js`
- `combat/presentation/fxRenderer.js`

## What Exists Now

### Integration

- `index.html` loads the presentation/data modules via script tags.
- `index.html` routes the live Level15 fight path and Combat Lab through the presentation renderer and stage renderer.
- `combat/index.js` defines the `CEHP_COMBAT.data` and `CEHP_COMBAT.presentation` namespaces used by the new modules.

### Fighter Presentation Stack

- `poseLibrary.js`
  - base locomotion poses
  - authored move clips
  - authored reaction/contact/recovery clips
- `animPlayer.js`
  - resolves base pose
  - resolves move phase
  - applies move targeting from live combat boxes
  - layers close-contact bias and recent-exchange reaction clips
- `fighterRig.js`
  - solves the articulated body rig
  - applies presentation-only overlap staging and role-based breakup
- `fighterRenderer.js`
  - draws the actual bodies
  - adds low-noise state/read support from body geometry
- `fxRenderer.js`
  - adds restrained support cues for block/hit/tech/wakeup/knockdown

### Visual Data

- `ed.visual.js`
  - Ed palette, silhouette, stance, close-contact bias, move presentation metadata
- `daikon.visual.js`
  - Daikon palette, silhouette, stance, close-contact bias, move presentation metadata
- `tournamentFlat.visual.js`
  - flat tournament-stage presentation data

## Current Visual Truth

- Anti-air is one of the strongest-looking scenarios.
- Throw-tech improved materially.
- Defensive-timing improved materially.
- Combo-confirm improved and is no longer the obvious worst-looking scenario.
- Biggest remaining problem:
  - point-blank corner hit/block/contact exchanges still collapse too much into simple rig geometry
  - the weakest read is still the close pocket when the bodies are compressed and recovering out of contact

## What Pass 27 Added

- Stronger authored clips for:
  - guarded recoil
  - guard recovery
  - hit recovery
  - landed-strike settle
  - throw-tech breakaway recovery
  - throw aftermath
  - throw dump
- More overlap-aware torso/head/shoulder/hip staging in the rig
- Stronger fighter-specific close-contact identity:
  - Ed stays tighter, cleaner, sharper
  - Daikon stays heavier, broader, more committed
- Slightly stronger low-noise body-read support in renderer/FX

## Guardrails

Do not change:

- combat/core routing
- owner semantics or owner flags
- hitbox/hurtbox/pushbox truth
- parity tool names or behavior
- event schemas
- stage gameplay geometry
- the 2-fighter slice
- the 7-drill Combat Lab structure

Prefer touching only:

- `combat/data/fighters/*.visual.js`
- `combat/data/stages/*.visual.js`
- `combat/presentation/*.js`
- `index.html` only if a tiny presentation hook is truly required

## How To Boot And Inspect

From the repo root:

```sh
node --check combat/data/fighters/ed.visual.js
node --check combat/data/fighters/daikon.visual.js
node --check combat/data/stages/tournamentFlat.visual.js
node --check combat/presentation/poseLibrary.js
node --check combat/presentation/animPlayer.js
node --check combat/presentation/fighterRig.js
node --check combat/presentation/fighterRenderer.js
node --check combat/presentation/stageRenderer.js
node --check combat/presentation/fxRenderer.js
python3 -m http.server 8125
```

Open:

- `http://127.0.0.1:8125/index.html`

In the browser:

- `Y` = Combat Lab
- `1` = anti-air
- `3` = throw-tech
- `6` = combo-confirm
- `7` = defensive-timing
- `Q` = quick smoke
- `E` = combat audit
- `R` = balance snapshot
- `T` = replay review

## Baseline Audit Truth

These non-green results were already present and were not introduced by the presentation passes:

- quick smoke
  - `throw-probe-mismatch`
  - subsystem `throw-tech`
  - first divergent frame `204`
- combat audit
  - `fighter`
  - `move-bridge`
  - `strike-bridge`
  - `throw`
  - first divergent frames `204/215`
- balance snapshot
  - non-green because it bundles the same baseline audit failures

These should remain green:

- replay review
- determinism
- adapter parity

## What To Review First

- `index.html`
  - script-tag boot path
  - presentation namespace hooks
  - Level15 fight render path
  - Level15CombatLabScene readout and render path
- `combat/presentation/animPlayer.js`
  - recent exchange layering
  - contact role logic
- `combat/presentation/fighterRig.js`
  - overlap staging
  - attacker/defender breakup
- `combat/presentation/poseLibrary.js`
  - move clips
  - reaction/recovery clips

## Best Next Pass

If you continue presentation work, the highest-value next pass is:

- one more presentation-only `corner-pocket non-striking-side compression / post-contact recovery` pass

Keep it narrow:

- jab/block/throw aftermath
- defender recovery in the corner
- post-tech separation recovery
- short-range hit vs block body read

Do not spend that pass on:

- engine cleanup
- stage work
- anti-air polish unless a tiny free fix falls out
- new fighters or new systems
