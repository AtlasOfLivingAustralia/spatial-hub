var Util = {
    wrapMinusLngLat : [-180, -90],
    wrapPlusLngLat : [180, 90],

    createCircle: function (lng, lat, radiusM) {
        var belowMinus180 = false;
        var maxPoints = 50;
        var points = [];
        for (var i = 0; i < maxPoints; i++) {
            points[i] = Util.computeOffset(lat, 0, radiusM, i / maxPoints * 360);
            if (points[i][0] + lng < -180) {
                belowMinus180 = true;
            }
        }

        //longitude translation
        var dist = ((belowMinus180) ? 360 : 0) + lng;

        var wkt = "POLYGON ((";
        for (i = 0; i < maxPoints; i++) {
            wkt += points[i][0] + dist + ' ' + points[i][1] + ', '
        }
        // append the first point to close the circle
        wkt += points[0][0] + dist + ' ' + points[0][1];
        wkt += '))';

        return wkt
    },

    computeOffset: function (lat, lng, radius, angle) {
        var b = radius / 6378137.0;
        var c = angle * (Math.PI / 180.0);
        var e = lat * (Math.PI / 180.0);
        var d = Math.cos(b);
        b = Math.sin(b);
        var f = Math.sin(e);
        e = Math.cos(e);
        var g = d * f + b * e * Math.cos(c);

        var x = (lng * (Math.PI / 180.0) + Math.atan2(b * e * Math.sin(c), d - f * g)) / (Math.PI / 180.0);
        var y = Math.asin(g) / (Math.PI / 180.0);

        return [x, y];
    },

    isOutOfRange: function (coords) {
        var below = false;
        var above = false;
        for (var i = coords.length - 1; i >= 0; i--) {
            var ring = coords[i];
            if (ring[0] < -180) {
                below = true;
            }
            if (ring[0] > 180) {
                above = true;
            }
        }

        return below || above;
    },

    addWrapPointToRings: function (current, lastPt, pt, lastRegion, region, rings) {
        // if the region has changed, split the ring along -180 and +180
        if (lastRegion != -2 && lastRegion != region) {
            var slope = (pt[1] - lastPt[1]) / (pt[0] - lastPt[0]);
            var y = pt[1] - pt[0] * slope;

            Util.addSplitPoint(rings, this.wrapMinusLngLat, lastPt, pt, lastRegion, region, slope, y);
            Util.addSplitPoint(rings, this.wrapPlusLngLat, lastPt, pt, lastRegion, region, slope, y);
        }

        rings[region + 1][rings[region + 1].length - 1].push(current);
    },

    addSplitPoint: function (rings, edge, lastPt, pt, lastRegion, region, slope, y) {
        if (edge[0] <= Math.max(lastPt[0], pt[0]) && edge[0]>= Math.min(lastPt[0], pt[0])) {
            var ym = slope * edge[0] + y;
            var latlng = [ym, edge[0]];

            var lastRing = rings[lastRegion + 1][rings[lastRegion + 1].length - 1];
            lastRing.push([latlng[1], latlng[0]]);

            // add new ring when the current ring is finished.
            if (lastRing[0][0]== latlng[1]) {
                rings[lastRegion + 1].push([])
            }

            var nextRing = rings[region + 1][rings[region + 1].length - 1];
            nextRing.push([latlng[1], latlng[0]]);

        }
    },

    buildMultiPolygonFromWrapRings: function (rings) {
        var multipolygon = [];
        for (var r = 0; r < rings.length; r++) {
            var groups = rings[r];
            for (var g = 0; g < groups.length; g++) {
                var coords = groups[g];
                var ring = [];
                for (var i = 0; i < coords.length; i++) {
                    while (coords[i][0] < -180) {
                        coords[i][0] += 360;
                    }
                    while (coords[i][0] > 180) {
                        coords[i][0] -= 360;
                    }
                    //correct lower bound of > +180 ring
                    if (r == 2 && coords[i][0] == 180) {
                        coords[i][0] = -180;
                    }
                    //correct upper bound of < -180 ring
                    if (r == 0 && coords[i][0] == -180) {
                        coords[i][0] = 180;
                    }
                    ring.push(coords[i])
                }

                if (ring.length > 0) {
                    //close open rings
                    if (ring[0][0] != ring[ring.length - 1][0] || ring[0][1] != ring[ring.length - 1][1]) {
                        ring.push(ring[0]);
                    }
                    multipolygon.push(ring);
                }
            }
        }

        return multipolygon;
    },

    /**
     * Split polygons that cross longitude -180 or +180 into multipolygons.
     *
     * @param obj
     */
    wrap: function (coords) {

        if (!(coords[0] instanceof Array)) {
            coords = [coords];
        }

        // only need to split when there is a point < -180 or > 180
        if (Util.isOutOfRange(coords)) {
            this.wrapMinusLngLat = [-180, -90];
            this.wrapPlusLngLat = [180, 90];

            var rings = [[[]], [[]], [[]]];

            var region = 0;
            var lastRegion = -2;
            var lastPt = {};
            for (var i in coords) {
                if (coords.hasOwnProperty(i)) {
                    var ring = coords[i];
                    var pt = [ring[0], ring[1]];
                    if (pt[0] < this.wrapMinusLngLat[0]) region = -1;
                    else if (pt[0] > this.wrapPlusLngLat[0]) region = 1;
                    else region = 0;

                    Util.addWrapPointToRings(ring, lastPt, pt, lastRegion, region, rings);

                    lastRegion = region;
                    lastPt = pt;
                }
            }
            return Util.buildMultiPolygonFromWrapRings(rings);
        } else {
            return [coords];
        }
    },

    download: function (url) {
        var link = document.createElement("a");
        //link.target = '_blank';
        link.href = url;
        link.click();
    },

    reconnect: function () {
        var succeed = angular.element('div[name=divMappedLayers]').scope().reconnect();
        if (!succeed) {
            var countDownDate = new Date().getTime();
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = now - countDownDate;
                var remaining = 10 - Math.floor((distance % (1000 * 60)) / 1000);
                $('div#statusInfo > p').html('<strong>Reconnecting failed!</strong>  Try again in <strong>' + remaining + '</strong> seconds');
                if (remaining <= 0) {
                    $('div#statusInfo > p').html('Connecting ...');
                    clearInterval(x);
                    reconnect()
                }
            }, 1000)
        }
    }
};