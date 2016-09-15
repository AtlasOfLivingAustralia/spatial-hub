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
    angular.module('playback-directive', []).directive('playback',
        ["$rootScope", '$timeout', function ($rootScope, $timeout) {
            return {
                scope: {
                    onInit: '&callback'
                },
                templateUrl: 'portal/' + "playbackContent.html",
                link: function (scope, element, attrs) {
                    var self = this,
                        promiseTimeout,
                        monthNames = [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December'
                        ]
                    scope.yearStart = Number.parseInt(attrs.yearStart || 1960)
                    scope.yearEnd = Number.parseInt(attrs.yearEnd || 2000)
                    scope.yearStepSize = Number.parseInt(attrs.yearStepSize || 10)
                    scope.yearRangeMin = scope.yearStart
                    scope.yearRangeMax = scope.yearStart + scope.yearStepSize
                    scope.yearRangeNextMin = scope.yearRangeMin
                    scope.yearRangeNextMax = scope.yearRangeMax
                    scope.yearRange= [scope.yearStart, scope.yearEnd]

                    scope.monthStart = Number.parseInt(attrs.monthStart || 1)
                    scope.monthEnd = Number.parseInt(attrs.monthEnd || 12)
                    scope.monthStepSize = Number.parseInt(attrs.monthStepSize || 1)
                    scope.monthRangeMin = scope.monthStart
                    scope.monthRangeMax = scope.monthStart + scope.monthStepSize
                    scope.monthRangeNextMin = scope.monthRangeMin
                    scope.monthRangeNextMax = scope.monthRangeMax
                    scope.monthRange= [scope.monthStart, scope.monthEnd]

                    scope.timeout = 3


                    scope.repeat = false
                    scope.play = false
                    scope.pause = false
                    scope.stop = false
                    scope.type = attrs.type || 'year'
                    scope.options = false

                    scope.onPlay = function () {
                        if (!scope.play) {
                            scope.pause = scope.stop = false
                            scope.play = true
                            scope.clearSteps()
                            nextStep()
                        }

                        event && blurButton(event.target)
                    };

                    scope.onStop = function (data) {
                        scope.pause = scope.play = false
                        scope.stop = true

                        // do something
                        promiseTimeout && $timeout.cancel(promiseTimeout)
                        scope.clearSteps()
                        scope.$emit('playback.stop', data)

                        scope.stop = false
                        event && blurButton(event.target)
                    }

                    scope.onPause = function () {
                        if(scope.play){
                            scope.stop = scope.play = false
                            scope.pause = true
                            promiseTimeout && $timeout.cancel(promiseTimeout)
                        }

                        event && blurButton(event.target)
                    };

                    scope.onRepeat = function () {
                        scope.repeat = !scope.repeat

                        event && blurButton(event.target)
                    }

                    scope.onOptions = function () {
                        scope.options = !scope.options

                        event && event.target && event.target.blur()
                    }

                    scope.clearSteps = function () {
                        scope.yearStepSize = scope.yearStepSize || attrs.yearStepSize || 10
                        scope.yearRangeMin = scope.yearRange[0]
                        scope.yearRangeMax = scope.yearRange[0] + scope.yearStepSize
                        scope.yearRangeNextMin = scope.yearRangeMin
                        scope.yearRangeNextMax = scope.yearRangeMax


                        scope.monthStepSize = scope.monthStepSize || attrs.monthStepSize || 1
                        scope.monthRangeMin =  scope.monthRange[0]
                        scope.monthRangeMax =  scope.monthRange[0] + scope.monthStepSize
                        scope.monthRangeNextMin = scope.monthRangeMin
                        scope.monthRangeNextMax = scope.monthRangeMax
                    }

                    scope.setYearRange= function (min, max) {
                        scope.yearStart = min
                        scope.yearEnd = max
                        scope.yearRange[0] = min
                        scope.yearRange[1] = max
                    }

                    scope.setType = function (type) {
                        switch (type) {
                            case 'year':
                                scope.type = 'year';
                                break;
                            case 'month':
                                scope.type = 'month'
                                break;
                        }
                    }

                    scope.monthAnimationMessage = function(){
                        if(scope.monthRangeMin >= 1 && scope.monthRangeMin <= 12 && scope.monthRangeMax >= 1 && scope.monthRangeMax <= 12){
                            return monthNames[scope.monthRangeMin - 1] + ' - ' +  monthNames[scope.monthRangeMax -1 ]
                        }
                    }

                    scope.monthRangeMessage = function(){
                        if(scope.monthRange[0] >= 1 && scope.monthRange[0] <= 12 && scope.monthRange[1] >= 1 && scope.monthRange[1] <= 12){
                            return monthNames[scope.monthRange[0] - 1] + ' - ' +  monthNames[scope.monthRange[1] -1 ]
                        }
                    }

                    function blurButton(target) {
                        var $tar = $(target)
                        if($tar.hasClass('btn')){
                            $tar.blur()
                        } else {
                            $tar.parent('.btn').blur()
                        }

                    }

                    function nextStep() {
                        var data = {
                                type: scope.type
                            },
                            fireEnd = false;

                        switch (scope.type){
                            case 'year':
                                if(scope.yearRangeNextMax > scope.yearRange[1]){
                                    fireEnd = true
                                    scope.clearSteps()
                                    data.min = scope.yearRangeMin
                                    data.max = scope.yearRangeMax
                                } else {
                                    data.min = scope.yearRangeMin = scope.yearRangeNextMin
                                    data.max = scope.yearRangeMax = scope.yearRangeNextMax
                                    scope.yearRangeNextMin += scope.yearStepSize
                                    scope.yearRangeNextMax += scope.yearStepSize
                                }
                                break;
                            case 'month':
                                if(scope.monthRangeNextMax > scope.monthRange[1]){
                                    fireEnd = true
                                    scope.clearSteps()
                                    data.min = scope.monthRangeMin
                                    data.max = scope.monthRangeMax
                                } else {
                                    data.min = scope.monthRangeMin = scope.monthRangeNextMin
                                    data.max = scope.monthRangeMax = scope.monthRangeNextMax
                                    scope.monthRangeNextMin += scope.monthStepSize
                                    scope.monthRangeNextMax += scope.monthStepSize
                                }

                                break;
                        }

                        if(fireEnd && !scope.repeat){
                            scope.onStop(data)
                        } else {
                            scope.$emit('playback.increment', data)
                            promiseTimeout = $timeout(nextStep, scope.timeout * 1000)
                        }
                    }

                    scope.onInit && scope.onInit({playback: scope})
                }
            };
        }])
}(angular));