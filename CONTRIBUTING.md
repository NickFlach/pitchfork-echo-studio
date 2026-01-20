# Contributing to Pitchfork Protocol

Thank you for your interest in contributing to the Pitchfork Protocol! This document outlines our contribution guidelines, PR policy, and development workflow.

## Table of Contents
- [Branch Strategy](#branch-strategy)
- [Pull Request Policy](#pull-request-policy)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)

---

## Branch Strategy

We use a simplified Git Flow model:

```
main (production)
  └── develop (integration)
       ├── feature/xxx
       ├── fix/xxx
       └── chore/xxx
```

### Branch Types

| Branch | Purpose | Merges To |
|--------|---------|-----------|
| `main` | Production-ready code | - |
| `develop` | Integration branch for features | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` or `main` (hotfix) |
| `chore/*` | Maintenance, docs, refactoring | `develop` |

### Branch Naming

```
feature/add-governance-voting
fix/token-transfer-bug
chore/update-dependencies
docs/api-documentation
```

---

## Pull Request Policy

### Required for All PRs

1. **Descriptive Title**: Clear, concise summary of changes
2. **Description**: Explain what, why, and how
3. **Linked Issues**: Reference related issues (if any)
4. **Passing CI**: All required checks must pass
5. **No Merge Conflicts**: Rebase or merge from target branch

### PR Template

```markdown
## Summary
[Brief description of changes]

## Type of Change
- [ ] Feature (new functionality)
- [ ] Bug fix (non-breaking fix)
- [ ] Breaking change (fix or feature that breaks existing functionality)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Chore (dependencies, CI, etc.)

## Changes Made
- [List specific changes]

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All existing tests pass

## Smart Contracts (if applicable)
- [ ] Contract compiles without errors
- [ ] Contract tests pass
- [ ] No security vulnerabilities introduced
- [ ] Gas optimization considered

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented hard-to-understand areas
- [ ] Updated documentation (if needed)
- [ ] No console.log or debug code left
```

### Review Requirements

| Target Branch | Required Reviews | Required Checks |
|---------------|------------------|-----------------|
| `main` | 1 approval | All CI must pass |
| `develop` | 1 approval | Lint + Tests must pass |

### Merge Strategy

- **Squash and Merge**: For feature branches (keeps history clean)
- **Merge Commit**: For release branches to main
- **Rebase**: Encouraged before opening PR

---

## Development Workflow

### 1. Starting New Work

```bash
# Ensure you're on develop and up-to-date
git checkout develop
git pull origin develop

# Create a new branch
git checkout -b feature/your-feature-name
```

### 2. Making Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add governance voting mechanism

- Implement vote casting function
- Add vote delegation support
- Update UI for voting interface"
```

### 3. Before Opening PR

```bash
# Run linter
npm run lint

# Run tests
npm test
npx hardhat test

# Build to check for errors
npm run build

# Rebase on develop if needed
git fetch origin
git rebase origin/develop
```

### 4. Opening PR

```bash
# Push your branch
git push origin feature/your-feature-name

# Open PR via GitHub CLI
gh pr create --base develop --title "feat: Add governance voting" --body "..."
```

### 5. After PR Review

- Address review comments
- Push additional commits or amend
- Request re-review when ready

### 6. After PR Merge

```bash
# Switch back to develop
git checkout develop
git pull origin develop

# Delete local feature branch
git branch -d feature/your-feature-name
```

---

## Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable/function names
- Add JSDoc comments for public APIs

### Smart Contracts (Solidity)

- Solidity version: `^0.8.24`
- Use OpenZeppelin contracts where applicable
- Follow Solidity style guide
- Include NatSpec documentation
- Consider gas optimization

### React Components

- Functional components with hooks
- Use TypeScript interfaces for props
- Keep components focused and small
- Extract reusable logic to hooks

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Examples

```bash
# Feature
git commit -m "feat(contracts): add PFORK token staking mechanism"

# Bug fix
git commit -m "fix(ui): resolve wallet connection timeout issue"

# Documentation
git commit -m "docs: update API documentation for governance"

# Chore
git commit -m "chore(deps): update OpenZeppelin contracts to v5.4.0"
```

---

## Quick Reference

### Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run frontend tests

# Smart Contracts
npx hardhat compile  # Compile contracts
npx hardhat test     # Run contract tests
npx hardhat coverage # Generate coverage report

# Git
gh pr create         # Create pull request
gh pr list           # List open PRs
gh pr checkout <n>   # Checkout PR locally
```

### Labels

Use these labels on PRs and issues:

- `feature` - New functionality
- `bug` - Something isn't working
- `documentation` - Documentation improvements
- `contracts` - Smart contract changes
- `frontend` - UI/UX changes
- `backend` - Server-side changes
- `breaking` - Breaking changes
- `needs-review` - Ready for review
- `wip` - Work in progress

---

## Questions?

If you have questions about contributing, please:
1. Check existing documentation
2. Search closed issues/PRs
3. Open a discussion or issue

Thank you for contributing to Pitchfork Protocol!
