#!/usr/bin/env bash
# Regenerates the import fixtures used by area-import.ui.spec.ts: two squares in Tasmania as KML and as a zipped shapefile.
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/squares.geojson" <<'JSON'
{"type":"FeatureCollection","features":[
{"type":"Feature","properties":{"name":"e2e square A"},"geometry":{"type":"Polygon","coordinates":[[[145.0,-42.5],[146.0,-42.5],[146.0,-41.5],[145.0,-41.5],[145.0,-42.5]]]}},
{"type":"Feature","properties":{"name":"e2e square B"},"geometry":{"type":"Polygon","coordinates":[[[147.0,-43.0],[148.0,-43.0],[148.0,-42.0],[147.0,-42.0],[147.0,-43.0]]]}}]}
JSON
rm -f squares.kml squares-shp.zip; mkdir -p "$tmp/shp"
ogr2ogr -f KML squares.kml "$tmp/squares.geojson"
ogr2ogr -f "ESRI Shapefile" "$tmp/shp/squares.shp" "$tmp/squares.geojson" -lco ENCODING=UTF-8
here=$PWD; (cd "$tmp/shp" && zip -q -r "$here/squares-shp.zip" .)
ls -l squares.kml squares-shp.zip
