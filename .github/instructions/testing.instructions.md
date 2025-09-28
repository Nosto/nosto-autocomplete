# Testing Instructions

**applyTo**: spec/**/*.{spec,test}.{ts,tsx}

## Node.js Environment

- Node version: 22 (as specified in GitHub workflows)
- Package manager: npm
- Installation: Use `npm ci` for clean dependency installation

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

## Coverage Requirements

- Statements: 80%+
- Branches: 78%+ (TODO: raise to 80%)
- Lines: 80%
- Functions: 80%

## Test Environment

- Environment: jsdom
- Global test utilities available
- Resources: usable
- Run scripts: dangerously (for DOM manipulation)
- Silent mode: enabled

## Test Structure

Tests are organized by functionality:
- Framework integration tests (React, Preact, Handlebars, Liquid, Mustache)
- Web component tests
- Core autocomplete functionality tests
- Build validation tests

## Validation Commands

- Run all tests: `npm run test`
- Tests include coverage reporting and must pass all thresholds
- Test files are located in `spec/` directory with `.spec.{js,ts,tsx}` extension

## Development Testing

- Start dev server: `npm run dev` -- starts Vite server on port 8080
- Test basic autocomplete: Navigate to `http://localhost:8080/` (uses index.html)
- Test web component: Navigate to `http://localhost:8080/webc.html`

### Manual Testing Checklist

After making any changes, ALWAYS:

1. Type in the search box (e.g., "test")
2. Verify dropdown appears with Keywords and Products sections
3. Test keyboard navigation with arrow keys
4. Verify products show images, names, brands, and prices
5. Confirm search submission works

## Commit Standards

- When committing test code, ALWAYS use valid conventional commit format.
- Always run `npm run lint` and `npm run prettify` before committing
- When committing code, ALWAYS run git commit with --no-verify to avoid Husky failing and erroring out your pipeline