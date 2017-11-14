(function (angular) {
    'use strict';
    angular.module('biocache-service', [])
        .factory("BiocacheService", ["$http", "$q", function ($http, $q) {
            return {
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
                speciesList: function (query, fqs, config) {
                    return this.speciesListUrl(query, fqs).then(function (url) {
                        return $http.get(url, config).then(function (response) {
                            return response.data;
                        });
                    })
                },
                speciesListUrl: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return query.bs + "/occurrences/facets/download?facets=names_and_lsid&lookup=true&count=true&lists=true&q=" + query.qid + fqList;
                    })
                },
                speciesListEndemic: function (query, fqs, config) {
                    this.speciesListEndemicUrl(query, fqs).then(function (url) {
                        return $http.get(url, config).then(function (response) {
                            return response.data;
                        });
                    })
                },
                speciesListEndemicUrl: function (query, fqs) {
                    var q;
                    if (fqs !== undefined) q = $scope.newLayerAddFq(query, fqs, '');
                    else q = query;

                    return this.registerQuery(query).then(function (response) {
                        return query.bs + "/explore/endemic/species/" + q.qid + ".csv?facets=names_and_lsid&lookup=true&count=true&lists=true";
                    })
                },
                dataProviderList: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.jsonp(query.bs + "/webportal/dataProviders?q=" + response.qid + fqList).then(function (response) {
                            return response.data;
                        });
                    })
                },
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
                queryTitle: function (query, fqs) {
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/occurrences/search?facet=false&pageSize=0&q=" + response.qid + fqList).then(function (response) {
                            if (response.data !== undefined && response.data.queryTitle !== undefined) {
                                //remove html wrapping from title
                                var div = document.createElement('div');
                                div.innerHTML = response.data.queryTitle;
                                return div.innerText;
                            } else {
                                return ""
                            }
                        });
                    })
                },
                constructSearchResultUrl: function (query, fqs, pageSize, offset, facet) {
                    facet = facet || false;
                    pageSize = pageSize === undefined ? 1 : pageSize;
                    offset = offset || 0;
                    var fqList = (fqs === undefined ? '' : '&fq=' + this.joinAndEncode(fqs));
                    return this.registerQuery(query).then(function (response) {
                        return query.ws + "/occurrences/search?facet=" + facet + "&pageSize=" + pageSize + "&startIndex=" + offset + "&q=" + response.qid + fqList
                    })
                },
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
                bbox: function (query) {
                    return this.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/webportal/bbox?q=" + response.qid + "&type=application/json").then(function (response) {
                            var bb = response.data.split(",");
                            return [[bb[1], bb[0]], [bb[3], bb[2]]];
                        });
                    })
                },
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
                            return $http.post("portal/q", data).then(function (response) {
                                query.qid = 'qid:' + response.data.qid;
                                return query
                            });
                        // }
                    }
                },
                registerParam: function (bs, q, fq, wkt) {
                    var data = {q: q, bs: bs};
                    if (fq !== undefined && fq !== null) data.fq = fq;
                    if (wkt !== undefined && wkt !== null && wkt.length > 0) data.wkt = wkt;
                    return $http.post("portal/q", data).then(function (response) {
                        return response.data
                    });
                },
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
                        if (area[0].q !== undefined) {
                            fq = fq.concat(area[0].q)
                        } else {
                            wkt = area[0].wkt
                        }
                    }
                    if (query.wkt !== undefined) wkt = query.wkt;

                    return this.registerLayer(query.bs, query.ws, fq, wkt, newName)
                },
                newLayerAddFq: function (query, newFq, newName) {
                    var fq = [query.q].concat(query.fq).concat([newFq]);

                    return this.registerLayer(query.bs, query.ws, fq, query.wkt, newName)
                },
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
                },
                url: function () {
                    return $SH.biocacheServiceUrl
                }
            };
        }])
}(angular));
