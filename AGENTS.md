# Agent notes

## Tests: assert full return values

When adding or changing tests around functions that return structured objects (e.g. routines, prompts, settings snapshots), **assert the entire return value** with `expect(result).to.deep.equal(…)` (or equivalent), not a derived projection such as `.map(...)`, picked fields only, or partial matchers—unless the test is explicitly about a single field and the name/description says so.

This keeps regressions in **`index`**, **`color`**, **`displays`**, and other properties from slipping through.
