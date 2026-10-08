# End-to-end tests (Playwright)

Browser and API tests for spatial-hub + spatial-service. They run against any deployment through `BASE_URL`
(default: the local stack below). `e2e/` has its own `package.json`: the root project stays dependency-free.

## Local stack

`stack/docker-compose.yml` starts PostGIS (layersdb from spatial-service), GeoServer, spatial-service, spatial-hub,
a mock OIDC provider (any user name signs in) and nginx as the single origin `http://e2e.localhost:18080`
(`*.localhost` resolves to loopback in Chromium; containers reach it through `host-gateway`).

```bash
# released images by default; test a branch build by overriding them
export SPATIAL_SERVICE_IMAGE=... SPATIAL_HUB_IMAGE=...
npm run stack:up
npx playwright install chromium
npm test
npm run stack:down
```

Notes
- Build the hub war with `./gradlew clean compileGroovyPages bootWar` (otherwise the war has no compiled GSPs).
- `stack/config/spatial-hub-config.yml` is ala-install's template rendered with ALA public defaults plus the e2e overrides.
- Test data lives in the stack, not in the tests: ALA's states layer cl22 (`stack/fixtures/make-states.py`), two synthetic
  environmental grids whose values are linear in lat/lon (`stack/fixtures/make-grids.py`) and a biocache stand-in
  (`stack/biocache-stub/stub.py`, behind nginx at `/biocache/`). Expected values in the tests are computed independently
  of the code under test.
- Nothing needs the network except pulling images and the OpenStreetMap tiles of the map.
- Against a real deployment set `BASE_URL` and `E2E_TOKEN` (API tests); the stub-based tests (scatterplot, AOO/EOO, area report)
  only make sense on the local stack.
- `tests/locale-es.ui.spec.ts` walks the menus and dialogs with a Spanish browser and writes `inventory.json`
  (every visible text per screen) next to the test results.

## CI

`.github/workflows/e2e.yml` builds the hub and a spatial-service checkout from source, layers the wars on the released images
(`ci/Dockerfile.*`), starts this stack and runs the tests. It runs on pushes to the aggregated branches and on demand
(`workflow_dispatch`: service repository and branch).

## Against a real deployment (CI with CAS)

```bash
BASE_URL=https://<portal> E2E_REMOTE=1 E2E_USER=<user> E2E_PASSWORD=<password> npx playwright test
```

`E2E_REMOTE=1` runs only the read-only smoke specs (`stack.api`, `hub.ui`, `locale-es.ui`): the others create areas
and tasks and need the synthetic fixtures of the local stack. `E2E_USER` / `E2E_PASSWORD` fill the provider's login
form (CAS); take them from the CI credentials, never commit them. Without `E2E_PASSWORD` the helper assumes the mock
OIDC of the local stack. Use `E2E_TOKEN` for API calls that need a bearer token.
