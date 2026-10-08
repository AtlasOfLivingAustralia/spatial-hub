#!/bin/sh
# One-shot GeoServer setup for the e2e stack (same steps as la-docker-compose's geoserver-init):
# workspace ALA, LayersDB PostGIS datastore, URL check for spatial-service uploads, styles, feature types.
set -u
GS=http://geoserver:8080/geoserver; U=admin:geoserver
SPATIAL_DB=https://github.com/AtlasOfLivingAustralia/spatial-database/raw/master
code() { curl -s -o /dev/null -w '%{http_code}' -u $U "$1"; }
gs() { curl -s -u $U "$@" || true; }
[ "$(code $GS/rest/workspaces/ALA)" = 200 ] || gs -XPOST -H 'Content-type: text/xml' -d '<workspace><name>ALA</name></workspace>' $GS/rest/workspaces
gs -XPOST -H 'Content-type: text/xml' -d '<dataStore><name>LayersDB</name><connectionParameters><host>postgres</host><port>5432</port><database>layersdb</database><schema>public</schema><user>layers</user><passwd>layers</passwd><dbtype>postgis</dbtype></connectionParameters></dataStore>' $GS/rest/workspaces/ALA/datastores
gs -XPOST -H 'Content-type: text/xml' -d '<regexUrlCheck><name>e2e-data</name><description>spatial-service external uploads</description><enabled>true</enabled><regex>file:/{1,3}data/(spatial-data|geoserver_data_dir)/(?!.*\.\.).*</regex></regexUrlCheck>' $GS/rest/urlchecks
mkdir -p /tmp/sld; cd /tmp/sld
for s in distributions_style envelope_style alastyles points_style; do
  curl -sfL -o $s.sld $SPATIAL_DB/$s.sld || echo "style $s not downloaded (skipped)"
  gs -XPOST -H 'Content-type: text/xml' -d "<style><name>$s</name><filename>$s.sld</filename></style>" $GS/rest/styles
  [ -f $s.sld ] && gs -XPUT -H 'Content-type: application/vnd.ogc.sld+xml' -d @$s.sld $GS/rest/styles/$s
done
for ft in objects distributions points; do
  gs -XPOST -H 'Content-type: text/xml' -T /init/geoserver.$ft.xml $GS/rest/workspaces/ALA/datastores/LayersDB/featuretypes
done
gs -XPUT -H 'Content-type: text/xml' -d '<layer><defaultStyle><name>distributions_style</name><workspace>ALA</workspace></defaultStyle></layer>' $GS/rest/layers/ALA:Objects
echo "ALA:Objects -> $(code $GS/rest/layers/ALA:Objects)"
