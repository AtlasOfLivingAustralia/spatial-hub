import {afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';

beforeAll(function () {
    loadSpApp('service/speciesAutoCompleteService.js');
    loadSpApp('directive/speciesAutoComplete.js');
});

describe('speciesAutoComplete directive', function () {
    var options, $rootScope, $q, onCustom, originalAutocomplete;

    beforeEach(function () {
        // jQuery UI is not loaded: capture the options the directive passes to it
        originalAutocomplete = $.fn.autocomplete;
        $.fn.autocomplete = function (opts) {
            options = opts;
            this.data('ui-autocomplete', {});
            return this;
        };

        angular.mock.module('species-auto-complete-directive', function ($provide) {
            $provide.value('LayoutService', {addToSave: function () {}});
            $provide.value('SpeciesAutoCompleteService', {
                search: function () {
                    return $q.when({
                        searchResults: {
                            results: [
                                {name: 'Vanessa atalanta', author: '(Linnaeus, 1758)', rank: 'species', commonNameSingle: 'Red Admiral', occCount: 12, guid: 'urn:1'},
                                {name: 'Plantae', rank: 'kingdom', occCount: 3, checklistsCount: 2, guid: 'urn:2'}
                            ]
                        }
                    });
                }
            });
        });

        angular.mock.inject(function ($compile, _$rootScope_, _$q_) {
            $rootScope = _$rootScope_;
            $q = _$q_;
            onCustom = function (selection) {
                $rootScope.selection = selection;
            };
            $rootScope.onCustom = function () {
                return onCustom;
            };
            $compile('<input species-auto-complete on-custom="onCustom()">')($rootScope);
        });
    });

    afterEach(function () {
        $.fn.autocomplete = originalAutocomplete;
    });

    function search(term) {
        var items;
        options.source({term: term}, function (result) {
            items = result;
        });
        $rootScope.$digest();
        return items;
    }

    it('lists the matching names with rank, common name and counts', function () {
        var items = search('vanessa');

        expect(items.map(function (i) { return i.label; })).toEqual(['Vanessa atalanta', 'Plantae']);
        expect(items[0].info).toBe('species Red Admiral - 12 found');
        expect(items[1].info).toBe('kingdom  - 3 found +2 checklist(s)');
    });

    it('selecting a name adds a species layer by lsid', function () {
        var item = search('vanessa')[0];

        options.select({}, {item: item});

        expect($rootScope.selection).toEqual({
            q: ['lsid:urn:1'], name: 'Vanessa atalanta', bs: 'https://biocache.test/ws', ws: 'https://biocache.test'
        });
    });
});
