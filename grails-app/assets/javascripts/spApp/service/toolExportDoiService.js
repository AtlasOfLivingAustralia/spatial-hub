(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolExportDoiService
     * @description Performs a similar function to the ToolExportSampleService, but customised for the CSDM
     * requirements.  Initiates an offline download / DOI operation from the BioCache service.
     */
    angular.module('tool-export-doi-service', [])
        .factory("ToolExportDoiService", ["$http", "$q", "MapService", "LayersService", "BiocacheService", "DoiService", "WorkflowService",
            function ($http, $q, MapService, LayersService, BiocacheService, DoiService, WorkflowService) {

                var _this = {
                    species: undefined,
                    annotation: undefined,

                    // Override text with view-config.json
                    spec: {
                        "input": [
                            {
                                "name": "species",
                                "description": "Select mapped species.",
                                "type": "species",
                                "constraints": {
                                    "min": 1,
                                    "max": 1,
                                    "optional": false,
                                    "spatialValidity": false,
                                    "areaIncludes": false,
                                    "dateRangeOption": false,
                                    "lifeforms": false,
                                    "importList": false,
                                    "importPoints": false,
                                    "allSpecies": false,
                                    "searchSpecies": false

                                }
                            },
                            {
                                "name":"annotateWorkflow",
                                "description": "Annotate your workflow",
                                "type": "annotation",
                                "constraints": {
                                    "optional": false
                                }
                            }
                        ],
                        "description": "Export points."
                    },

                    refresh: function (inputs, specs) {
                        _this.species = inputs[0];
                        _this.annotation = inputs[1];

                        if (_this.species && _this.annotation && _this.species.layerUid) {
                            _this.annotation.layerUid = _this.species.layerUid
                        }
                    },

                    execute: function (inputs) {
                        _this.species = inputs[0];
                        _this.annotation = inputs[1];

                        WorkflowService.cleanup(_this.annotation.workflowAnnotation.workflow)

                        // workflow annotation can only be defined after the species layer is selected
                        return WorkflowService.save(_this.annotation.workflowAnnotation.name,
                            !_this.annotation.workflowAnnotation.private, _this.annotation.workflowAnnotation.workflow, true).then(function (response) {

                            _this.annotation.workflowUrl = response.data.data.url;

                            var promise = DoiService.mintDoi(_this.species, null, _this.annotation);
                            return promise.then(function (result) {
                                if (result != null) {
                                    bootbox.alert("Your export request has been submitted for processing.  Once the data has been DOI'd you will be sent an email with instructions on how to import your data into the modelling tool");
                                }
                                return {};
                            }, function (error) {
                                bootbox.alert("There was an error processing your export request.  Please try again or contact support at support@ala.org.au");
                                return {};
                            });
                        });
                    }
                };
                return _this;
            }])
}(angular));
