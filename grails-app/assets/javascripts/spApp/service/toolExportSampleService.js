(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolExportSampleService
     * @description
     *   Client side tool to export points of occurrence layers
     */
    angular.module('tool-export-sample-service', [])
        .factory("ToolExportSampleService", ["$http", "$q", "MapService", "LayersService", "BiocacheService",
            function ($http, $q, MapService, LayersService, BiocacheService) {
                var annotateDatasetOnExport = $SH.annotateDatasetOnExport;

                var _this = {
                    species: undefined,
                    area: undefined,
                    layers: undefined,
                    annotation: undefined,

                    // Override text with view-config.json
                    spec: {
                        "input": [
                            {
                                "name": "area",
                                "description": $i18n(420,"Select area."),
                                "type": "area",
                                "constraints": {
                                    "min": 1,
                                    "max": 1,
                                    "optional": false,
                                    "defaultAreas": true
                                }
                            },
                            {
                                "name": "species",
                                "description": $i18n(416,"Select species."),
                                "type": "species",
                                "constraints": {
                                    "min": 1,
                                    "max": 1,
                                    "optional": false,
                                    "spatialValidity": true,
                                    "areaIncludes": false
                                }
                            },
                            {
                                "name": "layers",
                                "description": $i18n(414,"Select layers."),
                                "type": "layer",
                                "constraints": {
                                    "min": 1,
                                    "optional": true
                                }
                            }
                        ],
                        "description": "Export points."
                    },

                    execute: function (inputs) {
                        _this.area = inputs[0];
                        _this.species = inputs[1];
                        _this.layers = inputs[2];

                        if (annotateDatasetOnExport) {
                            _this.annotation = inputs[3];
                        }

                        return BiocacheService.newLayer(_this.species, _this.area, '').then(function (query) {
                            if (query == null) {
                                return $q.when({output: {}});
                            }

                            //include redirect to biocache-service/occurrences/search page
                            var sampleUrl = _this.species.ws + '/download/options1?searchParams=' +
                                encodeURIComponent('?q=' + encodeURIComponent(query.qid)) +
                                "&targetUri=/occurrences/search%3F&downloadType=records";

                            if (_this.layers && (_this.layers.length > 0)) {
                                var layers = '';
                                var layerNames = '';
                                $.map(_this.layers,
                                    function (v) {
                                        layers += (layers.length > 0 ? ',' : '') + v;
                                        layerNames += (layerNames.length > 0 ? ',' : '') + LayersService.getLayer(v).name;
                                    });

                                if (_this.species.species_list) layers += ',' + _this.species.species_list;

                                sampleUrl += '&layers=' + layers + '&customHeader=' + encodeURIComponent(layerNames) +
                                    "&layersServiceUrl=" + encodeURIComponent($SH.layersServiceUrl);
                            } else {
                                sampleUrl += '&layers=' + _this.species.species_list;
                            }

                            if (_this.annotation) {
                                sampleUrl += '&organisation=' + encodeURIComponent(_this.annotation.userOrganisation)
                                           + '&workflowAnnotation=' + encodeURIComponent(_this.annotation.workflowAnnotation)
                                           + '&dataSetAnnotation=' + encodeURIComponent(_this.annotation.dataSetAnnotation);
                            }

                            return $q.when({output: {0: {openUrl: sampleUrl}}});
                        });
                    }
                };

                // Datasets produced by the CSDM tool are required to be annotated to allow other researchers to
                // understand the workflow used to produce the data and decide whether it is relevant to them.
                if (annotateDatasetOnExport) {
                    _this.spec.input.push({
                        "name":"annotateWorkflow",
                        "description": "Annotate your workflow",
                        "type":"annotation",
                        "constraints":{
                            "optional":false
                        }
                    });
                }

                return _this;
            }])
}(angular));
