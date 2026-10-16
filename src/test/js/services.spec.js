import {afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';

beforeAll(function () {
    loadSpApp('service/colourService.js');
    loadSpApp('service/i18nService.js');
    loadSpApp('service/layerDistancesService.js');
    loadSpApp('service/workflowService.js');
    loadSpApp('service/biocacheService.js');
});

function service(module, name, values) {
    angular.mock.module(module, function ($provide) {
        angular.forEach(values || {}, function (value, key) {
            $provide.value(key, value);
        });
    });
    var result;
    angular.mock.inject([name, function (s) {
        result = s;
    }]);
    return result;
}

describe('ColourService', function () {
    var colours;

    beforeEach(function () {
        colours = service('colour-service', 'ColourService');
    });

    it('cycles through its palette', function () {
        var first = colours.nextColour();

        expect(first).toBe('3366CC');
        expect(colours.nextColour()).toBe('DC3912');
        for (var i = 2; i < 31; i++) colours.nextColour();
        expect(colours.nextColour()).toBe(first);
    });

    it('parses hex colours', function () {
        expect(colours.parseHexToRGB('FF8000')).toEqual({red: 255, green: 128, blue: 0});
        expect(colours.getColour(31)).toEqual(colours.getColour(0));
    });

    it('clamps linear colours to the last one', function () {
        expect(colours.getLinearColour(0)).toEqual({red: 5, green: 6, blue: 223});
        expect(colours.getLinearColour(100)).toEqual(colours.getLinearColour(6));
    });
});

describe('i18nService', function () {
    var i18n, $httpBackend;

    beforeEach(function () {
        i18n = service('i18n-service', 'i18nService', {gMessages: {'1': 'one', 'two_words': 'Two words'}});
        angular.mock.inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('returns the message or the key itself', function () {
        expect(i18n.v(1)).toBe('one');
        expect(i18n.v('two words')).toBe('Two words');
        expect(i18n.v('missing')).toBe('missing');
    });

    it('set changes the message in the client only', function () {
        i18n.set('new key', 'value');

        expect(i18n.v('new key')).toBe('value');
    });

    it('commit saves the message on the server', function () {
        $httpBackend.expectPOST('https://hub.test/portal/i18n?lang=en&hub=default', {key: 'a_b', value: 'x'}).respond(200);

        i18n.commit('a b', 'x');
        $httpBackend.flush();

        expect(i18n.v('a b')).toBe('x');
    });

    it('handles keys with several spaces', function () {
        i18n.set('a b c', 'value');

        expect(i18n.map['a_b_c']).toBe('value');
    });
});

describe('LayerDistancesService', function () {
    it('looks the distance up in either order', function () {
        var distances = service('layer-distances-service', 'LayerDistancesService', {gLayerDistances: {'el1 el2': 0.5}});

        expect(distances.getDistance('el1', 'el2')).toBe(0.5);
        expect(distances.getDistance('el2', 'el1')).toBe(0.5);
        expect(distances.getDistance('el1', 'el3')).toBeUndefined();
    });
});

describe('WorkflowService', function () {
    var workflows, $httpBackend;

    beforeEach(function () {
        workflows = service('workflow-service', 'WorkflowService');
        angular.mock.inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('calls the hub workflow endpoints', function () {
        $httpBackend.expectPOST('https://hub.test/workflow/save', {description: 'w', isPublic: true, metadata: [], doi: false}).respond(200, {id: 1});
        $httpBackend.expectGET('https://hub.test/workflow/search?q=abc&start=0&limit=10').respond(200, []);
        $httpBackend.expectGET('https://hub.test/workflow/show/1?workflow=true').respond(200, {});
        $httpBackend.expectGET('https://hub.test/workflow/delete/1').respond(200, {});

        workflows.save('w', true, []);
        workflows.search('abc', 0, 10);
        workflows.get(1);
        workflows.delete(1);
        $httpBackend.flush();
    });

    it('initDescriptions parses the data and keeps a raw copy, cleanup removes it', function () {
        var workflow = [{description: 'a', data: '{"data":[{"description":"b","facet":{"fq":"x"}}]}'}];

        workflows.initDescriptions(workflow);

        expect(workflow[0].data.data[0].raw).toBe('{"fq":"x"}');
        expect(workflow[0].data.data[0].enabled).toBe(true);
        expect(JSON.parse(workflow[0].raw)).toEqual({data: [{description: 'b', facet: {fq: 'x'}}]});

        workflows.cleanup(workflow);

        expect(workflow[0].raw).toBeUndefined();
        expect(workflow[0].data.data[0]).toEqual({description: 'b', facet: {fq: 'x'}});
    });

    it('isValid needs a name and a description for every step and sub step', function () {
        var step = function (description, subDescription) {
            return {description: description, data: {data: [{description: subDescription}]}};
        };

        expect(workflows.isValid({name: 'w', workflow: [step('a', 'b')]})).toBe(true);
        expect(workflows.isValid({name: '', workflow: [step('a', 'b')]})).toBe(false);
        expect(workflows.isValid({name: 'w', workflow: [step(' ', 'b')]})).toBe(false);
        expect(workflows.isValid({name: 'w', workflow: [step('a', undefined)]})).toBe(false);
    });
});

describe('BiocacheService.joinAndEncode', function () {
    var biocache;

    beforeEach(function () {
        biocache = service('biocache-service', 'BiocacheService', {LayersService: {}, PredefinedAreasService: {}});
    });

    it('joins fq terms, encoding each one and skipping empty ones', function () {
        expect(biocache.joinAndEncode(['a:1', null, 'b:"x y"', undefined])).toBe('a%3A1&fq=b%3A%22x%20y%22');
        expect(biocache.joinAndEncode([])).toBe('');
    });

    it('returns a string unchanged', function () {
        expect(biocache.joinAndEncode('a:1')).toBe('a:1');
    });
});
