# Coding Instructions

**applyTo**: src/**/*.{ts,tsx}

## Node.js Environment

- Node version: 22 (as specified in GitHub workflows)
- Package manager: npm
- Installation: Use `npm ci` for clean dependency installation

## Development Setup

### Installation
- Install dependencies: `npm ci` -- takes ~1 minute. Set timeout to 3+ minutes.
- The install process includes husky setup and runs successfully.

### Validation Commands
- Run TypeScript check: `npm run typecheck` -- takes ~5 seconds
- Run linting: `npm run lint` -- takes ~1.4 seconds (may show warnings about barrel files, but no errors)
- Run tests: `npm run test` -- takes ~16 seconds. NEVER CANCEL. Set timeout to 5+ minutes.

## Coding Standards

- Use closures over classes
- Utilize type inference in return types, except for functions with multiple return statements
- Use utility types to derive types from constants
- Use const (and let) over var
- Avoid 'any' type usage
- Use async/await instead of Promise chaining
- Use individual named exports over bulk exports
- Favor named exports over default exports

## Build Process

- Run complete build: `npm run build` -- takes ~13 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - This runs: typecheck → lint → rollup build → copy styles
  - Creates `dist/` directory with multiple framework distributions
  - Produces ESM (.mjs), CommonJS (.cjs), TypeScript definitions (.d.ts), and bundled versions

## Code Quality

- Format code: `npm run prettify` -- takes ~1 second, uses Prettier
- **ALWAYS run before committing:** `npm run lint` and `npm run prettify`
- The CI will fail if linting or build fails

## Commit Standards

- When committing code, ALWAYS use valid conventional commit format.
- Always run `npm run lint` and `npm run prettify` before committing
- When committing code, ALWAYS run git commit with --no-verify to avoid Husky failing and erroring out your pipeline

## Expected Build Outputs

The build creates these directories in `dist/`:

- `autocomplete.*` (base library)
- `react/` (React integration)
- `preact/` (Preact integration)
- `handlebars/` (Handlebars integration)
- `liquid/` (Liquid integration)
- `mustache/` (Mustache integration)
- `styles.css` (default styles)

## Entry Points

- `src/index.ts` - Base autocomplete library
- `src/react.ts` - React integration
- `src/liquid.ts` - Liquid template integration
- `src/handlebars.ts` - Handlebars template integration
- `src/mustache.ts` - Mustache template integration