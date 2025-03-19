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
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'BiocacheService';
                httpconfig.method = method;

                return httpconfig;
            };

            var indexFields;

            var thiz = {
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Ouput:
                 *  10
                 */
                speciesCount: function (query, fqs, httpconfig) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return $q.when(0)
                        }
                        return $http.get(query.bs + "/occurrence/facets?facets=names_and_lsid&flimit=0&q=" + response.qid + fqList, _httpDescription('speciesCount', httpconfig)).then(function (response) {
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                    if (fqs !== undefined) q = this.newLayerAddFq(query, fqs, '');
                    else q = query;

                    if (q == null) {
                        return $q.when(0)
                    } else {
                        return this.registerQuery(query).then(function (response) {
                            if (response == null) {
                                return $q.when(0)
                            } else {
                                return $http.get(query.bs + "/explore/endemic/speciescount/" + response.qid.replace("qid:", "") + "?facets=names_and_lsid", _httpDescription('speciesCountEndemic')).then(function (response) {
                                    return response.data.count;
                                });
                            }
                        })
                    }
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                        if (url == null) {
                            return $q.when('')
                        }
                        return $http.get(url, _httpDescription('speciesList', config)).then(function (response) {
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "https://biocache-ws.ala.org.au/ws/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&lists=true&q=Macropus&fq=geospatial_kosher:true"
                 */
                speciesListUrl: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return null
                        }
                        return query.bs + "/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&lists=true&q=" + response.qid + fqList;
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                    return this.speciesListEndemicUrl(query, fqs).then(function (url) {
                        if (url == null) {
                            return $q.when('')
                        }
                        return $http.get(url, _httpDescription('speciesListEndemic', config)).then(function (response) {
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                    if (fqs !== undefined) q = this.newLayerAddFq(query, fqs, '');
                    else q = query;

                    if (q == null) {
                        return $q.when(false)
                    } else {
                        return this.registerQuery(query).then(function (response) {
                            if (response == null) {
                                return $q.when(null)
                            } else {
                                return query.bs + "/explore/endemic/species/" + response.qid.replace("qid:", "") + ".csv?facets=names_and_lsid&lookup=true&count=true&lists=true";
                            }
                        })
                    }
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                        if (response == null) {
                            return $q.when([])
                        }

                        return $http.get(query.bs + "/webportal/dataProviders?q=" + response.qid + fqList, _httpDescription('dataProviderList')).then(function (response) {
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                        if (response == null) {
                            return $q.when(0)
                        }

                        var url = query.bs + "/occurrences/search?facet=false&pageSize=0&q=" + response.qid + fqList

                        return $http.get(url, _httpDescription('count')).then(function (response) {
                            if (response.data !== undefined && response.data.totalRecords !== undefined) {
                                return response.data.totalRecords ? response.data.totalRecords : 0
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "<span>Macropus</span>"
                 */
                queryTitle: function (query) {
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return $q.when("")
                        }

                        return $http.get(query.bs + "/webportal/params/details/" + response.qid.replace("qid:", ""), _httpDescription('queryTitle')).then(function (response) {
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 * - fqs
                 *  ["geospatial_kosher:true"]
                 *
                 * Output:
                 *  "http://biocache-ws.ala.org.au/ws/occurrences/search?q=Macropus&fq=geospatial_kosher:true&pageSize=1&offset=0&facet=false"
                 */
                constructSearchResultUrl: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false;
                    pageSize = pageSize === undefined ? 1 : pageSize;
                    offset = offset || 0;
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return null
                        }
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
                 * @param {String} facets (Optional) comma delimited facets (flimit is -1)
                 * @returns {Promise(Map)} search results
                 *
                 * @example
                 * Input:
                 * - query
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                searchForOccurrences: function (query, fqs, pageSize, offset, facets) {
                    facets = facets || "";
                    pageSize = pageSize === undefined ? 1 : pageSize;
                    offset = offset || 0;
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return {}
                        }
                        return $http.get(query.bs + "/occurrences/search?facets=" + facets + "&pageSize=" + pageSize + "&startIndex=" + offset + "&q=" + response.qid + fqList + '&sort=id', _httpDescription('searchForOccurrences')).then(function (response) {
                            if (response.data !== undefined) {
                                return response.data;
                            }
                        })
                    })
                },
                /**
                 * Facet search for dataResourceUid for a given userId.
                 *
                 * @param userId user's id used to upload data resources
                 * @param sandboxServiceUrl biocache-service URL for the sandbox
                 * @returns {*}
                 */
                userUploads: function (userId, sandboxServiceUrl) {
                    return $http.get(sandboxServiceUrl + "/occurrences/search?facets=data_resource_uid&flimit=-1&pageSize=0&q=user_id:" + userId, _httpDescription('userUploads')).then(function (response) {
                        if (response.data !== undefined) {
                            return response.data;
                        }
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                facet: function (facet, query, ranges) {
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return $q.when([])
                        }

                        ranges = (ranges || []).join(",");
                        ranges = ranges.length > 0 ? "," + ranges : "";
                        return $http.get(query.bs + "/webportal/legend?cm=" + facet + ranges + "&q=" + response.qid + "&type=application/json", _httpDescription('facet',
                            {headers: {Accept: "application/json"}})).then(function (response) {
                            $.map(response.data, function (v, k) {
                                if (ranges.length > 0) {
                                    // parse name for ranges: (optional '-')  + facet + '.[' + min + ' TO ' + max + ']'
                                    var match = ("" + v.name).match(/(-)*.*\[(.* TO .*)\]/);
                                    if (match && match.length === 3) {
                                        match[1] = match[1] || "";
                                        // add "exclude" to label for facets with '-'
                                        if (match[1] === '-' && match[2] === "* TO *") {
                                            match[1] = "";
                                            match[2] = $i18n(474, "Not supplied")
                                            // 'min' is for numerical sorting
                                            v.min = ''
                                        } else {
                                            // 'min' is for numerical sorting
                                            v.min = parseFloat(match[2].split(' ')[0])
                                        }
                                        v.displayname = match[1] + match[2];
                                    } else {
                                        v.displayname = v.name
                                    }
                                } else {
                                    v.displayname = BiocacheI18n.get(facet + '.' + v.name, v.name ? v.name : "")
                                }
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
                 * @param {String} prefixFilter (Optional) keywords
                 * @param {String} sortBy (Optional) sorted by field (default=count)
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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

                facetGeneral: function (facet, query, pageSize, offset, prefixFilter, sortBy, config) {
                    return this.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return $q.when([])
                        }

                        var url = query.bs + "/occurrence/facets?facets=" + facet + "&flimit=" + pageSize + "&foffset=" + offset + "&fsort=" + (sortBy ? sortBy:"count")  + "&q=" + response.qid;
                        if (prefixFilter !== undefined && prefixFilter.length > 0) url += "&fprefix=" + encodeURIComponent(prefixFilter);

                        return $http.get(url, _httpDescription('facetGeneral', config)).then(function (response) {
                            if (response.data && response.data[0] && response.data[0].fieldResult) {
                                $.map(response.data[0].fieldResult, function (v, k) {
                                    v.displaylabel = BiocacheI18n.get(facet + '.' + v.label, v.label ? v.label : "")
                                });
                                return response.data;
                            } else {
                                return []
                            }
                        });
                    })
                },
                facetDownload: function (facet) {
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
                            if (item !== undefined && item !== null) {
                                if (q.length > 0) q += '&fq=';
                                q += encodeURIComponent(item)
                            }
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * [[-180, -90], [180, 90]]
                 */
                bbox: function (query) {
                    return this.registerQuery(query).then(function (response) {
                        var bbox = [[-180, -90], [180, 90]]
                        if (response == null) {
                            return $q.when(bbox)
                        }
                        return $http.get(query.bs + "/webportal/bbox?q=" + response.qid + "&type=application/json", _httpDescription('bbox')).then(function (response) {
                            try {
                                var bb = response.data.split(",");
                                bbox = [[bb[1], bb[0]], [bb[3], bb[2]]];
                            } catch (exception) {
                                 console.warn("Error: Biocache/bbox query return an invalid BBox.")
                            } finally {
                                return bbox;
                            }
                        }).catch(function (error) {
                            console.warn("Biocache/bbox query returns an error!")
                            return bbox;
                        })
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "qid": 1234
                 *  }
                 */
                registerQuery: function (query) {
                    if (query.qid) {
                        return $q.when(query)
                    } else {
                        if (!(query.q instanceof Array)) {
                            query.q = [query.q]
                        }
                        var q = jQuery.extend([], query.q);
                        var fq;
                        if (query.q instanceof Array) {
                            q = query.q[0];
                            if (query.q.length > 1) {
                                fq = query.q.slice();
                                fq.splice(0, 1)
                            }
                        }
                        return this.registerParam(query.bs, q, fq, query.wkt, query.qualityProfile, query.disableQualityFilter, query.disableAllQualityFilters)
                    }
                },
                /**
                 * Get qid for a query
                 * @memberof BiocacheService
                 * @param {String} url biocache-service URL
                 * @param {List} query q and fq terms
                 * @param {List} fq (optional) one fq term
                 * @param {String} wkt (optional) WKT search value
                 * @param {String} qualityProfile (optional) quality profile
                 * @param {Array} disableQualityFilter (optional) quality filters to disable
                 * @param {Boolean} disableAllQualityFilters (optional) whether to disable all quality filters
                 * @returns {Promise(Integer)} qid
                 *
                 * @example
                 * Input:
                 * - bs
                 *  "https://biocache-ws.ala.org.au/ws"
                 * - q
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 * 1234
                 */
                registerParam: function (bs, q, fq, wkt, qualityProfile, disableQualityFilter, disableAllQualityFilters) {
                    var data = {q: q, bs: bs};
                    if ($SH.qc !== undefined && $SH.qc !== null && $SH.qc.length > 0) data.qc = $SH.qc;
                    if (fq !== undefined && fq !== null) data.fq = fq;
                    if (wkt !== undefined && wkt !== null && wkt.length > 0) data.wkt = wkt;
                    if (disableAllQualityFilters !== undefined && disableAllQualityFilters !== null) data.disableAllQualityFilters = disableAllQualityFilters;
                    if (qualityProfile !== undefined && qualityProfile !== null) data.qualityProfile = qualityProfile;
                    if (disableQualityFilter !== undefined && disableQualityFilter !== null) data.disableQualityFilter = disableQualityFilter;
                    return $http.post($SH.baseUrl + "/portal/q", data, _httpDescription('registerParam')).then(function (response) {
                        if (thiz.validateQID(response.data.qid)) {
                            //Need to return 'qid:xxxxxx'
                            return {qid: "qid:" + response.data.qid}
                        } else {
                            bootbox.alert($i18n(478, "Failed to register query. Try again later."));
                            return null
                        }
                    }, function (response) {
                        bootbox.alert($i18n(478, "Failed to register query. Try again later."));
                        return null
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
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
                        //Area created from layer: cl1023:Tas
                        if (area[0].q !== undefined && area[0].q.length > 0){
                            fq = fq.concat(area[0].q)
                        } else if (area[0].pid && (area[0].pid.length > 0) && area[0].pid.indexOf('~') < 0) {
                            //~ stands for mulitple pids
                            wkt = area[0].pid
                        } else if (area[0].wkt && (area[0].wkt.length) > 0) {
                            wkt = area[0].wkt
                        }
                    }
                    if (query.wkt !== undefined) wkt = query.wkt;

                    return this.registerLayer(query.bs, query.ws, fq, wkt, query.qualityProfile, query.disableQualityFilter, query.disableAllQualityFilters, newName)
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
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "name": ""
                 *  }
                 */
                newLayerAddFq: function (query, newFq, newName) {
                    var fqs;

                    if (query.q instanceof Array) fqs = $.merge([], query.q);
                    else fqs = [query.q];

                    if ((query.fq instanceof Array) && query.fq.length > 0) {
                        $.merge(fqs, query.fq)
                    }

                    if (newFq instanceof Array) {
                        $.merge(fqs, newFq)
                    } else if (newFq !== undefined) {
                        $.merge(fqs, [newFq])
                    }

                    return this.registerLayer(query.bs, query.ws, fqs, query.wkt, query.qualityProfile, query.disableQualityFilter, query.disableAllQualityFilters, newName).then(function (data) {
                        if (data == null) {
                            return null;
                        } else {
                            data.species_list = query.species_list

                            return data
                        }
                    })
                },
                /**
                 * Create a layer and register for qid
                 * @memberof BiocacheService
                 * @param {String} wsUrl biocache-service URL
                 * @param {String} hubUrl biocache-hub URL
                 * @param {List} fqs q and fq terms
                 * @param {String} wkt (optional) WKT
                 * @param {String} qualityProfile (optional) quality profile
                 * @param {Array} disableQualityFilter (optional) quality filters to disable
                 * @param {Boolean} disableAllQualityFilters (optional) whether to disable all quality filters
                 * @param {newName} name (optional) name for display
                 * @returns {Promise(Layer)}
                 *
                 * @example
                 * Input:
                 * - bs
                 *  "https://biocache-ws.ala.org.au/ws"
                 * - ws
                 *  "https://biocache.ala.org.au"
                 * - fq
                 *  ["taxon_name:Macropus"]
                 *
                 * Output:
                 *  {
                 *      "q": ["taxon_name:Macropus"],
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au",
                 *      "name": ""
                 *  }
                 */
                registerLayer: function (bs, ws, fq, wkt, qualityProfile, disableQualityFilter, disableAllQualityFilters, name) {
                    fq = fq.slice();
                    for (var i = 0; i < fq.length; i++) {
                        if (fq[i] === '*:*') fq.splice(i, 1)
                    }
                    var q = "*:*";
                    if (fq.length > 0) {
                        q = fq[0];
                        fq.splice(0, 1)
                    }
                    if (fq.length > 0 || (wkt !== undefined && wkt !== null && wkt.length > 0) || qualityProfile || disableQualityFilter || disableAllQualityFilters != null) {
                        return this.registerParam(bs, q, fq, wkt, qualityProfile, disableQualityFilter, disableAllQualityFilters).then(function (data) {
                            if (data != null) {
                                return {
                                    q: $.merge([q], fq),
                                    wkt: wkt,
                                    qid: data.qid, //qid has been reformated to "qid:xxxxxx"
                                    bs: bs,
                                    ws: ws,
                                    name: name
                                }
                            } else {
                                return null
                            }
                        })
                    } else {
                        var qc = [];
                        if ($SH.qc !== undefined && $SH.qc != null && $SH.qc.length > 0) qc = [$SH.qc];
                        var qid = q;
                        if (qc.length > 0) qid = "(" + q + ") AND " + qc[0]
                        return $q.when({
                            q: $.merge(q, qc), //fq.length == 0 so it is safe to use qc here
                            wkt: wkt,
                            qid: qid,
                            bs: bs,
                            ws: ws,
                            name: name
                        })
                    }
                },
                getIndexFields: function () {
                    // use static index fields before biocache-service index fields
                    if (indexFields) {
                        return $q.when(indexFields)
                    } else {
                        return $http.get($SH.biocacheServiceUrl + "/index/fields", _httpDescription('getIndexFields')).then(function (response) {
                            indexFields = response.data;
                            for (var i = 0; i < indexFields.length; i++) {
                                indexFields[i].displayName = indexFields[i].dwcTerm || indexFields[i].description || indexFields[i].name
                                if (indexFields[i].classs === undefined) {
                                    indexFields[i].classs = 'Other'
                                }
                                indexFields[i].class = indexFields[i].classs
                                indexFields[i].url = thiz.parseUrl(indexFields[i].info)
                                if (indexFields[i].url !== undefined) {
                                    indexFields[i].info = indexFields[i].info.replace(indexFields[i].url, '')
                                } else {
                                    indexFields[i].url = ''
                                }
                                if (indexFields[i].description === undefined) {
                                    indexFields[i].description = ''
                                }
                            }
                            return indexFields
                        });
                    }
                },
                parseUrl: function (info) {
                    if (info !== undefined) {
                        var match = info.match("\\bhttps?://[^\\b]+")
                        if (match) {
                            return match[0]
                        }
                    }
                    return undefined
                },
                /**
                 * Get the minimum and maxium value for a facet in a given query.
                 * @param query
                 * @param facet
                 * @returns {Promise(Object)}
                 * Input:
                 * - facet
                 *  {
                 *      name: "year"
                 *      ...
                 *  }
                 * - query
                 *  {
                 *      "q": "frog",
                 *      "bs": "https://biocache-ws.ala.org.au/ws",
                 *      "ws": "https://biocache.ala.org.au"
                 *  }
                 *
                 * Output:
                 * {
                 *      "min":1896.0,
                 *      "max":2019.0,
                 *      "label":"year"
                 * }
                 */
                getFacetMinMax: function(query, facet) {
                    var defaultValue = {min: undefined, max: undefined, label: facet.name};
                    if (Util.isFacetOfRangeDataType(facet.dataType)) {
                        return this.registerQuery(query).then(function (response) {
                            if (response == null) {
                                return $q.when(defaultValue)
                            }
                            return $http.get(query.bs + "/chart?q=" + response.qid + "&statType=min,max&stats=" + facet.name).then(function (response) {
                                return response.data.data && response.data.data[0] && response.data.data[0].data && response.data.data[0].data[0] || defaultValue;
                            });
                        });
                    } else {
                        return $q.when(defaultValue);
                    }
                },
                facetsToFq: function (facet, ignoreEnabledFlag) {
                    var fqs = [];
                    if (facet && facet.length > 0) {
                        for (var i in facet) {
                            var term = this.facetToFq(facet[i], ignoreEnabledFlag)
                            if (term && term.fq) {
                                fqs.push(term.fq)
                            }
                        }
                    }
                    return fqs;
                },
                facetToFq: function (facet, ignoreEnabledFlag) {
                    if (facet.data === undefined || (!ignoreEnabledFlag && !facet.enabled)) {
                        return {sum: 0, fq: undefined}
                    }
                    var sel = '';
                    var invert = false;
                    var count = 0;
                    var sum = 0;
                    // sum only applies to the single facet
                    for (var i = 0; i < facet.data.length; i++) {
                        if (facet.data[i].selected) {
                            var fq = facet.data[i].fq;
                            if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
                                invert = true
                            }
                            count++;
                            sum += facet.data[i].count;
                        }
                    }

                    if (count == 0 /*|| count == facet.data.length*/) {
                        return {sum: 0, fq: undefined}
                    } else {
                        if (count === 1) invert = false;
                        for (i = 0; i < facet.data.length; i++) {
                            if (facet.data[i].selected) {
                                var fq = facet.data[i].fq;

                                if (invert) {
                                    if (sel.length > 0) sel += " AND ";
                                    if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
                                        sel += fq.substring(1)
                                    } else {
                                        sel += '-' + fq
                                    }
                                } else {
                                    if (sel.length > 0) sel += " OR ";
                                    sel += fq
                                }
                            }
                        }
                        if (invert) {
                            sel = '-(' + sel + ')'
                        }
                        return {sum: sum, fq: sel}
                    }
                },
                downloadAsync:function(species, area, doiApplicationData) {
                    var params = {
                        hubName: $SH.doiHubName || "CSDM",
                        file: species.name,
                        mintDoi: true,
                        reasonTypeId: $SH.doiReasonTypeId || 13,
                        fileType: 'csv',
                        qa: 'none',
                        sourceTypeId: $SH.doiSourceTypeId || 10002,
                        email: $SH.userEmail,
                        emailTemplate: $SH.doiEmailTemplate || 'csdm',
                        doiDisplayTemplate: $SH.doiDisplayTemplate || 'csdm'
                    };

                    // This should be a POST but the data binding in biocache-service isn't setup to bind from the POST body.
                    for (var key in doiApplicationData) {
                        if (doiApplicationData.hasOwnProperty(key)) {
                            params["doiMetadata["+key+"]"] = doiApplicationData[key];
                        }
                    }

                    return thiz.newLayer(species, area, species.name).then(function (query) {
                        if (query == null) {
                            return $q.when(null)
                        }

                        var downloadUrl = $SH.biocacheServiceUrl + '/occurrences/offline/download';
                        params.q = query.qid;
                        params.searchUrl = $SH.biocacheServiceUrl + '/occurrences/search?q=' + query.qid;
                        return $http.get(downloadUrl, _httpDescription("offlineDownload", {params: params}));
                    });

                },

                validateQID: function(qid){
                    return !isNaN(qid)
                }

            };
            return thiz;
        }])
}(angular));
