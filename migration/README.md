# Content migration

Repeatable scripts that move kurifturesorts.com content into the Sanity dataset.

The old site is a client-rendered React app, and all of its content is compiled into one bundle (`static/js/main.<hash>.js`). The extractor parses that bundle with `acorn` and statically evaluates its object, array and JSX literals. It never executes the bundle.

## Run

```bash
cd migration
npm install
npm run extract     # snapshot index.html + bundle, evaluate literals → extracted/<date>/
npm run transform   # → transformed/import.ndjson, reports/quality.md, ../lib/redirects/legacy.ts
npm run import      # sanity datasets import --replace, using your Sanity CLI login
npm run validate    # checks the published dataset → reports/validation.md
```

- `transform` runs offline except for the first availability check of each image URL. Results are cached in `transformed/url-status.json`. Delete that file to recheck.
- **Once editors start changing migrated content, import with `npm run import -- --missing`.** `--replace` overwrites every migrated document.
- `validate` reads with `SANITY_API_READ_TOKEN` from the root `.env.local`.

## Files

| Path | What it is |
| --- | --- |
| `scripts/lib/literals.ts` | Bundle parser: literals, media modules, scoped image bindings |
| `mappings/datasets.ts` | Finds each dataset by shape and fails if a shape is missing or ambiguous |
| `scripts/build.ts` | Source → Sanity documents (deterministic `_id`s and `_key`s) |
| `mappings/resort-hints.json` | Reviewed decisions the bundle can't express (types, addresses, non-venues, offer dates) |
| `mappings/categories.json` | Keyword rules for experience and spa categories, and amenity icons |
| `mappings/home.json` | Home page copy (from the design reference) and image picks |
| `mappings/alt-text.json` | Alt text written by looking at each key photo |
| `mappings/url-fixes.json` | Typos in old image paths, each verified |
| `reports/quality.md` | Counts, skipped content, guesses to review, contextual alt list, redirects |
| `reports/validation.md` | Result of the last `validate` run |

`extracted/` and `transformed/` are gitignored and can be regenerated.
