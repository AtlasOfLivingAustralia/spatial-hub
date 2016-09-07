(function (angular) {
    'use strict';
    angular.module('biocache-service', [])
        .factory("BiocacheService", ["$http", function ($http) {
            return {
                speciesCount: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return $http.get(query.bs + "/occurrence/facets?facets=names_and_lsid&flimit=0&q=" + this.getQString(query) + fqList).then(function (response) {
                        if (response.data !== undefined && response.data.length > 0 && response.data[0].count !== undefined) {
                            return response.data[0].count;
                        } else {
                            return 0;
                        }
                    });
                },
                speciesList: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return $http.get(query.bs + "/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&q=" + this.getQString(query) + fqList).then(function (response) {
                        return response.data;
                    });
                },
                dataProviderList: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return $http.jsonp(query.bs + "/webportal/dataProviders?q=" + this.getQString(query) + fqList).then(function (response) {
                        return response.data;
                    });
                },
                count: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return $http.get(query.bs + "/occurrences/search?facet=false&pageSize=0&q=" + this.getQString(query) + fqList).then(function (response) {
                        if (response.data !== undefined && response.data.totalRecords !== undefined) {
                            return response.data.totalRecords;
                        }
                    });
                },
                constructSearchResultUrl: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false
                    pageSize = pageSize === undefined ? 1 : pageSize
                    offset = offset || 0
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return query.ws + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset +"&q=" + this.getQString(query) + fqList
                },
                searchForOccurrences: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false
                    pageSize = pageSize === undefined ? 1 : pageSize
                    offset = offset || 0
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs))
                    return $http.get(query.bs + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset +"&q=" + this.getQString(query) + fqList).then(function (response) {
                        if (response.data !== undefined) {
                            return response.data;
                        }
                    });
                },
                facet: function (facet, query) {
                    return $http.get(query.bs + "/webportal/legend?cm=" + facet + "&q=" + this.getQString(query) + "&type=application/json").then(function (response) {
                        return response.data;
                    });
                },
                facetGeneral: function (facet, query, pageSize, offset) {
                    return $http.get(query.bs + "/occurrence/facets?facets=" + facet + "&flimit=" + pageSize + "&foffset=" + offset + "&q=" + this.getQString(query)).then(function (response) {
                        return response.data;
                    });
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
                getQString: function(query) {
                    //TODO: test for max query length and generate qid where necessary
                    if (query.qid !== undefined) {
                        return query.qid
                    } else if (query.q !== undefined) {
                        var q = this.joinAndEncode(query.q)
                        if (query.wkt != null) {
                            q += "&wkt=" + encodeURIComponent(query.wkt)
                        }

                        query.qid = q

                        return q
                    } else {
                        return query
                    }
                },
                bbox: function (query) {
                    var qstr = this.getQString(query)
                    return $http.get(query.bs + "/webportal/bbox?q=" + this.getQString(query) + "&type=application/json").then(function (response) {
                        var bb = response.data.split(",")
                        return [[bb[1], bb[0]], [bb[3], bb[2]]];
                    });
                },
                registerParam: function (ws, q, fq, wkt) {
                    var data = {q: q, ws: ws}
                    if (fq !== undefined) data.fq = fq
                    if (wkt !== undefined && wkt.length > 0) data.wkt = wkt
                    return $http.post("portal/q", data).then(function (response) {
                        return response.data
                    });
                },
                newQuery: function () {
                    return {
                        q: ["*:*"],
                        name: '',
                        ws: SpatialPortalConfig.biocacheServiceUrl,
                        bs: SpatialPortalConfig.biocacheUrl
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
                    if (area !== undefined && area.q !== undefined) {
                        fq = fq.concat(area.q)
                    }
                    var wkt = undefined
                    if (area !== undefined) wkt = area.wkt
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
