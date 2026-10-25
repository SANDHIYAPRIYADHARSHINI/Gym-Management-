# GymGraph

**Gym Management on a Graph Database** — BACSE202 Database Systems (DA2).

React + TypeScript (Vite), Express + TypeScript, Zod, Neo4j official driver, Argon2id, JWT cookies, Recharts and Lucide. Neo4j is the only database. All sample records are synthetic.

## Setup

Requires Node.js 22.12+ (verified on 24.12), npm, and Neo4j 5.26+ or Docker Compose.

```sh
git clone https://github.com/SANDHIYAPRIYADHARSHINI/Gym-Management-.git
cd Gym-Management-
npm ci
cp .env.example .env
```

PowerShell: `Copy-Item .env.example .env`. Set a random `JWT_SECRET` of at least 32 characters and your Neo4j credentials. Never commit `.env`.

```sh
docker compose up -d neo4j
# Wait until Neo4j is ready.
npm run db:constraints
npm run db:seed
npm run dev
```

Open http://localhost:5173. The API listens on http://127.0.0.1:3001. Seed refuses to run over any existing nodes; constraints are repeatable and kept separate.

## Demo accounts

All use fake password `GymGraph-Demo-2026!`:

- Admin: `admin@gymgraph.example`
- Trainer (Karan): `trainer@gymgraph.example`
- Member (Meena): `member@gymgraph.example`

Only use these accounts for synthetic demonstrations.

## Features

- Database dashboard, member counts, plan revenue charts and dues.
- Six entity management pages with listing, search, create, edit and guarded delete. Reference fields take IDs shown on the relevant entity page.
- Register Member creates the member, home branch, subscription and full first payment in one managed transaction.
- Payments require positive integer rupees; Change Plan records dated history. Regular member editing cannot bypass plan history.
- Members with payments cannot be deleted. Referenced records and login-linked people also have deletion guards.
- Five named reports and nine fixed Evaluation Studio queries, including an inclusive date range. No arbitrary Cypher console.
- Graph explorer with colours, legend, pan, zoom, details and an accessible node/edge list; capped at 200 business nodes with truncation notice.
- Query demo mode shows driver-captured statements after commit, with recursively masked private parameters. It never replays the write.
- API-enforced member ownership and trainer branch restrictions; separate portals.
- HttpOnly SameSite=Strict JWT cookie, Argon2id, login throttling, Helmet and exact-origin checks on mutations.
- Responsive charcoal/orange interface, light/dark themes and keyboard dialogs.

## Environment

`NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_DATABASE` configure the server connection. `JWT_SECRET` must contain at least 32 characters. `APP_ORIGIN` is the exact allowed browser origin, e.g. `http://localhost:5173`. `PORT` defaults to 3001. `TEST_NEO4J_URI` and `TEST_NEO4J_PASSWORD` identify a separate disposable instance. `RUN_NEO4J_TESTS=true` enables real integration testing.

Production: `npm run build`, then run `npm start` with `NODE_ENV=production` behind an HTTPS reverse proxy and set `APP_ORIGIN` to the public HTTPS origin. Production cookies are Secure. The API binds loopback. No cloud deployment is supplied or claimed.

## Verification commands

```sh
npm run check
npm run build
npm test
```

Default tests run request-boundary and validation checks; database tests explicitly skip unless enabled. Default success alone does not establish database correctness.

```sh
docker compose --profile test up -d neo4j-test
```

In PowerShell, against a separate empty disposable instance:

```powershell
$env:RUN_NEO4J_TESTS='true'
$env:TEST_NEO4J_URI='bolt://127.0.0.1:7688'
$env:TEST_NEO4J_PASSWORD='synthetic-test-password'
npm test
```

On POSIX prefix `npm test` with those three environment assignments. Tests refuse the application URI and refuse to overwrite existing test data. They leave synthetic results for inspection. Recreate only the disposable test instance before another run.

## Seed assumptions

The source MySQL script was not attached. Six payment amounts/dates were not fully specified. This explicit reconstruction uses Ravi 5000 + 3000, Priya 3000, Arjun 15000, Meena 5000 and Kiran 15000 (whole rupees), dated 2026-01-02. Join dates are 2026-01-01 and phones are synthetic.

Baseline: **5 members, 3 branches, 4 trainers, 4 classes, 6 payments, ₹46,000 collected**. Meena alone owes **₹3,000**. Branch revenue: Koramangala 23000, Whitefield 18000, Indiranagar 5000. Plan revenue: Basic 3000, Premium 13000, Gold 30000. Ravi alone has multiple payments; nobody in the seed has never paid. Arjun wins the deterministic highest-payment tie; Koramangala wins the largest-branch tie.

Balance is `max(current fee - lifetime payments, 0)`, not recurring billing. Revenue by plan attributes payments to the member’s current plan, so plan changes reattribute past revenue. Schedules are strings matching the specification, not dated appointments.

## Architecture

`src/` contains React pages, charts, dialogs and graph. `server/app.ts` owns API transactions and authorization; `db.ts` captures queries and redacts parameters; `model.ts` contains schemas and fixed metadata; `queries.ts` contains the read catalogue. `setup.ts` and `seed.ts` are separate scripts. `tests/` holds boundary and integration checks.

Six business labels plus authentication-only AppUser are used. IDs are strings (seed IDs are short numeric strings; new API IDs are UUIDs). AppUser has optional memberId/trainerId properties. Money is converted to Neo4j integers, and dates use Cypher date values. Every user value is parameterized; dynamic labels come only from server-owned metadata. Managed transactions recheck references and acquire write locks. Direct database administrators can bypass API integrity rules.

See [model and MySQL comparison](docs/MODEL.md), [viva checklist](docs/DEMO.md) and [verification and limits](docs/VERIFICATION.md).

Official API references: [Neo4j transactions](https://neo4j.com/docs/javascript-manual/current/transactions/) and [Vite setup](https://vite.dev/guide/). Resolved package versions are locked in package-lock.json. No performance advantage or production readiness is claimed.


## Netlify deployment

The repository includes `netlify.toml` and `netlify/functions/api.ts`: Vite assets are served from `dist`, `/api/*` is routed to the Express function, and other URLs fall back to the React router. The function imports the API without starting a long-running listener. Netlify builds the native Argon2 dependency on its Linux build environment.

1. Create a Neo4j AuraDB instance (or another externally reachable Neo4j server). Store credentials securely; do not paste them into chat or commit them.
2. In Netlify, configure function runtime environment variables: `NEO4J_URI` (Aura's `neo4j+s://` URI), `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_DATABASE=neo4j`, a random `JWT_SECRET` of at least 32 characters, `NODE_ENV=production`, and `APP_ORIGIN=https://YOUR-SITE.netlify.app` (exact published origin).
3. Against that new empty database, run `npm run db:constraints` and then `npm run db:seed` locally with the Aura credentials in your ignored `.env`. The seed refuses to overwrite existing data. Use synthetic data only.
4. Run `npx netlify login`, then `npx netlify deploy --build --prod`. Select/create the intended site during the CLI flow. GitHub access is not required for a manual local upload.
5. Verify `/api/health`, all three role logins and the demo checklist on the published origin. Changing the domain requires updating `APP_ORIGIN` and redeploying.

A frontend deployment without a reachable Neo4j database and these runtime secrets cannot provide working login or persistence. Serverless login throttling is per warm function instance; a public production service needs a shared rate-limit store or platform enforcement. No successful Netlify deployment is claimed until a deployment URL and runtime checks are verified.


### Troubleshooting: Request origin rejected

In local development, `localhost`, `127.0.0.1` and IPv6 loopback are accepted interchangeably on the configured protocol and port. Restart `npm run dev` after updating the server. In production, set `APP_ORIGIN` to the exact URL in your browser (scheme and hostname, no trailing slash), then redeploy. A Netlify deploy-preview URL differs from the main site URL and needs its own exact origin configuration. Never disable origin protection to work around this error.

Demo credentials work only after the API can reach Neo4j and `npm run db:constraints` followed by `npm run db:seed` has populated an empty database. The seed refuses existing records; do not clear a populated database just to fix login.


## Personal portals and expanded demo data

Members and trainers now choose what to display from a category list. Members have Overview, My profile, Classes & schedule, and Membership & payments. Trainers have Overview, My profile, Classes & schedule, and a searchable Branch members directory. Cards display individual readable fields; raw database maps are no longer used as portal content. Selected categories are reflected in the URL for bookmarking.

The member query groups payments in a separate WITH clause before returning profile fields, avoiding Neo4j implicit-grouping errors. Refresh the browser after updating; restart the API if it is not running in watch mode.

For a richer **synthetic** demonstration after the baseline seed:

```sh
npm run db:expand
```

This additive managed transaction uses reserved `demo-` IDs and MERGE, preserves baseline records, and can be rerun without duplicating generated nodes. It adds 24 members, 24 payments, 3 trainers and 10 classes with varied join dates, full/partial/missing payments and multi-day schedules. It requires the baseline branches/plans/trainers. Baseline course totals apply before expansion; reports change after expansion. No additional login accounts or business labels are added.

Verified portal screenshots: [Member overview](docs/screenshots/member-overview.png) and [Trainer directory](docs/screenshots/trainer-directory.png).


## Behind the scenes

The sidebar groups Graph explorer, Query studio, My insights and Settings for all three roles. Admins retain the full graph and nine-query catalogue. Members and trainers use API-scoped graph and read-only query endpoints; trainer graphs omit member phone numbers and payments. Settings saves the theme in this browser and exposes committed-write demonstrations only to admins.
