# WORLD1_IMPLEMENTATION_LANE

## Exact first coding target
Create the first modular World 1 extraction surface by moving **pure data/constants/config blocks** from `index.html` into `src/world1/` modules while preserving identical runtime behavior.

## What is allowed to change first
- Add new files under `src/world1/` for data/constants/config only.
- Add script includes in `index.html` for those new modules.
- Replace inlined duplicated constants in `index.html` with references to extracted modules.
- Add low-risk parity checks in `scripts/` if needed.

## What must remain untouched
- Core gameplay flow and scene sequencing.
- Combat dependency mounting path (`legacy/quarantine/combat/**` script includes stay in place).
- Quarantine boundaries for racing/runtime variants/archives.
- World 2, combat expansion, and racing expansion scope.

## How to keep runtime behavior unchanged while extracting structure
1. Extract only immutable/static values first.
2. Keep original names and value shapes.
3. Load extracted scripts before dependent runtime code.
4. Do one extraction slice at a time.
5. Run parity checks after each slice.

## First safe extraction targets
- UI text/config constants.
- Color palette/config objects.
- Non-branching level metadata tables.
- Static tuning constants that do not mutate at runtime.
- Documentation-aligned schema constants for save guards.

## Parity checks before deeper extraction
- `index.html` loads with zero missing script references.
- Title → WorldMap → 1-1 entry remains functional.
- 1-1 movement/jump/attack loop remains unchanged.
- One mochi defeat still increases aloe as expected.
- Level completion still returns to map and preserves beaten-node behavior.

## Exit criteria for lane 1
- At least one constant/data segment extracted to `src/world1/`.
- No gameplay diffs observed in manual smoke path.
- No quarantine boundary violations.
- Runtime still browser-runnable with no build step.
