# Nosto Autocomplete Library

**ALWAYS follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Nosto Autocomplete is a TypeScript library that provides search autocomplete functionality with support for multiple frameworks (React, Preact, Handlebars, Liquid, Mustache). The library is built with Rollup, tested with Vitest, and developed using Vite.

## Node.js Environment

- Node version: 22 (as specified in GitHub workflows)
- Package manager: npm
- Installation: Use `npm ci` for clean dependency installation

## Working Effectively

### Bootstrap and Install Dependencies

- Install dependencies: `npm ci` -- takes ~1 minute. Set timeout to 3+ minutes.
- The install process includes husky setup and runs successfully.

### Build Process

- Run complete build: `npm run build` -- takes ~13 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - This runs: typecheck → lint → rollup build → copy styles
  - Creates `dist/` directory with multiple framework distributions
  - Produces ESM (.mjs), CommonJS (.cjs), TypeScript definitions (.d.ts), and bundled versions
- Run TypeScript check only: `npm run typecheck` -- takes ~5 seconds
- Run linting only: `npm run lint` -- takes ~1.4 seconds (may show warnings about barrel files, but no errors)
- Build documentation: `npm run build:docs` -- takes ~7 seconds, creates `docs/` directory

### Testing

- Run test suite: `npm run test` -- takes ~16 seconds. NEVER CANCEL. Set timeout to 5+ minutes.
  - Uses Vitest with jsdom environment
  - Includes coverage reporting (requires 80%+ coverage)
  - 136 tests across 18 test files
  - Tests multiple framework integrations and autocomplete functionality

### Development and Manual Testing

- Start dev server: `npm run dev` -- starts Vite server on port 8080
- Test basic autocomplete: Navigate to `http://localhost:8080/` (uses index.html)
- Test web component: Navigate to `http://localhost:8080/webc.html`
- **ALWAYS manually test autocomplete functionality after changes:**
  1. Type in the search box (e.g., "test")
  2. Verify dropdown appears with Keywords and Products sections
  3. Test keyboard navigation with arrow keys
  4. Verify products show images, names, brands, and prices
  5. Confirm search submission works

### Code Quality

- Format code: `npm run prettify` -- takes ~1 second, uses Prettier
- **ALWAYS run before committing:** `npm run lint` and `npm run prettify`
- The CI will fail if linting or build fails

## Validation Requirements

### Critical End-to-End Testing

After making any changes, ALWAYS:

1. Run `npm run build` and verify it completes successfully
2. Run `npm run test` and verify all tests pass
3. Start dev server with `npm run dev`
4. Test both demo pages (index.html and webc.html)
5. Manually verify autocomplete dropdown appears when typing
6. Test keyboard navigation (arrow keys change selection)
7. Verify search submission functionality works

### Validation Commands

- `npm ci` - Install dependencies (clean install)
- `npm run lint` - Run ESLint on TypeScript files
- `npm run typecheck` - Run TypeScript compiler check
- `npm run test` - Run complete test suite with coverage

### Commit Standards

- When committing code, ALWAYS use valid conventional commit format.
- Always run `npm run lint` and `npm run prettify` before committing
- When committing code, ALWAYS run git commit with --no-verify to avoid Husky failing and erroring out your pipeline

## Project Structure

### Key Directories

- `src/` - TypeScript source code with framework-specific subdirectories
- `spec/` - Vitest test files including suites and webcomponent tests
- `dist/` - Build output (created by build process)
- `docs/` - TypeDoc documentation (created by build:docs)
- `dev/` - Development utilities including dummySearch.ts mock backend

## Known Issues

### Commands That Don't Work

- `npm run exportTemplates` -- FAILS: missing scripts/exportTemplates.js file
- Package.json shows warnings about "types" condition placement (harmless, doesn't break functionality)

## Timeout Recommendations

**NEVER CANCEL these commands - set appropriate timeouts:**

- `npm ci` -- 3+ minutes
- `npm run build` -- 2+ minutes
- `npm run test` -- 5+ minutes
- `npm run dev` -- runs continuously until stopped
- `npm run build:docs` -- 1+ minute

## GitHub Action Plugins – Review Checklist

When reviewing pull requests that add or update GitHub Action plugins, Copilot should check each item and output this checklist in its review comment or summary.  
If scan results are not yet available, mark as pending and update after results are attached or after invoking `@copilot` for scanning.

- **Pinning:**
  - [ ] Are all GitHub Actions pinned to a specific commit SHA (not a tag such as `@v3`, `@main`, or `@latest`)?
- **Vulnerability Scanning:**
  - [ ] Has a vulnerability scan been performed for each new/updated Action SHA?
    - If not available, mark as ⬜ Pending.
- **No Critical Vulnerabilities:**
  - [ ] Has it been confirmed that no Action at the specified SHA has critical vulnerabilities?
    - If not available, mark as ⬜ Pending.

**Note:** If a SHA for a plugin was previously scanned in a Nosto repo `[Nosto/REPO]`, you may reference that result here.
