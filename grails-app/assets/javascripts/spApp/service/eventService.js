(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name EventService
     * @description
     *   Common events
     */
    angular.module('event-service', [])
        .factory('EventService', ['MapService', 'LayoutService', 'LoggerService', 'BiocacheService', '$q',
            function (MapService, LayoutService, LoggerService, BiocacheService, $q) {

                // events
                var SCATTERPLOT_CREATE_IN_OUT = ['Create', 'scatterplotCreateInOut']
                var ADHOC_CREATE_IN_OUT = ['Create', 'adhocCreateInOut']
                var FACET_NEW_LAYER = ['Create', 'facetNewLayer']
                var FACET_NEW_LAYER_OUT = ['Create', 'facetNewLayerOut']

                var thiz = {
                    execute: function (event, data) {
                        if (event == SCATTERPLOT_CREATE_IN_OUT[1]) {
                            var inFq = data.data[0].enabled ? data.data[0].facet : undefined
                            var outFq = data.data[1].enabled ? data.data[1].facet : undefined
                            return thiz.scatterplotCreateInOut(MapService.getFullLayer(data.layerId), inFq, outFq)
                        } else if (event == ADHOC_CREATE_IN_OUT[1]) {
                            var inFq = data.data[0].enabled ? data.data[0].facet : undefined
                            var outFq = data.data[1].enabled ? data.data[1].facet : undefined
                            return thiz.adhocCreateInOut(MapService.getFullLayer(data.layerId), inFq, outFq)
                        } else if (event == FACET_NEW_LAYER[1]) {
                            var newFqs = []
                            $.map(data.data, function (v) {
                                if (v.enabled) {
                                    newFqs.push(v.facet)
                                }
                            })
                            return thiz.facetNewLayer(MapService.getFullLayer(data.layerId), newFqs)
                        } else if (event == FACET_NEW_LAYER_OUT[1]) {
                            var newFqs = []
                            $.map(data.data, function (v) {
                                if (v.enabled) {
                                    newFqs.push(v.facet)
                                }
                            })
                            return thiz.facetNewLayerOut(MapService.getFullLayer(data.layerId), newFqs)
                        }

                        return $q.when(true)
                    },

                    facetNewLayerOut: function (layer, newFqs) {
                        var fq = ''
                        if (newFqs.length > 0) {
                            var fqs = $.merge([], newFqs)
                            for (var i = 0; i < fqs.length; i++) {
                                // Use (*:* AND -facet:*) instead of (-facet:*)
                                if (fqs[i].match(/^-[^\s]*:\*$/) != null || fqs[i].match(/^-[^\s]*:\[\* TO \*\]$/) != null) {
                                    fqs[i] = '*:* AND ' + fqs[i]
                                }
                            }
                            fq = "-((" + fqs.join(") AND (") + "))"
                        }

                        return BiocacheService.newLayerAddFq(layer, fq,
                            layer.name + " : " + $i18n(343, "from unselected")).then(function (data) {

                            if (data == null) {
                                return $q.when(null)
                            }

                            var logData = []
                            $.map(newFqs, function (v) {
                                logData.push({facet: v})
                            })

                            LoggerService.log(FACET_NEW_LAYER_OUT[0], FACET_NEW_LAYER_OUT[1],
                                {
                                    layerId: layer.uid,
                                    query: {
                                        qid: layer.qid, bs: layer.bs,
                                        ws: layer.ws
                                    },
                                    data: logData
                                })

                            data.log = false
                            return MapService.add(data)
                        })
                    },

                    facetNewLayer: function (layer, newFqs) {
                        return BiocacheService.newLayerAddFq(layer, newFqs,
                            layer.name + " : " + $i18n(342, "from selected")).then(function (data) {

                            if (data == null) {
                                return $q.when(null)
                            }

                            var logData = []
                            $.map(newFqs, function (v) {
                                logData.push({facet: v})
                            })

                            LoggerService.log(FACET_NEW_LAYER[0], FACET_NEW_LAYER[1],
                                {
                                    layerId: layer.uid,
                                    query: {
                                        qid: layer.qid, bs: layer.bs,
                                        ws: layer.ws
                                    },
                                    data: logData
                                })

                            data.log = false
                            return MapService.add(data)
                        })
                    },

                    adhocCreateInOut: function (layer, inFq, outFq) {
                        LoggerService.log(ADHOC_CREATE_IN_OUT[0], ADHOC_CREATE_IN_OUT[1],
                            {
                                layerId: layer.uid,
                                query: {
                                    qid: layer.qid, bs: layer.bs,
                                    ws: layer.ws
                                },
                                data: [{facet: layer.inAdhocQ},
                                    {facet: layer.outAdhocQ}]
                            })

                        var promises = []

                        if (inFq) {
                            promises.push(BiocacheService.newLayerAddFq(layer, inFq,
                                layer.name + " : " + $i18n(340, "in adhoc")).then(function (data) {
                                if (data == null) {
                                    return $q.when(null)
                                }

                                data.log = false
                                return MapService.add(data)
                            }))
                        }

                        if (outFq) {
                            promises.push(BiocacheService.newLayerAddFq(layer, outFq,
                                layer.name + " : " + $i18n(341, "out adhoc")).then(function (data) {
                                if (data == null) {
                                    return $q.when(null)
                                }

                                data.log = false
                                return MapService.add(data)
                            }))
                        }

                        return $q.all(promises)
                    },

                    scatterplotCreateInOut: function (layer, inFq, outFq) {
                        LoggerService.log(SCATTERPLOT_CREATE_IN_OUT[0], SCATTERPLOT_CREATE_IN_OUT[1],
                            {
                                layerId: layer.uid,
                                taskId: layer.scatterplotId,
                                query: {
                                    qid: layer.qid, bs: layer.bs,
                                    ws: layer.ws
                                },
                                data: [{facet: inFq, description: 'in group'},
                                    {facet: outFq, description: 'out group'}]
                            })

                        var promises = []

                        promises.push(BiocacheService.newLayerAddFq(layer, inFq,
                            layer.name + " : " + $i18n(338, "in scatterplot selection")).then(function (data) {
                            if (data == null) {
                                return $q.when(null)
                            }

                            data.log = false
                            return MapService.add(data)
                        }))

                        promises.push(BiocacheService.newLayerAddFq(layer, outFq,
                            layer.name + " : " + $i18n(339, "out scatterplot selection")).then(function (data) {
                            if (data == null) {
                                return $q.when(null)
                            }

                            data.log = false
                            return MapService.add(data)
                        }))

                        return $q.all(promises)
                    }
                }

                return thiz
            }])
}(angular));