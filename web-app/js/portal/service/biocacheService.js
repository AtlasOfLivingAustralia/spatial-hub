(function (angular) {
    'use strict';
    angular.module('biocache-service', [])
        .factory("BiocacheService", ["$http", "$q", function ($http, $q) {
            return {
                speciesCount: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
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
                speciesList: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&q=" + query.qid + fqList).then(function (response) {
                            return response.data;
                        });
                    })
                },
                dataProviderList: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return this.registerQuery(query).then(function (response) {
                        return $http.jsonp(query.bs + "/webportal/dataProviders?q=" + response.qid + fqList).then(function (response) {
                            return response.data;
                        });
                    })
                },
                count: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrences/search?facet=false&pageSize=0&q=" + response.qid + fqList).then(function (response) {
                            if (response.data !== undefined && response.data.totalRecords !== undefined) {
                                return response.data.totalRecords;
                            }
                        });
                    })
                },
                queryTitle: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return $http.get(query.bs + "/occurrences/search?facet=false&pageSize=0&q=" + this.getQString(query) + fqList).then(function (response) {
                        if (response.data !== undefined && response.data.queryTitle !== undefined) {
                            return response.data.queryTitle
                        } else {
                            return ""
                        }
                    });
                },
                constructSearchResultUrl: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false
                    pageSize = pageSize === undefined ? 1 : pageSize
                    offset = offset || 0
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return this.registerQuery(query).then(function (response) {
                        return query.ws + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset + "&q=" + response.qid + fqList
                    })
                },
                searchForOccurrences: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false
                    pageSize = pageSize === undefined ? 1 : pageSize
                    offset = offset || 0
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset + "&q=" + response.qid + fqList).then(function (response) {
                            if (response.data !== undefined) {
                                return response.data;
                            }
                        });
                    })
                },
                facet: function (facet, query) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/webportal/legend?cm=" + facet + "&q=" + response.qid + "&type=application/json").then(function (response) {
                            return response.data;
                        });
                    })
                },
                facetGeneral: function (facet, query, pageSize, offset) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrence/facets?facets=" + facet + "&flimit=" + pageSize + "&foffset=" + offset + "&q=" + reqponse.qid).then(function (response) {
                            return response.data;
                        });
                    })
                },
                joinAndEncode: function(list) {
                    var q = ''
                    if (list instanceof Array) {
                        $.each(list, function (index, item) {
                            if (q.length > 0) q += '&fq='
                            q += encodeURIComponent(item)
                        })
                    } else {
                        q = list
                    }
                    return q
                },
                bbox: function (query) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/webportal/bbox?q=" + response.qid + "&type=application/json").then(function (response) {
                            var bb = response.data.split(",")
                            return [[bb[1], bb[0]], [bb[3], bb[2]]];
                        });
                    })
                },
                registerQuery: function (query) {
                    if (query.qid) {
                        return $q.when(query)
                    } else {
                        var q = query.q[0]
                        var fq
                        if (query.q.length > 1) {
                            fq = query.q.slice()
                            fq.splice(0, 1)
                        }
                        var data = {q: q, bs: query.bs}
                        if (fq !== undefined && fq != null) data.fq = fq
                        if (query.wkt !== undefined && query.wkt != null && query.wkt.length > 0) data.wkt = query.wkt
                        return $http.post("portal/q", data).then(function (response) {
                            query.qid = 'qid:' + response.data.qid
                            return query
                        });
                    }
                },
                registerParam: function (bs, q, fq, wkt) {
                    var data = {q: q, bs: bs}
                    if (fq !== undefined && fq != null) data.fq = fq
                    if (wkt !== undefined && wkt != null && wkt.length > 0) data.wkt = wkt
                    return $http.post("portal/q", data).then(function (response) {
                        return response.data
                    });
                },
                newQuery: function () {
                    return {
                        q: ["*:*"],
                        name: '',
                        bs: SpatialPortalConfig.biocacheServiceUrl,
                        ws: SpatialPortalConfig.biocacheUrl
                    }
                },
                newLayer: function (query, area, newName) {

                    var fq = []
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
                    if (area !== undefined && area != null && area.q !== undefined) {
                        fq = fq.concat(area.q)
                    }
                    var wkt = undefined
                    if (area !== undefined && area != null && area.q === undefined) wkt = area.wkt
                    if (query.wkt !== undefined) wkt = query.wkt

                    return this.registerLayer(query.bs, query.ws, fq, wkt, newName)
                },
                newLayerAddFq: function (query, newFq, newName) {
                    var fq = [query.q].concat(query.fq).concat([newFq])

                    return this.registerLayer(query.bs, query.ws, fq, query.wkt, newName)
                },
                registerLayer: function (bs, ws, fq, wkt, name) {
                    for (var i = 0; i < fq.length; i++) {
                        if (fq[i] == '*:*') fq.splice(i, 1)
                    }
                    var q = "*:*"
                    if (fq.length > 0) {
                        q = fq[0]
                        fq.splice(0, 1)
                    }
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
                },
                url: function () {
                    return SpatialPortalConfig.biocacheServiceUrl
                }
            };
        }])
}(angular));
