import {beforeAll, describe, expect, it} from 'vitest';

beforeAll(function () {
    loadSpApp('util.js');
});

// "MULTIPOLYGON (((x y, x y), (...)))" -> [[[x, y], ...], ...]
function parseMultiPolygon(wkt) {
    return wkt.replace(/^MULTIPOLYGON \(\(\(/, '').replace(/\)\)\)$/, '').split(')), ((').map(function (ring) {
        return ring.split(', ').map(function (pair) {
            return pair.split(' ').map(Number);
        });
    });
}

describe('Util.createCircle', function () {
    it('builds a closed ring of 51 points around the centre', function () {
        var polygons = parseMultiPolygon(Util.createCircle(-3.7, 40.4, 10000));
        var ring = polygons[0];

        expect(polygons.length).toBe(1);
        expect(ring.length).toBe(51);
        expect(ring[0]).toEqual(ring[50]);
        var lngs = ring.map(function (p) { return p[0]; });
        var lats = ring.map(function (p) { return p[1]; });
        expect((Math.min.apply(null, lngs) + Math.max.apply(null, lngs)) / 2).toBeCloseTo(-3.7, 3);
        expect((Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2).toBeCloseTo(40.4, 3);
        // 10 km is about 0.09 degrees of latitude
        expect(Math.max.apply(null, lats) - 40.4).toBeCloseTo(0.0898, 3);
    });

    it('splits a circle crossing the antimeridian into two polygons within -180..180', function () {
        var polygons = parseMultiPolygon(Util.createCircle(179.99, 0, 10000));

        expect(polygons.length).toBe(2);
        polygons.forEach(function (ring) {
            expect(ring[0]).toEqual(ring[ring.length - 1]);
            ring.forEach(function (p) {
                expect(p[0]).toBeGreaterThanOrEqual(-180);
                expect(p[0]).toBeLessThanOrEqual(180);
            });
        });
    });
});

describe('Util.computeOffset', function () {
    it('moves north by the given distance', function () {
        var p = Util.computeOffset(0, 0, 111319.49, 0);

        expect(p[0]).toBeCloseTo(0, 6);
        expect(p[1]).toBeCloseTo(1, 4);
    });

    it('moves east along the equator', function () {
        var p = Util.computeOffset(0, 10, 111319.49, 90);

        expect(p[0]).toBeCloseTo(11, 4);
        expect(p[1]).toBeCloseTo(0, 6);
    });
});

describe('Util.wrap', function () {
    it('leaves coordinates within -180..180 as a single polygon', function () {
        var coords = [[0, 0], [1, 0], [1, 1], [0, 0]];

        expect(Util.wrap(coords)).toEqual([coords]);
    });

    it('splits a polygon crossing +180 and shifts the part beyond it', function () {
        var polygons = Util.wrap([[170, 0], [190, 0], [190, 10], [170, 10], [170, 0]]);
        var lngs = [].concat.apply([], polygons).map(function (p) { return p[0]; });

        expect(polygons.length).toBe(2);
        expect(Math.min.apply(null, lngs)).toBe(-180);
        expect(Math.max.apply(null, lngs)).toBe(180);
        expect(lngs).toContain(-170);
        expect(lngs).toContain(170);
    });
});

describe('Util.wrappedToWkt', function () {
    it('writes one polygon per ring, with the points reversed', function () {
        expect(Util.wrappedToWkt([[[0, 0], [1, 0], [1, 1], [0, 0]], [[5, 5], [6, 5], [6, 6], [5, 5]]]))
            .toBe('MULTIPOLYGON (((0 0, 1 1, 1 0, 0 0)), ((5 5, 6 6, 6 5, 5 5)))');
    });

    // wrappedToWkt assigns `wkt` without declaring it, so it creates a global (and throws in strict mode).
    it.fails('does not leak a global variable', function () {
        delete globalThis.wkt;
        Util.wrappedToWkt([[[0, 0], [1, 0], [1, 1], [0, 0]]]);

        expect('wkt' in globalThis).toBe(false);
    });
});

describe('Util.notEmpty', function () {
    it.each([
        ['text', true],
        [0, true],
        [false, true],
        ['', false],
        [null, false],
        [undefined, false]
    ])('notEmpty(%j) is %s', function (value, expected) {
        expect(Util.notEmpty(value)).toBe(expected);
    });
});

describe('Util.deepCopy', function () {
    it('copies nested objects and arrays, skipping functions and keys starting with _', function () {
        var src = {a: 1, b: [1, {c: 2}], d: {e: 'x'}, _private: 3, f: function () {}};
        var copy = Util.deepCopy(src);

        expect(copy).toEqual({a: 1, b: [1, {c: 2}], d: {e: 'x'}});
        expect(copy.b).not.toBe(src.b);
        expect(copy.d).not.toBe(src.d);
        expect(Array.isArray(copy.b)).toBe(true);
    });

    // typeof null is 'object', so null values are copied as {}
    it.fails('keeps null values', function () {
        expect(Util.deepCopy({a: null})).toEqual({a: null});
    });
});

describe('Util chart helpers', function () {
    it('convertFacetDataToChartJSFormat collects labels and counts', function () {
        expect(Util.convertFacetDataToChartJSFormat([{displayname: 'A', count: 3}, {displayname: 'B', count: 5}]))
            .toEqual({labels: ['A', 'B'], data: [3, 5]});
    });

    it('getBarColour and getBorderColour reuse the target array', function () {
        var target = ['old'];
        var bars = Util.getBarColour([{name: 'a'}], target, function () { return 'FF0000'; });

        expect(bars).toBe(target);
        expect(bars).toEqual([{backgroundColor: '#FF0000', pointBackgroundColor: '#FF0000'}]);
        expect(Util.getBorderColour([{selected: true}, {}])).toEqual(['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0.1)']);
    });
});

describe('Util ranges', function () {
    it('splits an integer range into 7 intervals by default', function () {
        expect(Util.getRangeBetweenTwoInteger(1, 70)).toEqual([
            [1, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60], [61, 70]
        ]);
    });

    it('uses intervals of 1 when the integer range is small', function () {
        expect(Util.getRangeBetweenTwoInteger(1, 3)).toEqual([[1, 1], [2, 2], [3, 3]]);
    });

    it('uses $SH.numberOfIntervalsForRangeData when set', function () {
        $SH.numberOfIntervalsForRangeData = 2;

        expect(Util.getRangeBetweenTwoInteger(1, 10)).toEqual([[1, 5], [6, 10]]);
    });

    it('returns no intervals for an empty or invalid range', function () {
        expect(Util.getRangeBetweenTwoInteger(10, 1)).toEqual([]);
        expect(Util.getRangeBetweenTwoFloat(1, 1)).toEqual([]);
        expect(Util.getRangeBetweenTwoFloat(NaN, 1)).toEqual([]);
    });

    it('splits a float range into contiguous intervals ending at max', function () {
        var ranges = Util.getRangeBetweenTwoFloat(0, 7);

        expect(ranges.length).toBe(7);
        expect(ranges[0]).toEqual([0, 1]);
        expect(ranges[1][0]).toBeCloseTo(1.000001, 6);
        expect(ranges[6][1]).toBe(7);
    });

    it('getRanges picks the range type from the data type', function () {
        expect(Util.getRanges('int', 1, 3)).toEqual([[1, 1], [2, 2], [3, 3]]);
        expect(Util.getRanges('tdate', new Date('2000-06-01'), new Date('2002-06-01'))).toEqual([[2000, 2000], [2001, 2001], [2002, 2002]]);
        expect(Util.getRanges('string', 'a', 'b')).toEqual([]);
    });

    it('getRangeBetweenTwoNumber picks integer or float ranges', function () {
        expect(Util.getRangeBetweenTwoNumber(1, 3)).toEqual([[1, 1], [2, 2], [3, 3]]);
        expect(Util.getRangeBetweenTwoNumber(0, 0.7).length).toBe(7);
    });

    // numberOfIntervals is always replaced by $SH.numberOfIntervalsForRangeData || 7
    it.fails('honours the numberOfIntervals argument', function () {
        expect(Util.getRangeBetweenTwoInteger(1, 10, 2)).toEqual([[1, 5], [6, 10]]);
    });
});

describe('Util data types', function () {
    it.each([
        ['12', 'int'],
        ['1.5', 'tfloat'],
        ['2020-01-31', 'tdate'],
        ['Quercus', 'string']
    ])('inferDataTypeFromValue(%j) is %s', function (value, expected) {
        expect(Util.inferDataTypeFromValue(value)).toBe(expected);
    });

    // isNaN('') is false, so an empty value is taken as a number
    it.fails('does not infer a type for an empty value', function () {
        expect(Util.inferDataTypeFromValue('')).toBeUndefined();
    });

    it('castValue converts to the data type', function () {
        expect(Util.castValue('12', 'int')).toBe(12);
        expect(Util.castValue('1.5', 'tfloat')).toBe(1.5);
        expect(Util.castValue('2020-01-31', 'tdate')).toEqual(new Date('2020-01-31'));
        expect(Util.castValue(5, 'string')).toBe('5');
        expect(Util.castValue(null, 'string')).toBe('');
    });

    it('isFacetOfRangeDataType checks $SH.rangeDataTypes', function () {
        expect(Util.isFacetOfRangeDataType('int')).toBe(true);
        expect(Util.isFacetOfRangeDataType('string')).toBe(false);
    });
});
