/**
 * Service for retrieving data from flickr image hosting site.
 */
(function (angular) {
    'use strict';
    angular.module('poi-service', [])
        .factory("PoiService", ["$http", '$cacheFactory', function ($http, $cacheFactory) {

            var poiCache = {};

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'PoiService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                getPhotos: function (bbox) {
                    var extents = bbox.split(',');
                    var url1 = $SH.biocollectUrl + '/site/search?max=' + $SH.flickrNbrOfPhotosToDisplay
                        + '&offset=&query=poi.type:photopoint'
                        + ' AND poi.geometry.decimalLatitude%3A%5B' + extents[1] + '%20TO%20' + extents[3] + '%5D'
                        + ' AND poi.geometry.decimalLongitude%3A%5B' + extents[0] + '%20TO%20' + extents[2] + '%5D';

                    // add items from cache before searching
                    var images = [];
                    for (var i in poiCache) {
                        var imgItem = poiCache[i];
                        if (Number(imgItem.longitude) <= Number(extents[2])
                            && Number(imgItem.longitude) >= Number(extents[0])
                            && Number(imgItem.latitude) <= Number(extents[3])
                            && Number(imgItem.latitude) >= Number(extents[1])) {
                            images.push(imgItem)
                        }
                    }

                    if ($SH.flickrNbrOfPhotosToDisplay > images.length) {
                        return $http.get(url1, _httpDescription('getPhotos', {withCredentials: true})).then(function (response1) {
                            var pois = {}
                            var url2 = $SH.biocollectUrl + '/site/getImages?id=';
                            var sites = '';
                            var list = response1.data.hits.hits;
                            for (var item in list) {
                                var siteId = list[item]._source.siteId;
                                if (!poiCache[siteId]) {
                                    sites += ',' + list[item]._source.siteId;
                                    for (var poi in list[item]._source.poi) {
                                        var poiItem = list[item]._source.poi[poi];
                                        pois[poiItem.poiId] = poiItem;
                                    }
                                    poiCache[siteId] = true
                                }
                            }
                            if (sites.length > 0) {
                                return $http.get(url2 + sites, _httpDescription('getPhotos', {withCredentials: true})).then(function (response2) {
                                    for (var poi in response2.data) {
                                        for (var doc in response2.data[poi].poi) {
                                            poiItem = response2.data[poi].poi[doc]
                                            for (var img in poiItem.docs.documents) {
                                                var imgItem = poiItem.docs.documents[img];
                                                // repeat the site filter because it can return invalid pois when there are >1 pois at a site
                                                if (imgItem.role === 'photoPoint' && pois[poiItem.poiId] && pois[poiItem.poiId].geometry) {
                                                    imgItem.longitude = pois[poiItem.poiId].geometry.decimalLongitude;
                                                    imgItem.latitude = pois[poiItem.poiId].geometry.decimalLatitude;
                                                    if (Number(imgItem.longitude) <= Number(extents[2])
                                                        && Number(imgItem.longitude) >= Number(extents[0])
                                                        && Number(imgItem.latitude) <= Number(extents[3])
                                                        && Number(imgItem.latitude) >= Number(extents[1])) {
                                                        images.push(imgItem)
                                                    }
                                                    poiCache[poiItem.poiId] = imgItem;
                                                }
                                            }
                                        }
                                    }

                                    return images;
                                });
                            } else {
                                return images;
                            }
                        });
                    }
                }
            };
        }])
}(angular));
