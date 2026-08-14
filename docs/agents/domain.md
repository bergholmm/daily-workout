# Domain docs

This repository uses a single domain context.

## Before exploring

Read these resources when they exist and are relevant:

- `CONTEXT.md` at the repository root for the domain glossary.
- `docs/adr/` for architectural decisions affecting the area being changed.

If these resources do not yet exist, proceed silently. The domain-modeling
flow creates them lazily when terminology or a durable decision is resolved.

## File structure

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

## Use the glossary vocabulary

Use terms exactly as defined in `CONTEXT.md` in issue titles, specifications,
tests, and implementation. When a needed concept is missing, determine whether
the term is unnecessary or whether the glossary has a real gap.

## Flag ADR conflicts

Surface contradictions with an existing ADR explicitly instead of silently
overriding the recorded decision.
