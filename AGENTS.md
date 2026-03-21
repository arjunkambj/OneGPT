# Repository Guidelines

## Project Structure & Module Organization

The primary app lives at the repository root. Next.js App Router pages are in `src/app`, shared UI in `src/components`, reusable hooks in `src/hooks`, utilities and types in `src/lib`, and global styles in `src/styles`. Convex backend code lives in `convex/`, with generated files under `convex/_generated/` and helper modules in `convex/lib/`.

`public/` stores static assets. Keep feature code close to the route or component it supports, and treat generated Convex artifacts as read-only.

## Build, Test, and Development Commands

From the repo root:

- `pnpm dev` starts the main app on `localhost:3000`.
- `pnpm build` creates a production build.
- `pnpm check-types` runs strict TypeScript checks.
- `pnpm lint` runs Biome linting.
- `pnpm format` formats files with Biome.

## Coding Style & Naming Conventions

Use TypeScript and 2-space indentation. Code style is enforced with Biome (`biome.json`). Keep React components in PascalCase files such as `src/components/chat/Message.tsx`, hooks in `use-*.ts(x)`, and route folders aligned with App Router conventions.

Use the `@/*` alias for root imports. Do not edit generated files in `convex/_generated/` manually.

## Testing Guidelines

There is no committed automated test suite yet. For now, every change should pass linting and type checks in the app you touched, then be verified manually in the browser. If you add tests, place them near the feature or in a local `__tests__/` folder and keep the naming explicit, for example `message-list.test.tsx`.

## Important

Prefer functional programming patterns, avoid explicit returns types unless you absolutely need to, and be concise in the code you write, but be through in your planning.

When installing packages, use the package manager for that language.

This is a brand-new project with no users and no existing database data.
You are free to modify the schema, functions, or architecture as needed to solve problems — there are no legacy constraints to consider.
If you encounter any legacy logic, duplicate checks, or redundant functions in the codebase, feel free to remove or refactor them as needed.

DONT DO PNPM DEV OR NPX CONVEX DEV BECAUSE IS ALWAYS RUNNING IN MY TERMINAL

-Always use Cli command to add shadcn compoents

When working on Convex code, always read convex_rules.md first for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit prefixes such as `feat:` and `fix:`. Follow that format and keep the subject specific, for example `fix: remove shadow glow behind chat input`.

Pull requests should describe user-visible impact, note any Convex or env changes, link related issues, and include screenshots or short recordings for UI work. List the verification commands you ran before requesting review.
