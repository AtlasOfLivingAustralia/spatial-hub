(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolExportChecklistService
     * @description
     *   Client side tool to export list of species in an occurrence layer
     */
    angular.module('tool-export-checklist-service', [])
        .factory("ToolExportChecklistService", ["$http", "$q", "MapService", "BiocacheService", "LayoutService", "LayersService",
            function ($http, $q, MapService, BiocacheService, LayoutService, LayersService) {
                var _this = {
                    // Override text with view-config.json
                    spec: {
                        "input": [
                            {
                                "description": $i18n(543, "Restrict to an area."),
                                "type": "area",
                                "constraints": {
                                    "min": 1,
                                    "max": 1,
                                    "defaultToWorld": true
                                }
                            },
                            {
                                "description": $i18n(411,"Species options."),
                                "type": "speciesOptions",
                                "constraints": {
                                    "areaIncludes": false,
                                    "kosherIncudes": true,
                                    "endemicIncludes": true,
                                    "absentOption": true
                                }
                            }],
                        "description": $i18n(426,"Export a species list.")
                    },

                    downloading: false,
                    downloadSize: 0,

                    init: function () {
                        _this.downloading = false;
                        _this.downloadSize = 0;
                    },

                    execute: function (inputs) {
                        var area = inputs[0];
                        var speciesOptions = inputs[1];

                        var q = [];
                        var wkt = undefined;
                        if (area[0].q && (area[0].q.length > 0)) {
                            q = area[0].q
                        } else if (area[0].wkt && area[0].wkt.length > 0) {
                            q = ['*:*'];
                            wkt = area[0].wkt;
                        } else {
                            LayersService.getWkt(area[0].pid).then(function (wkt) {
                                inputs[0][0].wkt = wkt.data
                                _this.execute(inputs)
                            })
                            return
                        }

                        if (speciesOptions.spatiallyUnknown) {
                            if (speciesOptions.spatiallyValid && speciesOptions.spatiallySuspect) { /* do nothing */
                            } else if (speciesOptions.spatiallyValid) q.push('-geospatial_kosher:false');
                            else if (speciesOptions.spatiallySuspect) q.push('-geospatial_kosher:true');
                        } else {
                            if (speciesOptions.spatiallyValid && speciesOptions.spatiallySuspect) q.push('geospatial_kosher:*');
                            else if (speciesOptions.spatiallyValid) q.push('geospatial_kosher:true');
                            else if (speciesOptions.spatiallySuspect) q.push('geospatial_kosher:false');
                        }

                        if (!speciesOptions.includeAbsences) {
                            q.push($SH.fqExcludeAbsent)
                        }

                        var query = BiocacheService.newQuery(q, '', wkt);

                        var future;

                        var showPreview = false;
                        if (showPreview) {
                            _this.downloading = true;
                            _this.cancelDownload = $q.defer();

                            var config = {
                                eventHandlers: {
                                    progress: function (c) {
                                        _this.downloadSize = c.loaded
                                    }
                                },
                                timeout: _this.cancelDownload.promise
                            };

                            future = speciesOptions.includeEndemic ? BiocacheService.speciesListEndemic(query, undefined, config) :
                                BiocacheService.speciesList(query, undefined, config);

                            future.then(function (data) {
                                _this.openCsv(data, speciesOptions.includeEndemic);
                                _this.cancelDownload.resolve();
                            })
                        } else {
                            if (_this.cancelDownload) _this.cancelDownload.resolve();
                            future = _this.endemic ? BiocacheService.speciesListEndemicUrl(query) :
                                BiocacheService.speciesListUrl(query);

                            future.then(function (url) {
                                Util.download(url, 'speciesList.csv');
                            })
                        }
                    },

                    openCsv: function (csv, endemic) {
                        LayoutService.openModal('csv', {
                            title: (endemic ? $i18n(427, "Endemic") + ' ' : '') + $i18n(428, "Species List"),
                            csv: csv,
                            columnOrder: ['Species Name',
                            'Vernacular Name',
                            'Number of records',
                            'Conservation',
                            'Invasive'],
                            info: '',
                            filename: (endemic ? 'endemicS' : 's') + 'peciesList.csv',
                            display: {size: 'full'}
                        }, false)
                    }
                };

                return _this
            }])
}(angular));
