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
- The layers database starts empty: tests that need layers must create them (`/ws/layers` is empty by default).
- Biocache and the other ALA services are the public ones; flows that need records need network access.
