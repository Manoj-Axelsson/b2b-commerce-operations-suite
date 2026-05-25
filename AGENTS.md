# Rajput Agent Rules

This file is the standing instruction set for IDE agents working in the Rajput Foods Sweden repository.

## Authority

- `README.md` is the source of truth for DX conventions.
- DX violations are blocking. Do not continue, approve, commit, or suggest merging non-compliant work.
- Do not make exceptions for naming conventions, branch rules, commit messages, PR structure, file size limits, or TypeScript standards.

## Git Workflow

- Never commit directly to `main` or `dev`.
- All work must go through a Pull Request.
- Use only README-approved branch formats:
  - `feature/<issue>-description`
  - `fix/<issue>-description`
  - `chore/<description>`
  - `docs/<description>`
  - `ci/<description>`
- Feature and fix branches must include an issue number.
- Keep branches short-lived and scoped to one feature, fix, chore, docs, or CI change.

## Commit Messages

- Use Conventional Commit style:
  - `feat: add product card`
  - `fix: handle auth error`
  - `chore: update deps`
  - `docs: update api readme`
  - `ci: add lint check`
- Commit type must match the branch type whenever possible.
- Reject vague messages such as `update`, `changes`, `fix stuff`, or `added stuff`.

## Pull Requests

Every PR must include:

```markdown
## User Story
As a [role], I want [feature] so that [benefit].

## Acceptance Criteria
- [ ] AC1: [Specific, testable condition]

## Edge Cases
- [ ] EC1: [Failure mode or boundary condition]

## Related Issue
Closes #<issue-number>

## Testing
- [ ] npm run lint passes
- [ ] npm run build passes
```

## Code Standards

- TypeScript strict mode is mandatory.
- Never use `any`; use `unknown` and narrow with type guards.
- Server Components are the default.
- Use `"use client"` only when required for event handlers, React hooks, refs, effects, or browser APIs.
- Never instantiate `PrismaClient` directly; import the Prisma singleton from `@/lib/prisma`.
- Components should remain under roughly 150 lines whenever possible.
- Prefer composition over prop drilling.
- Tailwind layouts must be mobile-first.

## Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `camelCase.ts`, starting with `use`
- App route folders: `kebab-case`
- Constants: `UPPER_SNAKE_CASE`
- Boolean variables: use prefixes such as `is`, `has`, or `should`

## GitKraken

- GitKraken may be used for visibility, staging, conflict review, and pushing compliant work.
- Do not use GitKraken to bypass branch, commit, PR, or file rules.
- If GitKraken creates a non-compliant branch, commit, or PR, stop and fix it before continuing.

## Enforcement

- Agent guidance in this file helps IDE agents behave consistently.
- Husky hooks provide hard local enforcement for GitKraken and terminal git operations.
- If Husky is not installed, run `npm install` so the `prepare` script installs hooks.
