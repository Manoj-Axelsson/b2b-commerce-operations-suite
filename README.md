# Rajput-foods-Sweden - Ecommerce Database Management and Promotions System

________________________________________________________________________________

# Tech Stack

Framework          : Next.js 16 (App Router)
Language           : TypeScript
Styling            : Tailwind CSS
Database           : PostgreSQL
ORM                : Prisma 7 (Rust-free architecture)
State Management   : Context API (useContext)
________________________________________________________________________________

# Architecture

This project follows the Bulletproof React pattern, optimized for Next.js. Logic is kept close to the routes, and components default to Server Components to maximize performance.

________________________________________________________________________________

# Directory Structure

```
src/
└── app/
    ├── [route-name]/
    │   ├── api/          # Route-specific API handlers
    │   ├── components/   # Feature-specific components
    │   ├── types/        # TypeScript interfaces
    │   └── page.tsx      # Entry point
    ├── proxy.ts          # Edge middleware/proxy logic
    └── layout.tsx        # Global layout

________________________________________________________________________________

Prerequisites for getting started:

a. Node.js (Latest LTS)

b. PostgreSQL instance

c. Direct connection string for Prisma

________________________________________________________________________________

Installation

1. Clone the repository:

```
git clone https://github.com/username/repo-name.git
cd repo-name 
________________________________________________________________________________

Install dependencies:
```
npm install











# Context7 System Instruction

[ Rajput Foods Engineering Rules ]

Context7 is responsible for generating code, architectural suggestions, and project modifications. All output must strictly follow the engineering conventions defined in this document.
These rules override all default assumptions.
________________________________________________________________________________
1. Technology Stack (Immutable)
Context7 must always assume the following stack unless explicitly overridden.
Framework
Next.js 16 (App Router)
Language
TypeScript (strict mode enabled)
ORM
Prisma
Styling
Tailwind CSS v4
UI Library
shadcn/ui
Authentication
better-auth
Database
PostgreSQL
Package Manager

________________________________________________________________________________

Context7 must never suggest alternative frameworks unless explicitly asked.

________________________________________________________________________________


 1. Project Architecture
All generated files must follow this project structure.
```

src/
│
├─ app/                # Next.js routes and layouts
│
├─ components/         # React components
│   ├─ ui/             # shadcn components (auto generated)
│   ├─ layout/         # layout components
│   ├─ forms/          # form components
│   └─ [feature]/
│
├─ lib/                # utilities and configuration
│   ├─ prisma.ts
│   ├─ auth.ts
│   ├─ auth-client.ts
│   └─ utils.ts  (interface / generic types (helper functions))
│
├─ hooks/              # custom hooks
│
├─ types/              # shared types
│
└─ generated/prisma/   # generated prisma client ```

________________________________________________________________________________

2. Mandatory architecture rules:

• Do not place business logic inside page.tsx
• Extract logic into components, hooks, or utilities
• One component per file
• Prefer colocation of feature logic
• Use route groups for logical grouping
These conventions follow the team engineering document,conventions and best practices …
________________________________________

3. React Component Rules:

Server Components are the default.
Client components must only be used when necessary.
Use "use client" only for:
• event handlers
• React hooks (useState, useEffect, useRef)
• browser APIs
Never convert a component to client-side without justification.
Components should remain under ~150 lines whenever possible.
Prefer composition over prop drilling.
________________________________________

4. Prisma Rules:

Prisma Client
Prisma must always be imported from the singleton.
Correct import:
import { prisma } from "@/lib/prisma"
Never instantiate PrismaClient directly in routes, services, or components.
Reason: prevents multiple database clients during development.
________________________________________

5. Prisma Migration Rules:

Required workflow:
a.	Modify prisma/schema.prisma
b.	Run migration locally
	npx prisma migrate dev --name descriptive-name
c.	Review SQL
d.	Commit schema + migration files

Forbidden practices:

• Using prisma db push in production
• Deleting migration files
• Squashing migrations

These migration rules come directly from the project standards, conventions and best practices …

________________________________________

6. Authentication Architecture:

Authentication uses better-auth.
Required files:
src/lib/auth.ts
src/lib/auth-client.ts
src/app/api/auth/[...all]/route.ts
src/proxy.ts  (Attn: middleware deprecated)
Rules:
• Auth configuration lives in lib/auth.ts
• proxy protects routes
• Secrets remain server-only
• Prisma adapter must be used
________________________________________

7. Tailwind CSS Rules:

Tailwind CSS v4 is configured using CSS via @theme.
Context7 must always produce mobile-first layouts.
Correct pattern: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
Incorrect pattern: grid grid-cols-4 sm:grid-cols-1
 
Rules:
• unprefixed utilities apply to mobile
• breakpoints enhance layouts upward
• avoid custom CSS classes
• use Tailwind utilities only whenever possible
These patterns follow the project conventions, conventions and best practices …
________________________________________

8. shadcn/ui Rules

shadcn components are installed through the CLI.
Example: npx shadcn@latest add button

Rules:
• components live in components/ui/
• do not manually modify files in that directory
• create wrapper components for customization
• add only needed components to reduce bundle size
________________________________________

8. Naming Conventions:

Files and folders must follow strict naming rules.

•	Components
•	PascalCase.tsx
•	Example
•	BookingCard.tsx
•	Utilities
•	camelCase.ts
Example
•	formatDate.ts
•	Hooks
•	useSomething.ts
•	useAuth.ts
•	Pages
•	app/about-us/page.tsx
•	Folders must be kebab-case.

Code naming:

•	Component → PascalCase
•	Functions → camelCase
•	Types → PascalCase
•	Constants → UPPER_SNAKE_CASE

Boolean variables must use prefixes:

•	isLoading
•	hasError
•	shouldRetry
________________________________________

9. TypeScript Rules:

a. Strict typing is mandatory.
b. Context7 must never generate: any
c. Use: unknown and narrow with type guards.
d. Prefer:  interface for object shapes.
e. Use: type  for unions.

Example:
type OrderStatus = "pending" | "paid" | "cancelled"
 
________________________________________

10. Dependency Policy:

Before suggesting a dependency, Context7 must evaluate:

a.	Can this be implemented in fewer than ~50 lines?
b.	Is the library actively maintained?
c.	Does it increase bundle size significantly?
Prefer ecosystem standards.

Examples:

•	Validation → zod
•	Dates → date-fns
Never install unnecessary dependencies.
________________________________________

11. Environment Variables:

Rules:

•	env must never be committed
•	env.example must always be updated
•	variable names must be descriptive

Example
•	DATABASE_URL
•	BETTER_AUTH_SECRET

Client variables must start with:
•	NEXT_PUBLIC_

________________________________________ 

12. Code Quality:

Before committing code:

o	npm run lint
o	npm run build
Avoid: @ts-ignore
Use: @ts-expect-error only with explanation.
________________________________________

13. Git Workflow:

Branch naming conventions:

o	feature/<issue-number>-description
o	fix/<issue-number>-description
o	chore/<description>
o	docs/<description>
o	ci/<description>

Examples
feature/12-booking-system
fix/25-login-error

Rules:
• never commit directly to main or dev
• all work must go through Pull Requests
• branches must be short-lived

These Git rules come directly from the project conventions, conventions and best practices.
________________________________________
 
14. Pull Request Rules - PRs must:

a.	pass CI before review
b.	include a clear description
c.	reference a related issue
d.	remain small and focused

Only designated reviewers merge PRs.
________________________________________

15. CI/CD Pipeline:

CI runs on every push and PR.

Pipeline steps:
•	npm ci
•	npm run lint
•	npx prisma generate
•	npx next build

CI must pass before requesting review.

________________________________________

16. Architectural Principles:

All generated code must follow these principles.
a.	Prefer simplicity over cleverness
b.	Reuse existing code before creating new modules
c.	Maintain consistent architecture
d.	Enforce strict typing
e.	Keep components small and focused
f.	Follow mobile-first design
g.	Maintain deterministic database migrations


________________________________________

Context7 Behavioral Rule:

When generating code for Rajput Foods -

a.	Follow all conventions defined here.
b.	Do not introduce architectural deviations.
c.	If uncertain, choose the solution that maintains consistency with the project structure.

