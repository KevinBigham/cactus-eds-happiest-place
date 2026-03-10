# NEW_REPO_STRUCTURE_MAP

## Folder tree

```text
.
├── .github/
├── TRANSFER/
├── docs/
├── index.html
├── scripts/
├── src/
│   └── world1/
├── content/
├── ui/
├── audio/
├── art/
├── telemetry/
├── tools/
├── tests/
└── legacy/
    └── quarantine/
        ├── combat/
        ├── racing/
        ├── runtime-variants/
        ├── ai-artifacts/
        ├── scratch/
        └── docs-archive/
```

## Purpose of each active folder
- `index.html`: canonical executable runtime entry for World 1.
- `TRANSFER/`: immutable migration and architecture source-of-truth pack.
- `docs/`: live operational docs, migration logs, and implementation lane docs.
- `scripts/`: existing maintenance/validation scripts.
- `src/world1/`: reserved active code location for safe modular extraction.
- `content/`: reserved active gameplay/content data location.
- `ui/`, `audio/`, `art/`: reserved active asset/interface domains.
- `telemetry/`: reserved diagnostics and logging domain.
- `tools/`: reserved project tooling domain.
- `tests/`: reserved automated/manual test assets domain.

## Legacy or quarantine locations
- `legacy/quarantine/combat/`: physically quarantined combat system; still mounted by `index.html` as a legacy runtime dependency.
- `legacy/quarantine/racing/`: standalone racing prototypes (not first-class scope).
- `legacy/quarantine/runtime-variants/`: non-canonical runtime HTML variants (`index (2).html`, `developer version.html`).
- `legacy/quarantine/ai-artifacts/`: historical AI-output files.
- `legacy/quarantine/scratch/`: notebook/scratch diagnostics.
- `legacy/quarantine/docs-archive/`: superseded and ambiguous historical docs/files.
