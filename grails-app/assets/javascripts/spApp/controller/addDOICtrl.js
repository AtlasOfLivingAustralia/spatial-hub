(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AddDOICtrl
     * @description
     *   Add a DOI query to the map
     */
    angular.module('add-d-o-i-ctrl', ['doi-service'])
        .controller('AddDOICtrl', ['DoiService', 'MapService', 'UrlParamsService', '$sce', '$scope', 'data', function (DoiService, MapService, UrlParamsService, $sce, $scope, inputData) {
            inputData = inputData || {};
            $scope.searchText = inputData.searchText || "";
            $scope.selectedDOI = inputData.selectedDOI || undefined;
            $scope.selectedDOIData;
            $scope.loading = false;
            $scope.results = inputData.results || undefined;
            $scope.pagination = {
              total: 0,
              page: 1,
              offset: 0,
              max: 10
            };
            $scope.trustAsHtml = $sce.trustAsHtml;

            $scope.isDisabled = function () {
                return !$scope.selectedDOI;
            };

            $scope.clearSelection = function(){
                $scope.selectedDOIData = undefined;
                $scope.selectedDOI = undefined;
            };

            $scope.updatePaginationParams = function() {
                if ($scope.results && $scope.results.total) {
                    $scope.pagination.total = $scope.results.total;
                }

                if ($scope.pagination.page >= 1) {
                    $scope.pagination.offset = ($scope.pagination.page - 1) * $scope.pagination.max;
                }
            };

            $scope.fetchResultsForPage = function(){
                $scope.updatePaginationParams();
                $scope.getResults();
            };

            $scope.getQueryString = function(){
                if (!$scope.searchText || !$scope.searchText.trim()) {
                    return "*";
                } else {
                    var query = $scope.searchText,
                        queryWords = query.split(" "),
                        queryTemplate = "applicationMetadata.queryTitle:*SEARCHTERM* applicationMetadata.userOrganisation:SEARCHTERM* applicationMetadata.userDisplayName:SEARCHTERM*",
                        results = [];

                    for(var i =0; i < queryWords.length; i++) {
                        results.push(queryTemplate.replace(/SEARCHTERM/g, queryWords[i]));
                    }

                    return results.join(" ");
                }
            };

            $scope.searchForTerm = function(){
                $scope.clearSelection();
                $scope.getResults();
            };

            $scope.getResults = function () {
                $scope.results = undefined;
                $scope.loading = true;
                DoiService.search($scope.getQueryString(), $scope.pagination).then(function (data) {
                    $scope.results = data;
                    $scope.updatePaginationParams();
                }).finally(function () {
                    $scope.loading = false;
                });
            };

            $scope.getSelectedDOIData = function(){
              if ($scope.selectedDOI != undefined) {
                  if ($scope.results && $scope.results.searchResults && $scope.results.searchResults.length > 0) {
                      var results = $scope.results.searchResults;
                      for(var i=0; i< results.length; i++) {
                          if (results[i].id === $scope.selectedDOI)
                              return results[i];
                      }
                  }
              }
            };

            $scope.setSelectedDOIData = function () {
                $scope.selectedDOIData = $scope.getSelectedDOIData();
            };

            $scope.getDOIInfoString = function(doi) {
                doi = doi || $scope.selectedDOIData;
                if(doi)
                    return DoiService.buildInfoString(doi);
                else
                    return $i18n(462, "No dataset selected");
            };

            $scope.getDOIURL = function(doi){
                doi = doi || doi.selectedDOIData;
                if (doi)
                    return DoiService.getDOIURL(doi);
            };

            $scope.addDOIToMap = function(){
                $scope.$close();
                var doi = $scope.selectedDOIData;
                var url = DoiService.getQueryUrl(doi);

                if (url) {
                    var searchParams = UrlParamsService.parseSearchParams(url);
                    var queryParams = DoiService.buildQueryFromDoi(doi, searchParams);
                    var newName = $i18n(465, "DOI") + ": " + DoiService.buildShortInfo(doi);
                    if (queryParams.q && queryParams.q.length > 0) {
                        queryParams.qid = queryParams.q[0];
                        queryParams.q.splice(0,1);
                    }

                    queryParams.name = MapService.nextLayerName(newName);
                    queryParams.bs = $SH.biocacheServiceUrl;
                    queryParams.ws = $SH.biocacheUrl;
                    return MapService.add(queryParams).then(function () {
                        return true;
                    })
                }
                else {
                    // This shouldn't happen as dois without a URL will be filtered out by the search process.
                    bootbox.alert($i18n(472, "No data was able to be extracted from the selected DOI"));
                }
            };

            if (!$scope.results) {
                $scope.getResults();
            } else {
                $scope.setSelectedDOIData();
            }
        }])
}(angular));