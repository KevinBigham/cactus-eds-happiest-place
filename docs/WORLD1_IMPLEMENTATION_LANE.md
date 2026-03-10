# WORLD1_IMPLEMENTATION_LANE

## Exact first coding target
Create the first modular World 1 extraction surface by moving pure data/constants/config blocks from `index.html` into `src/world1/` files while preserving identical runtime behavior.

## What is allowed to change first
- Add files under `src/world1/` for data/constants/config only.
- Add script includes in `index.html` for those new files.
- Replace duplicated constants in `index.html` with references to extracted module values.
- Add small parity checks in `scripts/`.

## What must remain untouched
- Core movement logic and gameplay flow.
- Combat runtime dependency wiring currently mounted in the runtime.
- Racing prototypes and World 2+ feature scope.

## How to keep runtime behavior unchanged while extracting structure
1. Extract immutable values first.
2. Keep names/value shapes identical.
3. Load extracted scripts before dependent code.
4. Use safe inline fallbacks during early slices.
5. Validate parity after each slice.

## First safe extraction targets
- Scene key maps and beat key IDs.
- UI/alert text constants.
- Save-key constants.
- Static baseline capture label arrays.

## Parity checks before deeper extraction
- `index.html` local scripts resolve.
- Title → WorldMap → Level 1-1 boot path still works.
- Level 1-1 movement/jump/attack loop unchanged.
- Aloe increase on one mochi defeat unchanged.

## Guardrails
- No intentional gameplay behavior changes.
- Prefer lower-risk over elegance.
- Stop extraction if risk/uncertainty increases.
