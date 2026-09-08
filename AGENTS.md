<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GitHub Star Radar

## Scope and task discipline

- This repository root is the only permitted work area. Create, read, modify,
  and delete project files only inside this repository; never create a nested
  `github-radar` project directory.
- Preserve unknown files and existing user changes. Do not casually modify,
  reformat, rename, or remove files unrelated to the current task.
- Do not hand-edit generated output or installed dependencies, including `.next`
  and `node_modules`.

## Required stack and package management

- Use Next.js with the App Router, TypeScript, React, and Tailwind CSS.
- Keep application routes, layouts, and global styles under `src/app` and follow
  the existing `src`-based project structure.
- Use npm exclusively. Do not use Yarn, pnpm, or Bun. Commit `package-lock.json`
  whenever an intentional dependency change updates it.
- Prefer built-in platform capabilities and existing packages. Do not introduce
  large dependencies or UI frameworks for functionality that can be implemented
  simply with the current stack.

## TypeScript and application structure

- Write TypeScript in a strict style. Preserve strict compiler settings, model
  domain data with explicit types, and avoid `any`; use `unknown` with narrowing
  when external data is not yet trusted.
- Keep types explicit at system boundaries such as API responses, route
  parameters, environment variables, and persisted data.
- Prefer Server Components. Add `"use client"` only when browser APIs, React
  state, effects, or interactive event handlers require it.
- Keep components focused. Colocate route-specific code near its route and move
  code into shared directories under `src` only when it is genuinely reused.
- Use the `@/*` import alias for modules under `src` when it improves clarity.

## UI and responsive design

- Keep the UI simple, modern, and information-focused, drawing visual direction
  from GitHub, Linear, and Vercel. Avoid unnecessary decoration, oversized
  effects, or visual complexity.
- Every user-facing view and interaction must work on both desktop and mobile.
  Check responsive layout, readable type, touch targets, overflow, and keyboard
  accessibility when changing UI.
- Follow the existing Tailwind CSS approach and established design tokens before
  adding one-off styling conventions.

## Secrets and environment variables

- Never write GitHub tokens, API keys, passwords, or other secrets into source
  code, fixtures, logs, documentation examples, or committed configuration.
- Server-side secrets must be read from environment variables and must remain in
  server-only code.
- Never store a GitHub token in a variable whose name starts with `NEXT_PUBLIC_`;
  that prefix exposes values to browser bundles.
- `.env.local` must never be committed to Git. Document required variables in a
  committed example env file using placeholder values only.

## Network and external API behavior

- Every network-backed experience must provide meaningful loading, error, and
  empty states.
- Handle all external API failures gracefully, including authentication errors,
  rate limits, timeouts, malformed responses, and unavailable services. Do not
  expose credentials, raw internal errors, or stack traces to users.
- Validate and narrow external data before using it as trusted application data.

## Validation and completion

- Run `npm run lint` after every completed code or configuration change and fix
  all errors caused by the task.
- Run `npm run build` after important changes, including changes to routes,
  rendering, configuration, dependencies, data fetching, or production behavior.
- Treat relevant TypeScript errors, lint errors, build failures, and warnings as
  work to resolve rather than ignore.
- When completing a task, summarize what changed, which files were involved,
  the lint/build/test results, and any remaining limitations.
