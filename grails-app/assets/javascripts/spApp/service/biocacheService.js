(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name BiocacheService
     * @description
     *   Methods to interact with ALA biocache-service
     */
    angular.module('biocache-service', [])
        .factory("BiocacheService", ["$http", "$q", function ($http, $q) {
            return {
                /**
                 * Get the number of unique species (by facet names_and_lsid)
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(Integer)} Number of unique species
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Ouput:
                 *  10
                 */
                speciesCount: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrence/facets?facets=names_and_lsid&flimit=0&q=" + response.qid + fqList).then(function (response) {
                            if (response.data !== undefined && response.data.length > 0 && response.data[0].count !== undefined) {
                                return response.data[0].count;
                            } else {
                                return 0;
                            }
                        });
                    })
                },
                /**
                 * Get the number of unique endemic species (by facet names_and_lsid)
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(Integer)} Number of unique endemic species
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Ouput:
                 *  2
                 */
                speciesCountEndemic: function (query, fqs) {
                    var q;
                    if (fqs !== undefined) q = $scope.newLayerAddFq(query, fqs, '');
                    else q = query;

                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/explore/endemic/speciescount/" + q.qid + "?facets=names_and_lsid").then(function (response) {
                            return response.data.count;
                        });
                    })
                },
                /**
                 * Get species list CSV
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @param {Map} config (Optional) parameters for $http#get
                 * @returns {Promise(String)} Species list CSV
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 * - config
                 * Ouput:
                 *  "names_and_lsid","Species Name","Scientific Name Authorship","Taxon Rank","Kingdom","Phylum","Class","Order","Family","Genus","Vernacular Name","Number of records","Conservation","Invasive"
                 *  "Macropus giganteus|urn:lsid:biodiversity.org.au:afd.taxon:23f4784e-1116-482c-8e3e-b6b12733f588|Eastern Grey Kangaroo|Animalia|Macropodidae","Macropus giganteus","Shaw, 1790","species","ANIMALIA","CHORDATA","MAMMALIA","DIPROTODONTIA","MACROPODIDAE","Macropus","Eastern Grey Kangaroo","70654","South Australia : Conservation Status",""
                 *  "Osphranter rufus|urn:lsid:biodiversity.org.au:afd.taxon:e6aff6af-ff36-4ad5-95f2-2dfdcca8caff|Red Kangaroo|Animalia|Macropodidae","Osphranter rufus","(Desmarest, 1822)","species","ANIMALIA","CHORDATA","MAMMALIA","DIPROTODONTIA","MACROPODIDAE","Osphranter","Red Kangaroo","47542","Northern Territory : Conservation Status",""
                 */
                speciesList: function (query, fqs, config) {
                    return this.speciesListUrl(query, fqs).then(function (url) {
                        return $http.get(url, config).then(function (response) {
                            return response.data;
                        });
                    })
                },
                /**
                 * Build URL to GET species list CSV
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(String)} GET URL to species list CSV
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "http://biocache.ala.org.au/ws/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&lists=true&q=Macropus&fq=geospatial_kosher:true"
                 */
                speciesListUrl: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return query.bs + "/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&lists=true&q=" + query.qid + fqList;
                    })
                },
                /**
                 * Get the endemic species list as CSV
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(String)} CSV of endemic species list
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  ```
                 *  names_and_lsid    Species Name    Scientific Name Authorship    Taxon Rank    Kingdom    Phylum    Class    Order    Family    Genus    Vernacular Name    Number of records
                 *  Notamacropus agilis agilis|urn:lsid:biodiversity.org.au:afd.taxon:471127b3-a2c1-430e-931d-938cce4e58e8||Animalia|Macropodidae"    Notamacropus agilis agilis    (Gould, 1842)    subspecies    ANIMALIA    CHORDATA    MAMMALIA    DIPROTODONTIA    MACROPODIDAE    Notamacropus        130
                 *  Notamacropus agilis jardinii|urn:lsid:biodiversity.org.au:afd.taxon:bfe816bf-2b7e-47cb-87f8-ac386af751ab||Animalia|Macropodidae"    Notamacropus agilis jardinii    (De Vis, 1884)    subspecies    ANIMALIA    CHORDATA    MAMMALIA    DIPROTODONTIA    MACROPODIDAE    Notamacropus        451
                 *  ```
                 */
                speciesListEndemic: function (query, fqs, config) {
                    this.speciesListEndemicUrl(query, fqs).then(function (url) {
                        return $http.get(url, config).then(function (response) {
                            return response.data;
                        });
                    })
                },
                /**
                 * Build URL to GET endemic species list CSV
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(String)} GET URL to endemic species list CSV
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "http://biocache.ala.org.au/ws/explore/endemic/species/1234.csv?facets=names_and_lsid&lookup=true&count=true&lists=true"
                 */
                speciesListEndemicUrl: function (query, fqs) {
                    var q;
                    if (fqs !== undefined) q = $scope.newLayerAddFq(query, fqs, '');
                    else q = query;

                    return this.registerQuery(query).then(function (response) {
                        return query.bs + "/explore/endemic/species/" + q.qid + ".csv?facets=names_and_lsid&lookup=true&count=true&lists=true";
                    })
                },
                /**
                 * List data providers
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(List)} List of data proviers
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  []
                 */
                dataProviderList: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.jsonp(query.bs + "/webportal/dataProviders?q=" + response.qid + fqList).then(function (response) {
                            return response.data;
                        });
                    })
                },
                /**
                 * Get number of occurrences
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(Integer)} number of occurrences
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  500
                 */
                count: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrences/search?facet=false&pageSize=0&q=" + response.qid + fqList).then(function (response) {
                            if (response.data !== undefined && response.data.totalRecords !== undefined) {
                                return response.data.totalRecords;
                            }
                        });
                    })
                },
                /**
                 * Get the default query title
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @returns {Promise(String)} formatted biocache-service query title
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "<span>Macropus</span>"
                 */
                queryTitle: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/webportal/params/details/" + response.qid.replace("qid:", "") + fqList).then(function (response) {
                            if (response.data !== undefined && response.data.displayString !== undefined) {
                                //remove html wrapping from title
                                var div = document.createElement('div');
                                div.innerHTML = response.data.displayString;
                                return div.innerText;
                            } else {
                                return ""
                            }
                        });
                    })
                },
                /**
                 * General search query URL
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @param {Integer} pageSize (Optional) page size (default=1)
                 * @param {Integer} offset (Optional) offset (default=0)
                 * @param {Boolean} facet (Optional) include server default facets (default=false)
                 * @returns {Promise(String)} search URL
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "http://biocache.ala.org.au/ws/occurrences/search?q=Macropus&fq=geospatial_kosher:true&pageSize=1&offset=0&facet=false"
                 */
                constructSearchResultUrl: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false;
                    pageSize = pageSize === undefined ? 1 : pageSize;
                    offset = offset || 0;
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return query.ws + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset + "&q=" + response.qid + fqList
                    })
                },
                /**
                 * Get search query output
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @param {List} fqs (Optional) additional fq terms
                 * @param {Integer} pageSize (Optional) page size (default=1)
                 * @param {Integer} offset (Optional) offset (default=0)
                 * @param {Boolean} facet (Optional) include server default facets (default=false)
                 * @returns {Promise(Map)} search results
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - pageSize
                 *  0
                 *
                 * Output:
                 * {
                 *  "pageSize": 0,
                 *  "startIndex": 0,
                 *  "totalRecords": 736,
                 *  "sort": "score",
                 *  "dir": "asc",
                 *  "status": "OK",
                 *  "occurrences": [],
                 *  "facetResults": [],
                 *  "query": "?q=taxon_name%3AMacropus",
                 *  "urlParameters": "?q=taxon_name%3AMacropus",
                 *  "queryTitle": "Scientific name:Macropus",
                 *  "activeFacetMap": {}
                 *  }
                 */
                searchForOccurrences: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false;
                    pageSize = pageSize === undefined ? 1 : pageSize;
                    offset = offset || 0;
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset + "&q=" + response.qid + fqList).then(function (response) {
                            if (response.data !== undefined) {
                                return response.data;
                            }
                        });
                    })
                },
                /**
                 * Get facet list
                 * @memberof BiocacheService
                 * @param {String} facet Facet name
                 * @param {Query} query Biocache query
                 * @returns {Promise(List)} facets
                 *
                 * @example
                 * Input:
                 * - facet
                 *  "taxon_name"
                 * - query
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * [{
                    "name": "Macropus giganteus",
                    "count": 70654,
                    "colour": 0,
                    "fq": "taxon_name:\"Macropus giganteus\"",
                    "red": 51,
                    "blue": 204,
                    "green": 102,
                    "displayname": "Macropus giganteus"
                    },
                 {
                 "name": "Osphranter rufus",
                 "count": 47542,
                 "colour": 0,
                 "fq": "taxon_name:\"Osphranter rufus\"",
                  "red": 220,
                  "blue": 18,
                  "green": 57
                  }]
                 */
                facet: function (facet, query) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/webportal/legend?cm=" + facet + "&q=" + response.qid + "&type=application/json").then(function (response) {
                            $.map(response.data, function (v, k) {
                                v.displayname = Messages.get(facet + '.' + v.name, v.name ? v.name : "")
                            });
                            return response.data;
                        });
                    })
                },
                /**
                 * Get pageable facet list
                 * @memberof BiocacheService
                 * @param {String} facet Facet name
                 * @param {Query} query Biocache query
                 * @param {Integer} pageSize (Optional) page size (default=1)
                 * @param {Integer} offset (Optional) offset (default=0)
                 * @param {List} config (Optional) parameters for $http#get
                 * @returns {Promise(List)} facets
                 *
                 * @example
                 * Input:
                 * - facet
                 *  "taxon_name"
                 * - query
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * [{
                     "fieldName": "taxon_name",
                     "fieldResult":
                        [{
                         "label": "Macropus giganteus",
                         "count": 70654,
                         "fq": "taxon_name:\"Macropus giganteus\"",
                         "displaylabel": "Macropus giganteus"
                         },
                         {
                         "label": "Osphranter rufus",
                         "count": 47542,
                         "fq": "taxon_name:\"Osphranter rufus\"",
                         "displaylabel": "Osphranter rufus"
                         }]
                     }]
                 */
                facetGeneral: function (facet, query, pageSize, offset, config) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrence/facets?facets=" + facet + "&flimit=" + pageSize + "&foffset=" + offset + "&q=" + response.qid, config).then(function (response) {
                            if (response.data && response.data[0] && response.data[0].fieldResult) {
                                $.map(response.data[0].fieldResult, function (v, k) {
                                    v.displaylabel = Messages.get(facet + '.' + v.label, v.label ? v.label : "")
                                });
                                return response.data;
                            } else {
                                return []
                            }
                        });
                    })
                },
                facetDownload: function(facet){
                    return $SH.biocacheServiceUrl + '/occurrences/facets/download?facets=' + facet + '&count=true&lookup=true';
                },
                /**
                 * Encode and join a list of q and fq terms
                 *
                 * @memberof BiocacheService
                 * @param {List} list q and fqs
                 * @returns {String} query parameters as a string
                 */
                joinAndEncode: function (list) {
                    var q = '';
                    if (list instanceof Array) {
                        $.each(list, function (index, item) {
                            if (q.length > 0) q += '&fq=';
                            q += encodeURIComponent(item)
                        })
                    } else {
                        q = list
                    }
                    return q
                },
                /**
                 * Get query longitude and latitude bounding box
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @returns {Promise(List)} southWest corner and northEast corner as decimal latitude and longitude
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * [[-180, -90], [180, 90]]
                 */
                bbox: function (query) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/webportal/bbox?q=" + response.qid + "&type=application/json").then(function (response) {
                            var bb = response.data.split(",");
                            return [[bb[1], bb[0]], [bb[3], bb[2]]];
                        });
                    })
                },
                /**
                 * Shorten a query
                 * @memberof BiocacheService
                 * @param {Query} query Biocache query
                 * @returns {Promise(Query)} qid
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "qid": 1234
                 *  }
                 */
                registerQuery: function (query) {
                    if (query.qid) {
                        return $q.when(query)
                    } else {
                        var q = query.q;
                        var fq;
                        if (query.q instanceof Array) {
                            q = query.q[0];
                            if (query.q.length > 1) {
                                fq = query.q.slice();
                                fq.splice(0, 1)
                            }
                        }
                        var data = {q: q, bs: query.bs};
                        if (fq !== undefined && fq !== null) data.fq = fq;
                        if (query.wkt !== undefined && query.wkt !== null && query.wkt.length > 0) data.wkt = query.wkt;

                        //TODO: biocache wms request is failing for q=lsid:... when ENV contains a "sel" value. Do not set query.qid=data.q
                        // if(((data.fq === undefined || data.fq === null || data.fq.length === 0) &&
                        //     (data.wkt === undefined || data.wkt === null || data.wkt.length === 0))) {
                        //     query.qid = data.q;
                        //     return $q.when(query)
                        // } else {
                        return $http.post($SH.baseUrl + "/portal/q", data).then(function (response) {
                            query.qid = 'qid:' + response.data.qid;
                            return query
                        });
                        // }
                    }
                },
                /**
                 * Get qid for a query
                 * @memberof BiocacheService
                 * @param {String} url biocache-service URL
                 * @param {List} query q and fq terms
                 * @param {List} fq (optional) one fq term
                 * @param {String} wkt (optional) WKT search value
                 * @returns {Promise(Integer)} qid
                 *
                 * @example
                 * Input:
                 * - bs
                 *  "https://biocache.ala.org.au/ws"
                 * - q
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 * 1234
                 */
                registerParam: function (bs, q, fq, wkt) {
                    var data = {q: q, bs: bs};
                    if (fq !== undefined && fq !== null) data.fq = fq;
                    if (wkt !== undefined && wkt !== null && wkt.length > 0) data.wkt = wkt;
                    return $http.post($SH.baseUrl + "/portal/q", data).then(function (response) {
                        return response.data
                    });
                },
                /**
                 * Create a new #Query
                 * @memberof BiocacheService
                 * @param {List} query q and fq terms
                 * @param {name} name (optional) name for display
                 * @param {String} wkt (optional) WKT search value
                 * @returns {Query}
                 *
                 * @example
                 * Input:
                 * - q
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "name": ""
                 *  }
                 */
                newQuery: function (q, name, wkt) {
                    if (q === undefined) q = ["*:*"];
                    if (name === undefined) name = '';
                    return {
                        q: q,
                        wkt: wkt,
                        name: name,
                        bs: $SH.biocacheServiceUrl,
                        ws: $SH.biocacheUrl
                    }
                },
                /**
                 * Create a new #Layer suitable for adding to #MapService
                 * @memberof BiocacheService
                 * @param {List} query q and fq terms
                 * @param {Area} area (optional) area to limit the query
                 * @param {newName} name (optional) name for display
                 * @returns {Promise(Layer)}
                 *
                 * @example
                 * Input:
                 * - q
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "name": ""
                 *  }
                 */
                newLayer: function (query, area, newName) {

                    var fq = [];
                    if (query.q instanceof Array) {
                        fq = query.q
                    } else {
                        fq = [query.q]
                    }
                    if (query.fq !== undefined) {
                        fq = fq.concat(query.fq)
                    }
                    if (query.fqs !== undefined) {
                        fq = fq.concat(query.fqs)
                    }
                    var wkt = undefined;
                    if (area !== undefined && area instanceof Array && area.length > 0 && area[0] !== undefined) {
                        // if (area[0].q !== undefined) {
                        if (area[0].q && (area[0].q.length > 0)) {
                            fq = fq.concat(area[0].q)
                        } else if (area[0].wkt && (area[0].wkt.length) > 0) {
                            wkt = area[0].wkt
                        } else if (area[0].pid && (area[0].pid.length > 0)) {
                            wkt = area[0].pid
                        }
                    }
                    if (query.wkt !== undefined) wkt = query.wkt;

                    return this.registerLayer(query.bs, query.ws, fq, wkt, newName)
                },
                /**
                 * Create a new query #Layer
                 * @memberof BiocacheService
                 * @param {List} query q and fq terms
                 * @param {String} fq (optional) one fq term
                 * @param {newName} name (optional) name for display
                 * @returns {Promise(Layer)}
                 *
                 * @example
                 * Input:
                 * - q
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "name": ""
                 *  }
                 */
                newLayerAddFq: function (query, newFq, newName) {
                    var fq = [query.q].concat(query.fq).concat([newFq]);

                    return this.registerLayer(query.bs, query.ws, fq, query.wkt, newName)
                },
                /**
                 * Create a layer and register for qid
                 * @memberof BiocacheService
                 * @param {String} wsUrl biocache-service URL
                 * @param {String} hubUrl biocache-hub URL
                 * @param {List} fqs q and fq terms
                 * @param {String} wkt (optional) WKT
                 * @param {newName} name (optional) name for display
                 * @returns {Promise(Layer)}
                 *
                 * @example
                 * Input:
                 * - bs
                 *  "https://biocache.ala.org.au/ws"
                 * - ws
                 *  "https://biocache.ala.org.au"
                 * - fq
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "name": ""
                 *  }
                 */
                registerLayer: function (bs, ws, fq, wkt, name) {
                    fq = fq.slice();
                    for (var i = 0; i < fq.length; i++) {
                        if (fq[i] === '*:*') fq.splice(i, 1)
                    }
                    var q = "*:*";
                    if (fq.length > 0) {
                        q = fq[0];
                        fq.splice(0, 1)
                    }
                    if (fq.length > 0 || (wkt !== undefined && wkt !== null && wkt.length > 0)) {
                        return this.registerParam(bs, q, fq, wkt).then(function (data) {
                            return {
                                q: q,
                                fq: fq,
                                wkt: wkt,
                                qid: "qid:" + data.qid,
                                bs: bs,
                                ws: ws,
                                name: name
                            }
                        })
                    } else {
                        return $q.when({
                            q: q,
                            fq: fq,
                            wkt: wkt,
                            qid: q,
                            bs: bs,
                            ws: ws,
                            name: name
                        })
                    }
                }
            };
        }])
}(angular));
