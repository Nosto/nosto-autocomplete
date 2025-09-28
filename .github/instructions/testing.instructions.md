---
applyTo: "spec/**/*.ts,spec/**/*.tsx"
---

# Testing Instructions

## Testing Framework

- Uses Vitest with jsdom environment
- Test runner: `npm run test` -- takes ~16 seconds. NEVER CANCEL. Set timeout to 5+ minutes.
- Includes coverage reporting (requires 80%+ coverage)
- 136 tests across 18 test files
- Tests multiple framework integrations and autocomplete functionality

## Testing Standards

- Use vitest as the test framework
- Use 'describe' and 'it' for test structure
- Use 'beforeEach' for setup
- Use 'afterEach' for cleanup
- Use 'expect' for assertions
- Maintain 80%+ coverage on all metrics (statements, branches, functions, lines)