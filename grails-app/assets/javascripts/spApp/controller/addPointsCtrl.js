(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AddAPointsCtrl
     * @description
     *   Add points to the map using spatial-service's sandbox services
     */
    angular.module('add-points-ctrl', ['map-service', 'layers-service', 'predefined-areas-service', 'ngSanitize'])
        .controller('AddPointsCtrl', ['LayoutService', '$scope', 'MapService', '$timeout', 'LayersService',
            '$uibModalInstance', 'PredefinedAreasService', 'BiocacheService', 'LoggerService', 'data',
            function (LayoutService, $scope, MapService, $timeout, LayersService, $uibModalInstance, PredefinedAreasService, BiocacheService, LoggerService, inputData) {

                $scope.inputData = inputData || {}

                $scope.enablePriorUploads = $scope.inputData.enablePriorUploads !== undefined ? $scope.inputData.enablePriorUploads : true

                $scope.step = 'default';
                $scope.method = $scope.enablePriorUploads ? 'existing' : 'upload';

                $scope.errorMsg = '';

                $scope.datasetName = 'my dataset name';
                $scope.message = '';
                $scope.status = 'queued';
                $scope.statusUrl = '';
                $scope.dataResourceUid = '';

                $scope.maxFileSize = $SH.maxUploadSize;

                $scope.uploadingFile = false;
                $scope.uploadProgress = 0;

                $scope.file = null;

                $scope.uploadsList = [];
                $scope.searchUploads = '';
                $scope.sortType = 'date';
                $scope.sortReverse = true;

                $scope.instructions = $i18n(551, "Select a CSV or zipped CSV file.");

                LayoutService.addToSave($scope);

                $scope.init = function () {
                    // get a list of all prior uploads
                    if ($SH.userId) {
                        // find existing old sandbox uploads
                        if ($SH.sandboxServiceUrl && $SH.sandboxUrl) {
                            BiocacheService.userUploads($SH.userId, $SH.sandboxServiceUrl).then(function (data) {

                                if (data.totalRecords === 0) {
                                    return;
                                }

                                // add bs and ws to each item
                                var items = data.facetResults[0].fieldResult;
                                items.forEach(function (item) {
                                    item.bs = $SH.sandboxServiceUrl;
                                    item.ws = $SH.sandboxUrl;
                                    // get dataset_name and last_load_date
                                    BiocacheService.searchForOccurrences({
                                        qid: item.fq, // skip qid registration for this one-off query
                                        bs: item.bs,
                                        ws: item.ws
                                    }, [], 0, 0, 'dataset_name,last_processed_date').then(function (data) {
                                        if (data.totalRecords > 0) {
                                            // handle facets returning in a different order
                                            var order = data.facetResults[0].fieldName === 'dataset_name' ? 0 : 1;
                                            item.label = data.facetResults[order === 0 ? 0 : 1].fieldResult[0].label;
                                            item.date = data.facetResults[order === 0 ? 1 : 0].fieldResult[0].label;

                                            // format the date so that it is sortable. It is currently a string, e.g. "2010-11-01T00:00:00Z"
                                            item.date = new Date(item.date).toISOString().slice(0, 10);

                                            item.addedToMap = false;

                                            item.old = true;

                                            $scope.uploadsList.push(item);
                                        }
                                    });
                                });
                            });
                        }

                        // find existing spatial-service sandbox uploads
                        BiocacheService.userUploads($SH.userId, $SH.sandboxSpatialServiceUrl).then(function (data) {
                            if (data.totalRecords === 0) {
                                return;
                            }

                            // add bs and ws to each item
                            var items = data.facetResults[0].fieldResult;
                            items.forEach(function (item) {
                                item.bs = $SH.sandboxSpatialServiceUrl;
                                item.ws = $SH.sandboxSpatialUiUrl;
                                // get dataset_name and last_load_date
                                BiocacheService.searchForOccurrences({
                                    qid: item.fq, // skip qid registration for this one-off query
                                    bs: item.bs,
                                    ws: item.ws
                                }, [], 0, 0, 'datasetName,lastProcessedDate').then(function (data) {
                                    if (data.totalRecords > 0) {
                                        // handle facets returning in a different order
                                        var order = data.facetResults[0].fieldName === 'datasetName' ? 0 : 1;
                                        item.label = data.facetResults[order === 0 ? 0 : 1].fieldResult[0].label;
                                        item.date = data.facetResults[order === 0 ? 1 : 0].fieldResult[0].label;

                                        // format the date so that it is sortable. It is currently a string, e.g. "2010-11-01T00:00:00Z"
                                        item.date = new Date(item.date).toISOString().slice(0, 10);

                                        item.addedToMap = false;

                                        item.old = false;

                                        $scope.uploadsList.push(item);
                                    }
                                });
                            });
                        });
                    }
                }

                $scope.uploadFile = function (newFiles) {

                    if (newFiles == null || newFiles.length == 0) {
                        return
                    }

                    var file = newFiles[0]

                    if (file.$error) {
                        if (file.$errorMessages.maxSize) {
                            bootbox.alert($i18n(476, "The uploaded file is too large. Max file size:") + " " + Math.floor($scope.maxFileSize / 1024 / 1024) + "MB");
                            return
                        }
                    }

                    $scope.file = file;

                    // remove file extension and add date/time
                    var dateTime = new Date().toLocaleString();
                    var newName = file.name.replace(/\.[^/.]+$/, "") + " " + dateTime;
                    $scope.datasetName = newName.substring(0, 200); // limit to 200 characters
                };

                $scope.checkStatus = function() {
                    LayersService.getSandboxUploadStatus($scope.statusUrl).then(function (data) {
                        $scope.status = data.status;
                        $scope.message = data.message;

                        if ($scope.status === 'running') {
                            $timeout(function () {
                                $scope.checkStatus();
                            }, 3000); // wait 3 seconds before checking status
                        } else if ($scope.status === 'finished') {
                            // successful
                        }
                    }, function (error) {
                        if (!error.handled) {
                            $scope.status = 'error';
                            if (error.data.error) {
                                $scope.message = error.data.error;
                            } else {
                                $scope.message = "status code: " + error.status;
                            }
                        }
                    });
                }

                // currently removing the auto close step, so that the user can read the last status message
                $scope.addToMapAndClose = function () {
                    var q = {
                        q: ['dataResourceUid:"' + $scope.dataResourceUid + '"'],
                        name: $scope.datasetName,
                        bs: $SH.sandboxSpatialServiceUrl,
                        ws: $SH.sandboxSpatialUiUrl
                    };

                    if (!$scope.logged) {
                        $scope.logged = true

                        LoggerService.log("Create", "Points", {query: q, name: $scope.datasetName})
                    }

                    BiocacheService.newLayer(q, undefined, q.name).then(function (data) {
                        if (data != null) {
                            MapService.add(data);
                        }
                        $scope.$close();
                    });
                };

                $scope.ok = function () {
                    if ($scope.errorMsg || $scope.status === 'error') {
                        $scope.$close();
                    } else if ($scope.status === 'finished') {
                        if ($scope.inputData.setQ !== undefined) {
                            $scope.inputData.setQ({
                                q: ['data_resource_uid:"' + $scope.dataResourceUid + '"'],
                                name: $scope.datasetName,
                                bs: $SH.sandboxSpatialServiceUrl,
                                ws: $SH.sandboxSpatialUiUrl
                            });
                            $scope.$close();
                        } else {
                            $scope.addToMapAndClose();
                        }
                    } else {
                        $scope.step = 'uploading';
                        $scope.uploadingFile = true;

                        LayersService.uploadSandboxFile($scope.file, $scope.datasetName, $scope.file.name).then(function (response) {
                            if (response.data.error) {
                                $scope.status = 'error';
                                $scope.uploadingFile = false;
                                $scope.errorMsg = response.data.error;
                                return
                            } else {
                                $scope.status = 'starting';
                                $scope.statusUrl = response.data.statusUrl;
                                $scope.message = response.data.message;
                                $scope.dataResourceUid = response.data.dataResourceUid;

                                $timeout(function () {
                                    $scope.checkStatus();
                                }, 3000); // wait 3 seconds before checking status
                            }

                            $scope.uploadingFile = false;
                        }, function (error) {
                            $scope.errorMsg = "Unexpected error.";
                            if (!error.handled) {
                                if (error.status == 500) {
                                    $scope.errorMsg = "Unexpected error: the uploaded file may be broken or unrecognised.";
                                } else {
                                    if (error.data.error) {
                                        $scope.errorMsg = error.data.error;
                                    } else {
                                        $scope.errorMsg = $i18n(540,"An error occurred. Please try again and if the same error occurs, send an email to support@ala.org.au and include the URL to this page, the error message and what steps you performed that triggered this error.");
                                    }
                                }
                            }
                            $scope.uploadingFile = false;

                        }, function (evt) {
                            $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
                        });
                    }
                }

                $scope.isDisabled = function () {
                    if ($scope.step === 'uploading') {
                        return $scope.status !== 'finished' && $scope.status !== 'error'
                    } else {
                        return $scope.file == null || $scope.uploadingFile;
                    }
                }

                $scope.isLoggedIn = $scope.isLoggedIn = $SH.userId !== undefined && $SH.userId !== null && $SH.userId.length > 0;
                $scope.isNotLoggedIn = !$scope.isLoggedIn;

                $scope.addToMap = function (item) {
                    item.addedToMap = true;

                    BiocacheService.registerLayer(item.bs, item.ws, [item.fq], undefined, undefined, true, true, item.label).then(function (data) {
                        if (data != null) {
                            MapService.add(data);
                        }
                    });
                }

                $scope.delete = function (item) {
                    bootbox.confirm("Are you sure you want to delete \"" + item.label + "\?", function (result) {
                        if (result) {
                            // extract id from item.fq with the content `data_resource_uid:"39632cdd-4e1f-41d8-922a-c09a68270b2d"`
                            var dataResourceUid = item.fq.split('"')[1];

                            LayersService.deleteSandboxUpload(dataResourceUid).then(function (data) {
                                if (data != null) {
                                    $scope.uploadsList = $scope.uploadsList.filter(function (i) {
                                        return i.fq !== item.fq;
                                    });
                                }
                            });
                        }
                    });
                }

                $scope.download = function (item) {
                    var url = item.ws + "/occurrences/search?q=" + item.fq;
                    var a = document.createElement('a');
                    a.target = '_blank';
                    a.href = url;
                    a.click();
                }

                $scope.searchFilter = function(item) {
                    if (!$scope.searchUploads) {
                        return true;
                    }
                    var searchText = $scope.searchUploads.toLowerCase();
                    return item.label.toLowerCase().includes(searchText);
                };

                $scope.showFinished = function() {
                    return st
                }

                $scope.init();


            }])

}(angular));
