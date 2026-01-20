# Testing & Code Quality Guide

This document outlines the testing strategy, linting policies, and code quality standards for the Pitchfork Protocol.

## Table of Contents
- [Smart Contract Testing](#smart-contract-testing)
- [Linting Policy](#linting-policy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Future Improvements](#future-improvements)

---

## Smart Contract Testing

### Running Tests

```bash
# Run all smart contract tests
npx hardhat test

# Run with coverage report
npx hardhat coverage

# Run specific test file
npx hardhat test test/PFORK.test.cjs
```

### Test Coverage

Current test coverage includes:

| Contract | Tests | Status |
|----------|-------|--------|
| PFORK.sol | 12 tests | ✅ Passing |
| gPFORK.sol | 12 tests | ✅ Passing |
| PitchforkGovernor.sol | Pending | 🔄 |
| AIServicePayment.sol | Pending | 🔄 |
| Other contracts | Pending | 🔄 |

### Test Structure

Tests are located in the `test/` directory and use:
- **Framework**: Hardhat + Chai
- **Format**: CommonJS (`.cjs` files for Hardhat compatibility)

```
test/
├── PFORK.test.cjs          # Base token tests
├── gPFORK.test.cjs         # Staking token tests
└── [future test files]
```

---

## Linting Policy

### Configuration

ESLint is configured in `eslint.config.js` with different rules for different parts of the codebase:

#### Frontend (`src/**/*.{ts,tsx}`)
- TypeScript strict mode with relaxed rules for existing patterns
- React Hooks rules (warnings for conditional hooks)
- `@typescript-eslint/no-explicit-any`: OFF (existing codebase uses dynamic typing)

#### Server (`server/**/*.ts`)
- Relaxed typing for AI/ML engine code
- `@typescript-eslint/no-explicit-any`: OFF (AI engines use dynamic data structures)
- `@typescript-eslint/no-require-imports`: OFF (some modules require CommonJS)

#### Ignored Paths
- `dist/` - Build output
- `artifacts/` - Compiled contracts
- `cache/` - Build cache
- `scripts/*.ts` - Hardhat deployment scripts

### Running Linter

```bash
# Run linter
npm run lint

# Run linter with auto-fix
npm run lint -- --fix
```

### Current Status

- **Errors**: 0 ✅
- **Warnings**: ~54 (intentionally set to warn for gradual improvement)

### Warnings Breakdown

Most warnings are in these categories:
1. **react-hooks/exhaustive-deps**: Missing dependencies in hooks
2. **react-hooks/rules-of-hooks**: Conditional hook calls in complex components
3. **react-refresh/only-export-components**: Export patterns for fast refresh

These are tracked as warnings rather than errors to allow the codebase to function while improvements are made gradually.

---

## CI/CD Pipeline

### Workflow: `.github/workflows/ci.yml`

The CI/CD pipeline runs on every push to `main` and `develop` branches:

| Job | Description | Required |
|-----|-------------|----------|
| **Test & Lint** | Runs ESLint and builds frontend | ✅ Must pass |
| **Smart Contracts** | Compiles and tests contracts | ✅ Must pass |
| **Build** | Builds production application | ✅ Must pass |
| **Docker** | Builds Docker images (main only) | Optional |
| **Security** | Trivy scanning and npm audit | Continue on error |

### Pass Criteria

For a PR to merge:
1. ESLint must pass with 0 errors (warnings allowed)
2. Smart contract tests must pass
3. Frontend must build successfully
4. Contract compilation must succeed

---

## Future Improvements

### Short-term
- [ ] Add tests for governance contracts (PitchforkGovernor, PitchforkTimelock)
- [ ] Add tests for application contracts (AIServicePayment, LeadershipSubscription)
- [ ] Gradually fix React hooks warnings in complex components

### Medium-term
- [ ] Add integration tests for contract interactions
- [ ] Add frontend component tests with Jest/Vitest
- [ ] Implement proper TypeScript types to replace `any` usage

### Long-term
- [ ] Achieve 80%+ test coverage on smart contracts
- [ ] Implement E2E testing with Playwright
- [ ] Strict TypeScript mode for new code

---

## Contributing

When adding new code:

1. **Smart Contracts**: Always add corresponding tests in `test/`
2. **Frontend Components**: Follow existing patterns; new code should avoid `any` types where practical
3. **Server Code**: Dynamic typing is acceptable for AI/ML engines; use proper types for utility functions

### Test File Naming

- Smart contracts: `[ContractName].test.cjs`
- Frontend: `[ComponentName].test.tsx`
- Server: `[ModuleName].test.ts`
