# Anima Character Generator

Browser-based character creator for **Anima: Beyond Fantasy**. It collates core and supplement character-creation rules into one calculator: no server, no account.

This is a full rewrite of the 2011–2020 jQuery/RequireJS app. The previous implementation is tagged [`v0-legacy`](https://github.com/BandanaT/anima-character-generator/releases/tag/v0-legacy).

## Status

Version **1.0** matches the working features of the old generator:

- Human / Nephilim and creature creation
- Characteristics, Creation Points, Development Points, Martial Knowledge
- Combat modules, martial arts, Ki / Nemesis / Dominion Techniques
- Derived stat block (LP, resistances, initiative, Zeon/MA totals, psychic totals, secondaries)
- Creature Essential Abilities
- Optional OllyT house rules
- Versioned JSON save (`schemaVersion: 1`), plus browser autosave

Not in v1 (catalogs may already exist for later work): Magic Level allocation, Psychic Point spend, creature Powers UI, Elan, Ars Magnus, weapons/armor selection.

The new save format is **not** compatible with JSON exported from the 2012/2020 app.

## Develop

```bash
npm install
npm run dev
```

```bash
npm test          # Vitest engine tests
npm run test:e2e  # Playwright against a local preview
npm run build
```

GitHub Actions runs tests and, on `master`/`main`, deploys `dist/` to GitHub Pages. The build bundles the frozen legacy app from the [`v0-legacy`](https://github.com/BandanaT/anima-character-generator/releases/tag/v0-legacy) tag at `/legacy/` so both versions stay online. The tag must exist on GitHub for CI to include it; deploy fails if the legacy bundle is missing.

## License

MIT. Original work by Jeremy Bowman (2011); continued by OllyT / BandanaT.
