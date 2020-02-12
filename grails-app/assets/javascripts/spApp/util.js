var Util = {
    wrapMinusLngLat: [-180, -90],
    wrapPlusLngLat: [180, 90],

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

        for (i = 0; i < maxPoints; i++) {
            points[i][0] = points[i][0] + dist
        }
        points.push(points[0]);

        return Util.wrappedToWkt(Util.wrap(points))
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
        if (edge[0] <= Math.max(lastPt[0], pt[0]) && edge[0] >= Math.min(lastPt[0], pt[0])) {
            var ym = slope * edge[0] + y;
            var latlng = [ym, edge[0]];

            var lastRing = rings[lastRegion + 1][rings[lastRegion + 1].length - 1];
            lastRing.push([latlng[1], latlng[0]]);

            // add new ring when the current ring is finished.
            if (lastRing[0][0] == latlng[1]) {
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

    buildWkt: function (polygon) {
        var wkt = '';
        var firstTime = true;
        for (var i = polygon.length - 1; i >= 0; i--) {
            if (!firstTime) {
                wkt += ', ';
            }
            else firstTime = false;
            wkt += polygon[i][0] + ' ' + polygon[i][1];
        }

        return wkt;
    },

    /**
     * Produce WKT from the output of Util.wrap
     *
     * @param obj
     */
    wrappedToWkt: function (processedCoordinates) {
        wkt = 'MULTIPOLYGON (';

        for (var i = 0; i < processedCoordinates.length; i++) {
            if (i > 0) {
                wkt += ', ';
            }
            wkt += '((';
            wkt += Util.buildWkt(processedCoordinates[i]);
            wkt += '))';
        }

        wkt += ')';

        return wkt;
    },

    /**
     * Split polygons that cross longitude -180 or +180 into multipolygons.
     *
     * Input is array of coordinates.
     * A coordinate is an array containing longitude and latitude, e.g. [longitude, latitude]
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

    download: function (url, filename) {
        var link = document.createElement("a");
        if (filename !== undefined) {
            link.setAttribute('download', filename);
        }
        link.setAttribute('target', '_blank');
        link.setAttribute('href', url);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
    },

    notEmpty: function (inputString) {
        return inputString !== undefined && inputString !== null && ("" + inputString).length > 0
    },

    deepCopy: function (src) {
        var copy = src instanceof Array ? [] : {}
        for (var i in src) {
            if ((i + '').indexOf('_') != 0 && typeof src[i] !== "function") {
                if ($.isArray(src[i]) || typeof src[i] === "object") {
                    copy[i] = Util.deepCopy(src[i])
                } else {
                    copy[i] = src[i]
                }
            }
        }
        return copy
    },

    /**
     * Get data to draw chart
     */
    convertFacetDataToChartJSFormat: function (data, copyTo) {
        copyTo = copyTo || {labels: [], data: []};
        if (copyTo != undefined && data != undefined) {
            data.forEach(function (item) {
                copyTo.labels.push(item.displayname);
                copyTo.data.push(item.count);
            });
        }

        return copyTo;
    },

    getBarColour: function (chartData, copyTo, getColour) {
        copyTo = copyTo || [];
        copyTo.length = 0;
        chartData && chartData.forEach(function (point) {
            var colour = '#' + getColour(point);
            copyTo.push({
                backgroundColor: colour,
                pointBackgroundColor: colour
            });
        });

        return copyTo;
    },
    getBorderColour: function (chartData, copyTo) {
        copyTo = copyTo || [];
        copyTo.length = 0;
        chartData && chartData.forEach(function (point) {
            copyTo.push(Util.geBorderColourForDataPoint(point));
        });

        return copyTo;
    },
    geBorderColourForDataPoint: function (point) {
        var selectedColour = "rgba(0, 0, 0, 1)",
            defaultColour = "rgba(0, 0, 0, 0.1)";
        return point.selected ? selectedColour : defaultColour
    },
    getRanges: function(dataType, min, max){
        switch (dataType) {
            case "int":
                return this.getRangeBetweenTwoInteger(min, max);
            case "tfloat":
                return this.getRangeBetweenTwoFloat(min, max);
            case "tdate":
                return this.getRangeBetweenTwoInteger(min.getFullYear(), max.getFullYear());
            default:
                return [];
        }
    },
    getRangeBetweenTwoNumber: function (min, max, numberOfIntervals, precision) {
        if(Number.isInteger(min) && Number.isInteger(max)) {
            return Util.getRangeBetweenTwoInteger(min, max, numberOfIntervals);
        } else if(Number.isFinite(min) && Number.isFinite(max)) {
            return  Util.getRangeBetweenTwoFloat(min, max, numberOfIntervals, precision);
        }
    },
    getRangeBetweenTwoFloat: function (min, max, numberOfIntervals, precision) {
        var result = [],
            interval,
            upper,
            lower,
            decimalBuffer;

        numberOfIntervals = $SH.numberOfIntervalsForRangeData || 7;
        precision = precision || 6;
        decimalBuffer = Math.pow(10, -1*precision);

        if((Number.isFinite(min) && Number.isFinite(max)) && (max > min)){
            interval = (max - min) / numberOfIntervals;
            lower = upper = min;
            for(var i = 1; (i < numberOfIntervals) && (max > upper); i ++ ){
                upper =  parseFloat((lower + interval).toFixed(precision));
                result.push([lower, upper]);
                lower = parseFloat((upper + decimalBuffer).toFixed(precision));
            }

            result.push([lower, max]);
        }

        return result;
    },

    getRangeBetweenTwoInteger: function (min, max, numberOfIntervals) {
        var result = [],
            interval,
            upper,
            lower,
            intBuffer = 1;

        numberOfIntervals = $SH.numberOfIntervalsForRangeData || 7;

        if((Number.isFinite(min) && Number.isFinite(max)) && (max >= min)){
            interval = parseInt((max - min + 1) / numberOfIntervals);
            if (interval < intBuffer)
                interval = intBuffer;
            lower = upper = min;

            for(var i = 1; (i < numberOfIntervals) && (max > upper ); i ++ ){
                upper =  lower + interval;
                result.push([lower, upper - intBuffer]);
                lower = upper;
            }

            if (lower <= max)
                result.push([lower, max]);
        }

        return result;
    },

    isFacetOfRangeDataType: function (dataType) {
        return $SH.rangeDataTypes.indexOf(dataType) >= 0;
    },

    inferDataTypeFromValue: function (value) {
        var number;
        if (!isNaN(value)) {
            number = parseFloat(value);
            if (Number.isInteger(number))
                return 'int';
            else
                return 'tfloat';
        } else if (!isNaN(Date.parse(value))) {
            return 'tdate';
        }
        else if (value && value.length > 0) {
            return "string";
        }
    },

    castValue: function (value, dataType) {
        switch (dataType) {
            case "int":
                return parseInt(value);
            case "tfloat":
                return parseFloat(value);
            case "tdate":
                return new Date(value);
            case "string":
            default:
                    return value === undefined || value === null? "" : value.toString();
        }
    },
    chartElementCloseToMouseClick: function (chart, event) {
        var helpers = Chart.helpers,
            eventPosition = helpers.getRelativePosition(event, chart.chart);
        if (chart.data.datasets) {
            for (var i = 0; i < chart.data.datasets.length; i++) {
                var meta = chart.getDatasetMeta(i);
                if (chart.isDatasetVisible(i)) {
                    for (var j = 0; j < meta.data.length; j++) {
                        if (this.isClickOnYAxisLabel(eventPosition.y, meta.data[j])) {
                            return meta.data[j];
                        }
                    }
                }
            }
        }
    },
    isClickOnYAxisLabel: function (mouseY, chartElement) {
        var vm = chartElement._view;
        var inRange = false;

        if (vm)
            inRange = (mouseY >= vm.y - vm.height / 2 && mouseY <= vm.y + vm.height / 2);
        return inRange;
    },
    activateTooltip: function (event) {
        var options = this.options || {},
            tooltip = this.tooltip,
            tooltipsOptions = options.tooltips,
            hoverOptions = options.hover,
            element = Util.chartElementCloseToMouseClick(this, event),
            helpers = Chart.helpers;

        if (element){
            this.tooltipActive = this.active = [element];

            if (tooltipsOptions.enabled || tooltipsOptions.custom) {
                tooltip.initialize();
                tooltip._active = this.tooltipActive;
                tooltip.update(true);
            }

            tooltip.pivot();
            if (!this.animating) {
                // If entering, leaving, or changing elements, animate the change via pivot
                if (!helpers.arrayEquals(this.active, this.lastActive) ||
                    !helpers.arrayEquals(this.tooltipActive, this.lastTooltipActive)) {

                    this.stop();

                    if (tooltipsOptions.enabled || tooltipsOptions.custom) {
                        tooltip.update(true);
                    }

                    // We only need to render at this point. Updating will cause scales to be
                    // recomputed generating flicker & using more memory than necessary.
                    this.render(hoverOptions.animationDuration, true);
                }
            }

            // Remember Last Actives
            this.lastActive = this.active;
            this.lastTooltipActive = this.tooltipActive;
            return this;
        }
    }
};