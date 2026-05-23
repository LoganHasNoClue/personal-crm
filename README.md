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
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with a liquid-glass design system (see `src/components/glass/`).
- **Maps:** Apple's native [MapKit JS](https://developer.apple.com/maps/web/) via `@apple/mapkit-loader`. Tokens are signed server-side with `jose`.
- **Package manager:** `npm` (works with `bun` too — both produce a compatible build).

## Project structure

```
src/
  app/                  # App Router routes, layouts, and API handlers
    api/                # Route handlers (server-only HTTP endpoints)
      health/           # Liveness probe (no external deps)
      mapkit/token/     # Signs short-lived MapKit JS authorization JWTs
    contacts/           # /contacts list screen
    map/                # /map screen + MapView client component
  components/
    glass/              # Liquid-glass design primitives
                        #   GlassCard · GlassButton · GlassPill · GlassNavBar
    map/                # AppleMap client wrapper around MapKit JS
  lib/                  # Utilities and helpers
    cn.ts               # Tiny class-name combiner
    env.ts              # Lazy, throw-free env var access
    mapkit-token.ts     # ES256 JWT signer for MapKit JS
    sample-contacts.ts  # In-memory placeholder data
  types/                # Shared TypeScript types and interfaces
public/                 # Static assets served as-is
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
| `MAPKIT_TEAM_ID`      | For `/map`      | Server only   | 10-character Apple Developer Team ID. Used as the JWT `iss` claim.          |
| `MAPKIT_KEY_ID`       | For `/map`      | Server only   | 10-character Key ID of the MapKit JS-enabled key you created in Apple's portal. |
| `MAPKIT_PRIVATE_KEY`  | For `/map`      | Server only   | Contents of the `.p8` private key (PKCS8 PEM, single- or multi-line).        |

### Getting MapKit credentials

The `/map` page uses Apple's official [MapKit JS](https://developer.apple.com/maps/web/) SDK and needs three credentials from your Apple Developer account:

1. Go to <https://developer.apple.com/account/resources/identifiers/list/maps> and create a **Maps ID** (any unique identifier, e.g. `maps.com.yourapp.personal-crm`).
2. Go to <https://developer.apple.com/account/resources/authkeys/list>, create a new key, enable **MapKit JS**, associate the Maps ID, and download the resulting `.p8` file. **You can only download it once.**
3. Copy the values into `.env.local`:
   - `MAPKIT_TEAM_ID` — your 10-character Team ID (top-right of the Developer portal).
   - `MAPKIT_KEY_ID` — the 10-character ID shown next to the key you just created.
   - `MAPKIT_PRIVATE_KEY` — paste the full contents of the `.p8` file (including the `-----BEGIN/END PRIVATE KEY-----` lines). For single-line envs, encode line breaks as `\n`.

If any of the three are missing, `/api/mapkit/token` returns `503` and the `/map` page renders a friendly "configure credentials" empty state — the rest of the app keeps working.

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
