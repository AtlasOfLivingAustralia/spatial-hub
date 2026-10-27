#!/bin/sh
# The stack is ready when the hub serves its login redirect, the service lists the task capabilities AND the
# service answers an authenticated endpoint with 401. Until pac4j has its JWT config, that endpoint answers 500
# ("credentialsExtractor is null") while everything else already looks up, and the first specs to run fail with
# "An error has occurred" on whatever they were doing. Waiting for the 401 is what makes the suite reproducible.
base=${BASE_URL:-http://e2e.localhost:18080}
for i in $(seq 1 "${E2E_WAIT_TRIES:-90}"); do
  hub=$(curl -s -o /dev/null -w '%{http_code}' "$base/" || true)
  tasks=$(curl -s "$base/ws/tasks/capabilities" | grep -c ScatterplotCreate || true)
  auth=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d '{"wkt":"POLYGON((0 0,1 0,1 1,0 0))","name":"readiness probe"}' "$base/ws/shape/upload/wkt" || true)
  if [ "$hub" = 302 ] && [ "$tasks" != 0 ] && [ "$auth" = 401 ]; then
    echo "stack ready after $((i * 5))s"
    exit 0
  fi
  sleep 5
done
echo "stack did not become ready (hub=$hub capabilities=$tasks auth=$auth)" >&2
exit 1
