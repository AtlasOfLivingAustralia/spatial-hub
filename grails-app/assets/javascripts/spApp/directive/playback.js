/*
 * Copyright (C) 2016 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 13/09/2016.
 */
(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name playback
     * @description
     *   Panel of controls for time series map layer filter and animation playback
     */
    angular.module('playback-directive', ['map-service']).directive('playback',
        ['$timeout', 'MapService', 'BiocacheService', function ($timeout, MapService, BiocacheService) {
            return {
                scope: {
                    _selected: '=selectedLayer'
                },
                templateUrl: '/spApp/playbackContent.htm',
                link: function (scope, element, attrs) {
                    var self = this,
                        monthNames = [
                            $i18n('January'),
                            $i18n('February'),
                            $i18n('March'),
                            $i18n('April'),
                            $i18n('May'),
                            $i18n('June'),
                            $i18n('July'),
                            $i18n('August'),
                            $i18n('September'),
                            $i18n('October'),
                            $i18n('November'),
                            $i18n('December')
                        ];

                    scope.onPlay = function () {
                        var s = scope._selected.layer.playback;
                        if (!s.play) {
                            if (!s.pause) {
                                s.yearRange[0] = scope._selected.layer.yearMin;
                                s.yearRange[1] = s.yearRange[0] + (s.yearStepSize - 1);

                                s.monthRange[0] = 1;
                                s.monthRange[1] = s.monthRange[0] + (s.monthStepSize - 1)
                            }
                            s.pause = s.stop = false;
                            s.play = true;
                            scope.clearSteps();
                            nextStep()
                        }

                        event && blurButton(event.target)
                    };

                    scope.onStop = function () {
                        var s = scope._selected.layer.playback;
                        s.pause = s.play = false;
                        s.stop = true;

                        s.yearRange[0] = scope._selected.layer.yearMin;
                        s.yearRange[1] = scope._selected.layer.yearMax;

                        s.monthRange[0] = 1;
                        s.monthRange[1] = 12;

                        // do something
                        s.promiseTimeout && $timeout.cancel(s.promiseTimeout);
                        scope.clearSteps();
                        scope.updateDispay();

                        scope.stop = false;
                        event && blurButton(event.target)
                    };

                    scope.onPause = function () {
                        var s = scope._selected.layer.playback;
                        if (s.play) {
                            s.stop = s.play = false;
                            s.pause = true;
                            s.promiseTimeout && $timeout.cancel(s.promiseTimeout)
                        }

                        event && blurButton(event.target)
                    };

                    scope.onRepeat = function () {
                        var s = scope._selected.layer.playback;
                        s.repeat = !s.repeat;

                        event && blurButton(event.target)
                    };

                    scope.onOptions = function () {
                        //initialisation for playback
                        if (!scope._selected.layer.playback) {
                            scope._selected.layer.playback = {
                                yearStepSize: 10,
                                yearRange: [scope.yearStart, scope.yearEnd],
                                monthStepSize: 1,
                                monthRange: [1, 12],
                                timeout: 3,
                                fq: [],
                                repeat: true,
                                play: false,
                                pause: false,
                                stop: false,
                                type: 'year'
                            }
                        }
                        var s = scope._selected.layer.playback;

                        scope.findMinAndMaxYear();

                        s.option = !s.option;

                        event && event.target && event.target.blur()
                    };

                    scope.clearSteps = function () {
                        var s = scope._selected.layer.playback;
                        s.yearStepSize = s.yearStepSize || 10;

                        s.monthStepSize = s.monthStepSize || 1
                    };

                    scope.monthRangeMessage = function () {
                        var s = scope._selected.layer.playback;
                        if (s.monthRange[0] >= 1 && s.monthRange[0] <= 12 && s.monthRange[1] >= 1 && s.monthRange[1] <= 12) {
                            if (s.monthRange[1] === s.monthRange[0]) {
                                return monthNames[s.monthRange[0] - 1]
                            } else {
                                return monthNames[s.monthRange[0] - 1] + ' - ' + monthNames[s.monthRange[1] - 1]
                            }
                        }
                    };

                    function blurButton(target) {
                        var $tar = $(target);
                        if ($tar.hasClass('btn')) {
                            $tar.blur()
                        } else {
                            $tar.parent('.btn').blur()
                        }
                    }

                    function nextStep() {
                        var s = scope._selected.layer.playback;
                        var fireEnd = false;

                        if (s.type) {
                            switch (s.type) {
                                case 'year':
                                    if (scope._selected.layer.yearMax < s.yearRange[1] + s.yearStepSize) {
                                        fireEnd = true;
                                        scope.clearSteps();
                                        s.yearRange[0] = scope._selected.layer.yearMin
                                    } else {
                                        s.yearRange[0] += s.yearStepSize
                                    }
                                    s.yearRange[1] = s.yearRange[0] + (s.yearStepSize - 1);
                                    break;
                                case 'month':
                                    if (12 < s.monthRange[1] + s.monthStepSize) {
                                        fireEnd = true;
                                        scope.clearSteps();
                                        s.monthRange[0] = 1
                                    } else {
                                        s.monthRange[0] += s.monthStepSize
                                    }
                                    s.monthRange[1] = s.monthRange[0] + (s.monthStepSize - 1);
                                    break;
                            }

                            if (fireEnd && !s.repeat) {
                                scope.onStop()
                            } else {
                                scope.updateDispay();
                                s.promiseTimeout = $timeout(nextStep, s.timeout * 1000)
                            }
                        }
                    }

                    scope.updateDispay = function () {
                        scope.updateFq();
                        scope.updateWMS()
                    };

                    scope.updateFq = function (refresh) {
                        var s = scope._selected.layer.playback;
                        if (s.fq.length) s.fq.splice(0, s.fq.length);
                        if (s.play || s.pause || refresh) {
                            switch (s.type) {
                                case 'year':
                                    s.fq.push("year:[" + s.yearRange[0] + " TO " + s.yearRange[1] + "]");
                                    break;
                                case 'month':
                                    s.fq.push("month:[" + s.monthRange[0] + " TO " + s.monthRange[1] + "]");
                                    break;
                            }
                        }
                    };

                    scope.updateWMS = function () {
                        var s = scope._selected.layer.playback;
                        for (var i in scope._selected.layer.leaflet.layerOptions.layers) {
                            var ly = scope._selected.layer.leaflet.layerOptions.layers[i];
                            if (s.fq.length) {
                                ly[0].layerParams.fq = s.fq
                            } else {
                                ly[0].layerParams.fq = undefined
                            }
                        }

                        MapService.reMap(scope._selected);

                        $timeout(function () {
                        }, 0)
                    };

                    function findMinAndMax(values) {
                        var result = {};

                        if (values.length) {
                            values = values.sort();
                            result.min = values[0];
                            result.max = values[values.length - 1]
                        }

                        return result
                    }

                    scope.findMinAndMaxYear = function () {
                        if (scope._selected.layer.layertype === 'species') {
                            if (!scope._selected.layer.yearList) {
                                BiocacheService.facet('year', scope._selected.layer).then(function (data) {
                                    var years = [];
                                    data && data.forEach(function (facet) {
                                        var i = Number.parseInt(facet.name);
                                        if (!Number.isNaN(i)) {
                                            years.push(i)
                                        }
                                    });

                                    var minMax = findMinAndMax(years);
                                    scope._selected.layer.yearMin = minMax.min;
                                    scope._selected.layer.yearMax = minMax.max;
                                    scope._selected.layer.yearList = years;

                                    var s = scope._selected.layer.playback;
                                    s.yearRange[0] = minMax.min;
                                    s.yearRange[1] = minMax.max
                                })
                            }
                        }
                    };

                    scope.showYear = function () {
                        var s = scope._selected.layer.playback;
                        return s.type === 'year' &&
                            scope._selected.layer.yearMin &&
                            scope._selected.layer.yearMax !== scope._selected.layer.yearMin
                    };

                    scope.setType = function (value) {
                        var s = scope._selected.layer.playback;
                        s.type = value;
                        scope.onStop()
                    }
                }
            };
        }])
}(angular));