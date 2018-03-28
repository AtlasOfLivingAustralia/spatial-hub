/**
 * Service for retrieving data from flickr image hosting site.
 */
(function (angular) {
    'use strict';
    angular.module('flickr-service', [])
        .factory("FlickrService", ["$http", '$cacheFactory', function ($http, $cacheFactory) {

            var flickrCache = $cacheFactory('FlickrServiceCache');

            return {
                getPhotos: function (bbox) {
                    var url = $SH.flickrUrl + $SH.flickrSearchPhotos
                        + '&api_key=' + $SH.flickrApiKey + '&extras=' + encodeURIComponent($SH.flickrExtra)
                        + '&tags=' + encodeURIComponent($SH.flickrTags)
                        + '&geo_context=' + encodeURIComponent($SH.flickrGeoContext)
                        + '&content_type='+ encodeURIComponent($SH.flickrContentType)
                        + '&format=json&nojsoncallback=1&text=landscape&per_page=50&bbox='; //??? 50 perpage ???

                    return $http.get(url + bbox).then(function (response) {
                        return response.data;
                    });
                },

                getLicenses: function () {
                    var licenseList = flickrCache.get('licenses');
                    if (licenseList) {
                        return licenseList;
                    }

                    var url = $SH.flickrUrl + $SH.flickrLicensesInfo
                        + '&api_key=' + $SH.flickrApiKey
                        + '&format=json&nojsoncallback=1';

                    return $http.get(url).then(function (response) {
                        console.debug(response);

                        if (response.data.licenses){
                            var result = {};
                            angular.forEach (response.data.licenses.license, function (lic) {
                                result[lic.id] = lic.name;
                            });

                            flickrCache.put('licenses', result);
                            return result;
                        }
                    });
                },

                getLicense: function (licenseId) {
                    var url = $SH.flickrUrl + $SH.flickrLicensesInfo
                        + '&api_key=' + $SH.flickrApiKey
                        + '&format=json&nojsoncallback=1';
                    $http.get(url, {cache: flickrCache}).then(function (response) {
                        var licenseName = '';
                        angular.forEach(response.data.licenses.license, function (lic) {
                            if (lic.id === licenseId) {
                                licenseName = lic.name;
                            }

                        });
                        console.log("licenseName: " + licenseName);
                        return licenseName;
                    });
                }

            };
        }])
}(angular));
