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
        .factory("ToolExportChecklistService", ["$http", "$q", "MapService", "BiocacheService", "LayoutService",
            function ($http, $q, MapService, BiocacheService, LayoutService) {
                return {

                    // Override text with view-config.json
                    spec: {
                        "input": [
                            {
                                "description": "Restrict to an area.",
                                "type": "area",
                                "constraints": {
                                    "min": 1,
                                    "max": 1,
                                    "defaultToWorld": false
                                }
                            },
                            {
                                "description": "Species options.",
                                "type": "speciesOptions",
                                "constraints": {
                                    "areaIncludes": false,
                                    "kosherIncudes": true,
                                    "endemicIncludes": true
                                }
                            }],
                        "description": "Export a species list."
                    },

                    downloading: false,
                    downloadSize: 0,

                    init: function () {
                        this.downloading = false;
                        this.downloadSize = 0;
                    },

                    execute: function (inputs) {
                        var area = inputs[0];
                        var speciesOptions = inputs[1];

                        var q = [];
                        var wkt = undefined;
                        if (area[0].q && (area[0].q.length > 0)) {
                            q = area[0].q
                        } else if (area[0].wkt.length > 0) {
                            q = ['*:*'];
                            wkt = area[0].wkt;
                        }

                        if (speciesOptions.spatiallyValid && speciesOptions.spatiallySuspect) q = q.concat(["geospatial_kosher:*"]);
                        else if (speciesOptions.spatiallyValid) q = q.concat(["geospatial_kosher:true"]);
                        else if (speciesOptions.spatiallySuspect) q = q.concat(["geospatial_kosher:false"]);
                        else q = q.concat(["-geospatial_kosher:*"]);

                        var query = BiocacheService.newQuery(q, '', wkt);

                        var future;

                        // TODO: enable species list preview
                        // if (showPreview) {
                        //     this.downloading = true;
                        //     this.cancelDownload = $q.defer();
                        //
                        //     var config = {
                        //         eventHandlers: {
                        //             progress: function (c) {
                        //                 this.downloadSize = c.loaded
                        //             }
                        //         },
                        //         timeout: this.cancelDownload.promise
                        //     };
                        //
                        //     future = speciesOptions.includeEndemic ? BiocacheService.speciesListEndemic(query, undefined, config) :
                        //         BiocacheService.speciesList(query, undefined, config);
                        //
                        //     future.then(function (data) {
                        //         this.cancelDownload.resolve();
                        //         this.openCsv(data, speciesOptions.includeEndemic);
                        //     })
                        // } else {
                        if (this.cancelDownload) this.cancelDownload.resolve();
                        future = this.endemic ? BiocacheService.speciesListEndemicUrl(query) :
                            BiocacheService.speciesListUrl(query);

                        future.then(function (url) {
                            Util.download(url);
                            this.close();
                        })
                        // }
                    },

                    openCsv: function (csv, endimic) {
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
                }
            }])
}(angular));
