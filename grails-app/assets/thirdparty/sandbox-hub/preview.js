(function sandboxPreview() {
    "use strict";
    var preview = angular.module('ala.sandbox.preview', ['ui.bootstrap', 'ngFileUpload']);

    preview.factory('previewService', ['$http', '$httpParamSerializer', 'sandboxConfig', 'Upload',
        function ($http, $httpParamSerializer, sandboxConfig, Upload) {
            function randomString(length) {
                var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

                if (! length) {
                    length = Math.floor(Math.random() * chars.length);
                }

                var str = '';
                for (var i = 0; i < length; i++) {
                    str += chars[Math.floor(Math.random() * chars.length)];
                }
                return str;
            }

            return {
                uploadCsvFile: function(file) {
                    file.upload = Upload.upload({
                        url: sandboxConfig.uploadCsvUrl,
                        data: { myFile: file },
                        withCredentials: true
                    });
                    return file.upload;
                },
                parseColumns : function(text, fileId, firstLineIsData) {
                    var data = $httpParamSerializer({ rawData: text, firstLineIsData: firstLineIsData, fileId: fileId });
                    return $http.post(sandboxConfig.parseColumnsUrl, data, { withCredentials: true,  headers: { 'Content-Type': 'application/x-www-form-urlencoded'}});
                },
                processData: function(columnHeaders, firstLineIsData, text, fileId, dataResourceUid) {
                    var data = $httpParamSerializer({ headers: columnHeaders, firstLineIsData: firstLineIsData, rawData: text, fileId: fileId, dataResourceUid: dataResourceUid });
                    return $http.post(sandboxConfig.processDataUrl, data, { withCredentials: true,  headers: { 'Content-Type': 'application/x-www-form-urlencoded'}});
                },
                uploadToSandbox: function(columnHeaders, firstLineIsData, text, fileId, datasetName, existingUid, customIndexedFields) {
                    var data = $httpParamSerializer({ headers: columnHeaders, firstLineIsData: firstLineIsData, rawData: text, fileId: fileId, datasetName: datasetName, customIndexedFields: customIndexedFields, dataResourceUid: existingUid });
                    return $http.post(sandboxConfig.uploadToSandboxUrl, data, { withCredentials: true,  headers: { 'Content-Type': 'application/x-www-form-urlencoded'} });
                },
                pollUploadStatus: function(uid) {
                    return $http.get(sandboxConfig.uploadStatusUrl, { withCredentials: true,  params: { uid: uid , random: randomString(10)}, ignoreLoadingBar: true });
                },
                autocompleteColumnHeaders: function(header) {
                    return $http.get(sandboxConfig.autocompleteColumnHeadersUrl, { withCredentials: true,  params: { q: header }, ignoreLoadingBar: true });
                },
                reload: function(uid) {
                    return $http.get(sandboxConfig.reloadDataResourceUrl, { withCredentials: true,  params: {dataResourceUid: uid} }).then(
                        function (response) { return response.data; },
                        function (error) {
                            if (error.status == 404) return { error: true, notFound: true };
                            else return { error: true, notFound: false };
                        }
                    );
                }
            };
        }]);

    preview.controller("PreviewCtrl", ['$log', '$scope', '$timeout', '$uibModal', '$window', 'existing', 'previewService', 'sandboxConfig',
        function($log, $scope, $timeout, $uibModal, $window, existing, previewService, sandboxConfig) {
            var self = this;
            self.sandboxConfig = sandboxConfig;

            var EMPTY_EXISTING = {
                name: null,
                uid: null
            };

            // Default init. This will enable adding watch on these properties.
            self.dataResourceUid = null;
            self.datasetName = 'My test dataset';

            if (!existing || existing.error) {
                self.existing = angular.copy(EMPTY_EXISTING);
                self.datasetName = 'My test dataset';
                self.dataResourceUid = null;
            } else {
                self.existing = existing;
                self.dataResourceUid = existing.uid;
                self.datasetName = existing.name;
            }

            self.firstLineOptions = [
                // {value: '', label: 'Autodetect' },
                {value: true, label: 'Data'},
                {value: false, label: 'Column headers'}
            ];

            self.fileId = null;
            self.fileName = null;
            self.uploadingCsv = false;

            self.text = '';
            self.file = null;
            self.parsing = false;
            self.preview = {
                firstLineIsData: null
            };
            self.previewLoaded = false;
            self.previewError = false;

            self.processingData = false;
            self.processedData = {};
            self.procssedDataError = true;


            self.uploading = false;
            self.uploadPercent = 0;
            self.uploadFailed = false;
            self.uploadStatus = ''

            function reset() {
                self.preview = {
                    firstLineIsData: null
                };
                self.previewLoaded = false;

                self.processingData = false;
                self.processedData = {};
                self.previewError = false;
                self.processedDataError = false;

                self.uploading = false;
                self.uploadPercent = 0;
                self.uploadFailed = false;
                self.uploadStatus = ''
            }

            self.uploadCsvFile = function() {
                reset();
                self.uploadingCsv = true;
                var p = previewService.uploadCsvFile(self.file);
                p.then(function (response) {
                    self.text = ''; // blank out text since we have a file.
                    angular.extend(self, response.data);
                    self.parseColumns();
                }, function(error) {
                    $log.error("File upload failed", error);
                })['finally'](function() {
                    self.uploadingCsv = false;
                });
            };

            self.parseColumns = function() {
                reset();
                self.reparseColumns();
            };

            self.reparseColumns = function() {
                if (self.text || self.fileId) {
                    self.parsing = true;
                    var p = previewService.parseColumns(self.text, self.fileId, self.preview.firstLineIsData);
                    p.then(function(response) {
                        angular.extend(self.preview, response.data);
                        self.previewLoaded = true;
                        self.getProcessedData();
                    }, function(error) {
                        $log.error("Error getting parsed columns", error);
                        self.previewError = true;
                    }, function(notify) {
                        $log.debug('notify parseColumns', notify);
                    })['finally'](function() {
                        self.parsing = false;
                    });
                }
            };

            function columnHeaders() {
                return _.pluck(arguments.length ? arguments[0] : self.preview.headers, 'header');
            }

            self.getProcessedData = function() {
                self.processingData = true;
                self.processedDataError = false;
                self.processedData = {};
                var p = previewService.processData(columnHeaders(), self.preview.firstLineIsData, self.text, self.fileId, self.dataResourceUid);
                p.then(function(response) {
                    _.each(response.data.processedRecords, function(e,i) { e.isOpen = false; });
                    angular.extend(self.processedData, response.data);
                }, function(error) {
                    $log.error("Error getting processed data", error);
                    self.processedDataError = true;
                }, function(notify) {
                    $log.debug('notify processData', notify);
                })['finally'](function() {
                    self.processingData = false;
                });
            };

            self.uploadToSandbox = function() {
                $log.info('Uploading to sandbox...');

                var disableUpload = false;
                for (var i=0; i< self.processedData.processedRecords.length; i++) {
                    if (self.processedData.processedRecords[i].validationMessages && self.processedData.processedRecords[i].validationMessages.length > 0) {
                        disableUpload = true;
                        alert ("You cannot upload invalid data. Please fix the errors highlighted in the validation section for the record.");
                        break;
                    }
                }

                if (!disableUpload) {
                    self.uploading = true;
                    self.uploadPercent = 0;
                    self.uploadFailed = false;
                    var p = previewService.uploadToSandbox(columnHeaders(), self.preview.firstLineIsData, self.text, self.fileId, self.datasetName, self.existing.uid, null);
                    p.then(function (response) {
                        self.dataResourceUid = response.data.uid;
                        updateStatusPolling();
                    }, function (error) {
                        if (error.status == 401) {
                            var isAuthenticated = error.headers("X-Sandbox-Authenticated");
                            var isAuthorised = error.headers("X-Sandbox-Authorised");
                            var template = !isAuthenticated ? 'notAuthenticatedModal.html' : 'notAuthorisedModal.html';
                            $uibModal.open({
                                templateUrl: template
                            });
                        } else {
                            $window.alert('Fail:' + error.status);
                        }
                    });
                }
            };

            function updateStatusPolling() {

                var p  = previewService.pollUploadStatus(self.dataResourceUid);

                p.then(function (response) {
                    var data = response.data;
                    $log.info("Retrieving status...." + data.status + ", percentage: " + data.percentage);
                    self.uploadStatus = data.status;
                    self.uploadDescription = data.description;
                    if (data.status == "COMPLETE") {
                        self.uploadPercent = 100;
                    } else if (data.status == "FAILED") {
                        self.uploadFailed = true;
                    } else {
                        self.uploadPercent = data.percentage;
                        $timeout(updateStatusPolling, 1000);
                    }
                });
            }

            self.checkDataLabel = function() {
                return self.parsing ? 'Loading...' : 'Check data';
            };

            self.uploadCsvStatusLabel = function() {
                return self.uploadingCsv ? 'Uploading...' : self.parsing ? 'Loading...' : 'Upload file';
            };

            self.reprocessDataLabel = function() {
                return self.parsing ? 'Processing...' : self.processingData ? 'Reprocessing...' : 'Reprocess data';
            };

            self.isHeaderUnknown = function(header) {
                var searchString = 'Unknown ';
                return header.substr(0, searchString.length) === searchString;
            };

            self.processedRecordFieldClass = function(field) {
                return field.name == "informationWithheld" || field.name == "dataGeneralizations" ? "sensitiveField" : "fieldName";
            };

            self.processedRecordChangedClass = function(field) {
                return field.processed != field.raw && field.processed != null ? 'changedValue' : 'originalConfirmed';
            };

            self.isMissingUsefulColumns = false;

            self.missingUsefulColumnsMessage = '';

            // explicit watch to prevent multiple watches on a function that iterates the headers.
            $scope.$watch(function() {
                return self.preview.headers;
            }, function (newValue, oldValue) {
                var missingColumns = self.missingUsefulColumns(newValue);
                self.isMissingUsefulColumns = missingColumns.length != 0;
                self.missingUsefulColumnsMessage = missingColumns.join(', ');
            }, true);

            self.missingUsefulColumns = function(headersStruct) {
                var headers = columnHeaders(headersStruct);
                var missing = _.difference(['decimalLatitude', 'decimalLongitude', 'eventDate'], headers);
                if (!(_.contains(headers, 'scientificName') || _.contains(headers, 'vernacularName'))) {
                    missing.push("scientificName or vernacularName");
                }
                return missing;
            };

            self.uploadToSandboxLabel = function() {
                return self.existing.uid ? 'Reload ' + self.existing.uid + ': ' + self.datasetName : 'Upload your data';
            };

            self.countByQaStatus = function(processedRecord, status) {
                var count = 0;
                angular.forEach(processedRecord.assertions, function (it) {
                    if(it.qaStatus == status){
                        count++
                    }
                });
                return count;
            };

            self.unlinkFromExisting = function() {
                self.existing = angular.copy(EMPTY_EXISTING);
                self.dataResourceUid = null;
            };

            self.processedRecordHeader = function(processedRecord) {
                var scientificName = _.find(processedRecord.values, function(v) { return v.name == 'scientificName' });
                var eventDate = _.find(processedRecord.values, function(v) { return v.name == 'eventDate' });
                var catNo = _.find(processedRecord.values, function(v) { return v.name == 'catalogNumber' });
                var title = [];
                if (catNo) {
                    title.push(catNo.camelCaseName + ' ' + (catNo.formattedProcessed || catNo.raw));
                }
                if (scientificName) {
                    title.push(scientificName.camelCaseName + ' ' + (scientificName.formattedProcessed || scientificName.raw));
                }
                if (eventDate) {
                    title.push(eventDate.camelCaseName + ' ' + (eventDate.formattedProcessed || eventDate.raw));
                }
                return title.join(', ')
            };

            self.autocompleteColumnHeaders = function(header) {
                return previewService.autocompleteColumnHeaders(header)
                    .then(function(response) {
                        return response.data;
                    });
            };

            // if the column header changes, mark it as unknown.
            self.headerChanged = function(header) {
                if (angular.isUndefined(header.originalKnown)) {
                    header.originalKnown = header.known;
                }
                header.known = false;
            };

            // but then if the column header is selected from the autocomplete list, mark it known
            self.headerValueSelected = function(header) {
                header.known = true;
            };
        }]);
})();