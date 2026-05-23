# Personal CRM

A relationship-first CRM — a CRM for the **people** in your life instead of
companies. It helps you remember names and context, follow up on time, and
keep up with friends, family, and acquaintances without the awkward
"sorry it's been so long" message.

This repository is the Next.js app that will eventually be exported to
[Eazo](https://eazo.ai) for deployment, so the project layout follows
Eazo's compatibility requirements out of the box.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org) (App Router) — see `package.json` for the exact version.
- **Language:** TypeScript in `strict` mode.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com).
- **Package manager:** `npm` (works with `bun` too — both produce a compatible build).

## Project structure

```
src/
  app/            # App Router routes, layouts, and API handlers
    api/          # Route handlers (server-only HTTP endpoints)
  components/     # Shared React UI components
  lib/            # Utilities, helpers, third-party client setup
  types/          # Shared TypeScript types and interfaces
public/           # Static assets served as-is
```

## Getting started

Prerequisites: Node.js 20+ (Node 22 recommended) **or** [Bun](https://bun.sh) 1.1+.

```bash
# 1. Install dependencies
npm install
# or: bun install

# 2. Copy the example env file and fill in the values you need
cp .env.example .env.local

# 3. Start the dev server
npm run dev
# or: bun run dev
```

The app will be available at <http://localhost:3000>. The home page is in
`src/app/page.tsx`.

### Scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Start the local dev server with hot reload. |
| `npm run build`     | Build the production bundle.                |
| `npm run start`     | Run the production build locally.           |
| `npm run lint`      | Lint the codebase with ESLint.              |
| `npm run typecheck` | Type-check with `tsc --noEmit`.             |

## Environment Variables

All secrets, API keys, and connection strings are read from `process.env`
at runtime — nothing is hardcoded. Every variable the app reads is listed
in [`.env.example`](./.env.example); copy that file to `.env.local` and
fill in the values for local development.

> Missing variables do **not** crash the app at startup. Code that depends
> on an env var checks it lazily and surfaces a friendly error instead.
> See [`src/lib/env.ts`](./src/lib/env.ts) for the read/require helpers.

| Variable              | Required        | Scope         | Description                                                                 |
| --------------------- | --------------- | ------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Recommended     | Client+Server | Public base URL of the deployed app, used for absolute links and OG tags.   |
| `DATABASE_URL`        | When DB is wired up | Server only | Connection string for the primary relational database (e.g. Postgres).      |

### Rules of thumb

- **Never** commit a real `.env`, `.env.local`, or any file containing
  secrets. `.gitignore` enforces this — `.env.example` is the only
  env file checked into the repo.
- Prefix a variable with `NEXT_PUBLIC_` only if it is safe to ship to
  the browser. Everything else is server-only.
- Add new variables to `.env.example` **and** this table in the same
  pull request that introduces them.

## Deployment

This project is intended to be exported to Eazo. Per Eazo's requirements
the repo intentionally omits:

- `vercel.json` (injected by the deploy platform).
- Any auth library — authentication is wired up externally after import.
- Filesystem writes used for data persistence.
- Network calls during `next build` that require live external services.

## License

Private project — all rights reserved (for now).
