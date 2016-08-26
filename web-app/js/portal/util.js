var Util = {
    createCircle: function (lng, lat, radiusM) {
        var belowMinus180 = false;
        var maxPoints = 50
        var points = [];
        for (var i = 0; i < maxPoints; i++) {
            points[i] = Util.computeOffset(lat, 0, radiusM, i / maxPoints * 360);
            if (points[i][0] + lng < -180) {
                belowMinus180 = true;
            }
        }

        //longitude translation
        var dist = ((belowMinus180) ? 360 : 0) + lng;

        var wkt = "POLYGON (("
        for (var i = 0; i < maxPoints; i++) {
            wkt += points[i][0] + dist + ' ' + points[i][1] + ', '
        }
        // append the first point to close the circle
        wkt += points[0][0] + dist + ' ' + points[0][1];
        wkt += '))'

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
    }
}