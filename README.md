# Rajput Foods Sweden — Ecommerce Platform

> A full-stack ecommerce platform for Rajput Foods Sweden, built with Next.js 16 App Router, Prisma 7, PostgreSQL, and better-auth.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Authentication | better-auth |
| UI Library | shadcn/ui |
| State Management | Context API (`useContext`) |
| Package Manager | npm |

---

## Architecture

This project follows the **Bulletproof React pattern**, optimised for Next.js. Logic is kept close to the routes, and components default to Server Components to maximise performance.

---

## Directory Structure

```
src/
├── app/                    # Next.js routes and layouts
│   ├── [route-name]/
│   │   ├── components/     # Feature-specific components
│   │   ├── types/          # TypeScript interfaces
│   │   └── page.tsx        # Route entry point
│   ├── proxy.ts            # Edge middleware / route protection
│   └── layout.tsx          # Global layout
│
├── components/             # Shared React components
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── layout/             # Layout components
│   ├── form/               # Form components
│   └── [feature]/          # Feature-specific shared components
│
├── lib/                    # Utilities and configuration
│   ├── prisma.ts           # Prisma singleton
│   ├── auth.ts             # better-auth server config
│   ├── auth-client.ts      # better-auth client config
│   └── utils.ts            # Shared types and helper functions
│
├── hooks/                  # Custom React hooks
├── types/                  # Shared TypeScript types
└── generated/prisma/       # Generated Prisma client (do not edit)
```

---

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- PostgreSQL instance
- Direct connection string for Prisma

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Lexicon-Internship-Projects/rajput-foods-website.git
cd rajput-foods-website
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="your-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> `.env` must never be committed. See `.env.example` for all required variables.

**4. Run database migrations**

```bash
npx prisma generate
npx prisma migrate dev
```

**5. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Standards

### Component Rules

- **Server Components are the default** — use `"use client"` only when required
- Use `"use client"` only for: event handlers, React hooks (`useState`, `useEffect`, `useRef`), browser APIs
- Never convert a component to client-side without justification
- Components should remain under ~150 lines whenever possible
- Prefer composition over prop drilling

### Prisma Rules

Always import Prisma from the singleton — never instantiate `PrismaClient` directly:

```ts
// Correct
import prisma from "@/lib/prisma"

// Never do this
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
```

### Authentication

Authentication uses **better-auth** via `src/lib/auth.ts`. Route protection is handled in `src/proxy.ts`.

> `middleware.ts` is deprecated — use `proxy.ts` for all route protection.

### Tailwind CSS

Tailwind CSS v4 is configured via CSS `@theme`. Always write **mobile-first** layouts:

```html
<!-- Correct — mobile first -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

<!-- Incorrect -->
<div class="grid grid-cols-4 sm:grid-cols-1">
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | `PascalCase.tsx` | `ProductCard.tsx` |
| Utilities | `camelCase.ts` | `formatDate.ts` |
| Hooks | `camelCase.ts` | `useAuth.ts` |
| Pages | kebab-case folder | `app/about-us/page.tsx` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_ITEMS` |
| Boolean vars | Prefixed | `isLoading`, `hasError`, `shouldRetry` |

### TypeScript Rules

- Strict typing is mandatory — never use `any`
- Use `unknown` and narrow with type guards
- Prefer `interface` for object shapes, `type` for unions



## Git Workflow

### Branch Naming

| Prefix | Format | Example |
|---|---|---|
| `feature/` | `feature/<issue>-description` | `feature/12-product-crud` |
| `fix/` | `fix/<issue>-description` | `fix/25-auth-error` |
| `chore/` | `chore/<description>` | `chore/update-deps` |
| `docs/` | `docs/<description>` | `docs/api-readme` |
| `ci/` | `ci/<description>` | `ci/add-lint-check` |

**Rules:**
- Never commit directly to `main` or `dev`
- All work must go through Pull Requests
- Branches must be short-lived

### Pull Request Requirements

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

---

## CI/CD Pipeline

CI runs automatically on every push and PR:

``` ts
1. npm ci
2. npm run lint
3. npx prisma generate
4. npx next build
```

CI must pass before requesting review.

---

## Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/<issue>-description`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/<issue>-description`
5. Open a Pull Request against `dev`

Only designated reviewers merge PRs.
