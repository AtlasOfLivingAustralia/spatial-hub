/**
 * Service for retrieving data from flickr image hosting site.
 */
(function (angular) {
    'use strict';
    angular.module('flickr-service', [])
        .factory("FlickrService", ["$http", '$cacheFactory', function ($http, $cacheFactory) {

            var flickrCache = $cacheFactory('FlickrServiceCache');

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'FlickrService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                getPhotos: function (bbox) {
                    var url = $SH.flickrUrl + $SH.flickrSearchPhotos
                        + '&api_key=' + $SH.flickrApiKey
                        + '&per_page=' + $SH.flickrNbrOfPhotosToDisplay
                        + '&format=json&nojsoncallback=1&bbox=' + bbox;
                    if ($SH.flickrExtra != '') url += '&extras=' + encodeURIComponent($SH.flickrExtra)
                    if ($SH.flickrTags != '') url += '&tags=' + encodeURIComponent($SH.flickrTags)
                    if ($SH.flickrGeoContext != '') url += '&geo_context=' + encodeURIComponent($SH.flickrGeoContext)
                    if ($SH.flickrContentType != '') url += '&content_type=' + encodeURIComponent($SH.flickrContentType)
                    if ($SH.flickrFilter != '') url += $SH.flickrFilter

                    return $http.get(url, _httpDescription('getPhotos')).then(function (response) {
                        return response.data;
                    });
                },

                getLicenses: function () {
                    var licenseList = flickrCache.get('licenses');
                    if (licenseList) {
                        return licenseList;
                    }

                    var result = {};
                    if ($SH.flickrLicensesData && $SH.flickrLicensesData.licenses && $SH.flickrLicensesData.licenses.license) {
                        angular.forEach($SH.flickrLicensesData.licenses.license, function (lic) {
                            result[lic.id] = lic.name;
                        });
                    }

                    flickrCache.put('licences', result);
                    return result;
                },

                getLicense: function (licenseId) {
                    var url = $SH.flickrUrl + $SH.flickrLicensesInfo
                        + '&api_key=' + $SH.flickrApiKey
                        + '&format=json&nojsoncallback=1';
                    $http.get(url, _httpDescription('getLicence', {cache: flickrCache})).then(function (response) {
                        var licenseName = '';
                        angular.forEach(response.data.licenses.license, function (lic) {
                            if (lic.id === licenseId) {
                                licenseName = lic.name;
                            }

                        });
                        return licenseName;
                    });
                }

            };
        }])
}(angular));
