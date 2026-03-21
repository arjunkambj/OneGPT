# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start Next.js dev server                       |
| `pnpm build`        | Production build                               |
| `pnpm check-types`  | TypeScript type check (`tsc --noEmit`)         |
| `pnpm lint`         | Lint with Biome (`biome check`)                |
| `pnpm format`       | Format with Biome (`biome format --write`)     |
| `npx convex dev`    | Run Convex dev server (syncs schema/functions) |
| `npx convex deploy` | Deploy Convex to production                    |

No test framework is configured.

## Architecture

**Full-stack AI chat aggregation platform** — users chat with multiple AI models through a unified interface.

### Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **Backend**: Convex (real-time serverless database + functions)
- **Auth**: Stack Auth with JWT, synced to Convex via webhook
- **Styling**: Tailwind CSS 4 + shadcn/ui (radix-maia style) + CSS variables via next-themes
- **Linter/Formatter**: Biome (not ESLint/Prettier)
- **Package Manager**: pnpm

### Route Structure (App Router)

- `(auth)/` — sign-in and auth handler routes
- `(protected)/` — authenticated routes (chat, settings) — requires login
- `(content)/` — public content pages (privacy policy, terms)
- `pricing/` — pricing page

### Data Flow

- **Client-side**: Convex React hooks for real-time queries/mutations via `ConvexClientProvider`
- **Server-side**: `convex/nextjs` helpers (`fetchQuery`, `preloadQuery`) with JWT forwarded from Stack Auth
- **Auth flow**: Stack Auth → JWT → Convex `ctx.auth.getUserIdentity()` → `tokenIdentifier` lookup in users table

### Convex Backend (`convex/`)

- `schema.ts` — tables: users, chats, messages, customInstructions, userPreferences, usage, subscriptions
- Functions are file-based routed: `convex/usage.ts` → `api.usage.functionName`
- `lib/auth.ts` / `lib/users.ts` — shared auth helpers (`requireAuth`, `getCurrentUser`, `requireCurrentUser`)
- `webhooks/stack.ts` — Svix-verified webhook for syncing Stack Auth users to Convex
- `_generated/` — auto-generated types, never edit manually
- See `convex_rules.md` at the repo root for detailed Convex conventions (validators, queries, mutations, actions, auth patterns)

## Important

Prefer functional programming patterns, avoid explicit returns types unless you absolutely need to, and be concise in the code you write, but be through in your planning.

When installing packages, use the package manager for that language.

This is a brand-new project with no users and no existing database data.
You are free to modify the schema, functions, or architecture as needed to solve problems — there are no legacy constraints to consider.
If you encounter any legacy logic, duplicate checks, or redundant functions in the codebase, feel free to remove or refactor them as needed.

DONT DO PNPM DEV OR NPX CONVEX DEV BECAUSE IS ALWAYS RUNNING IN MY TERMINAL

-Always use Cli command to add shadcn compoents

When working on Convex code, always read convex_rules.md first for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data

### Key Patterns

- **Icons**: Prefer Solar icons from `@iconify/react` over Lucide. shadcn/ui is configured with HugeIcons as its icon library.
- **Path alias**: `@/*` maps to `./src/*`
- **React Compiler**: Enabled in next.config.ts — avoid manual `useMemo`/`useCallback` where the compiler handles it
- **Convex queries**: Never use `.filter()` — use `.withIndex()` instead. Never use `.collect()` unbounded — use `.take(n)` or paginate. See `convex_rules.md` for full rules.
- **Auth in Convex functions**: Never accept userId as an argument — always derive from `ctx.auth.getUserIdentity()`
- **Biome**: 2-space indent, organizes imports automatically, React/Next.js recommended rules enabled
