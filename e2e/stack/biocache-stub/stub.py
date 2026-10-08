#!/usr/bin/env python3
"""Minimal biocache-service stand-in for the e2e stack. Serves what the scatterplot task needs: POST /qid (stores the
query, returns a numeric id), GET /qid/<id>, GET /occurrences/facets/download (lat_long values, header only for other facets), GET /occurrence/facets (empty), GET /occurrences/search
(totalRecords only) and GET /webportal/occurrences.gz for a fixed set of points at 0.25 degree
cell centres, so tests can predict the sampled grid values. A qid with a wkt restricts the points to the wkt's bounding
box. Every other path answers 200 with an empty JSON object."""
import gzip, io, json, re
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

QIDS = {}

def centre(lat, lon):  # snap to the e2e grid cell centre (0.25 deg, origin 112E 10S)
    return (round((lat // 0.25) * 0.25 + 0.125, 3), round((lon // 0.25) * 0.25 + 0.125, 3))
POINTS = [centre(-42.0 + 0.3 * i % 3.0, 145.0 + 0.2 * i) for i in range(12)] + \
         [centre(-30.0 + 0.9 * i, 120.0 + 2.1 * i) for i in range(15)]

def inside(wkt, lat, lon):
    nums = [float(n) for n in re.findall(r'-?\d+(?:\.\d+)?', wkt or '')]
    if not nums:
        return True
    xs, ys = nums[0::2], nums[1::2]
    return min(xs) <= lon <= max(xs) and min(ys) <= lat <= max(ys)

def rows(wkt):
    out = [['longitude', 'latitude', 'names_and_lsid', 'year']]
    for i, (lat, lon) in enumerate(POINTS):
        if inside(wkt, lat, lon):
            out.append([lon, lat, 'Eucalyptus e2e|urn:lsid:e2e:1|Myrtaceae', 2000 + i])
    return out

class H(BaseHTTPRequestHandler):
    def reply(self, body, ctype):
        self.send_response(200); self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_POST(self):
        form = parse_qs(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode())
        qid = str(len(QIDS) + 1)
        QIDS[qid] = {'q': form.get('q', ['*:*'])[0], 'fq': form.get('fq', []), 'wkt': form.get('wkt', [None])[0]}
        self.reply(qid.encode(), 'text/plain')

    def do_GET(self):
        u = urlparse(self.path)
        if u.path.endswith('/webportal/occurrences.gz'):
            q = parse_qs(u.query).get('q', [''])[0]
            wkt = QIDS.get(q[4:], {}).get('wkt') if q.startswith('qid:') else None
            buf = io.StringIO()
            for r in rows(wkt):
                buf.write(','.join('"%s"' % c for c in r) + '\n')
            self.reply(gzip.compress(buf.getvalue().encode()), 'application/gzip')
        elif u.path.endswith('/occurrences/facets/download'):
            q = parse_qs(u.query).get('q', [''])[0]
            wkt = QIDS.get(q[4:], {}).get('wkt') if q.startswith('qid:') else None
            if parse_qs(u.query).get('facets', [''])[0] == 'lat_long':
                self.reply(''.join('"%s,%s"\n' % (r[1], r[0]) for r in rows(wkt)[1:]).encode(), 'text/csv')  # "lat,lon"
            else:  # any other facet: no values, like biocache for a query without records (just the header line)
                self.reply(b'"Species Name","Taxon Rank","Common Name","Kingdom","Phylum","Class","Order","Family","Genus","Species","Scientific Name","Count"\n', 'text/csv')
        elif u.path.endswith('/occurrences/search'):
            q = parse_qs(u.query).get('q', [''])[0]
            wkt = QIDS.get(q[4:], {}).get('wkt') if q.startswith('qid:') else None
            self.reply(json.dumps({'totalRecords': len(rows(wkt)) - 1}).encode(), 'application/json')
        elif u.path.endswith('/occurrence/facets'):
            self.reply(b'[]', 'application/json')
        elif '/qid/' in u.path:
            self.reply(json.dumps(QIDS.get(u.path.rsplit('/', 1)[1], {})).encode(), 'application/json')
        else:
            self.reply(b'{}', 'application/json')

    def log_message(self, *a): pass

if __name__ == '__main__':
    HTTPServer(('0.0.0.0', 8080), H).serve_forever()
