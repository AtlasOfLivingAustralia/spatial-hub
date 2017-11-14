(function (angular) {
    'use strict';
    angular.module('i18n-directive', []).directive('i18n',
        ['$compile', 'i18nService', function ($compile, i18nService) {
            return {
                transclude: true,
                scope: {
                    _i18n: '&i18n'
                },
                link: function(scope, element, attrs, ctrl, transclude) {
                    scope.count = 1;
                    scope.s = i18nService;
                    scope.trusted_html_variable = '';

                    if (scope._i18n instanceof Function) {
                        scope._i18n = ''
                    }

                    scope.testClick = function(event) {
                        var value = scope.s.v(event.target.getAttribute('i18n-idx'));

                        bootbox.prompt({
                            title: "Edit text",
                            inputType: 'textarea',
                            value: value,
                            callback: function (result) {
                                if (result != null) {
                                    event.target.previousSibling.textContent = result;

                                    i18nService.commit(event.target.getAttribute('i18n-idx'), result);
                                }
                            }
                        });
                    };

                    transclude(scope, function(clone) {

                        var copy = $(clone.context);

                        scope.children = []
                        for (var a in copy[0].childNodes) {
                            if (copy[0].childNodes.hasOwnProperty(a)) {
                                var n = copy[0].childNodes[a];
                                if (n.nodeName == '#text') {
                                    var txt = n.textContent;

                                    var lookup = scope._i18n
                                    if (lookup == '') {
                                        lookup = txt
                                    }
                                    var value = scope.s.v(lookup);
                                    if (value !== undefined) {
                                        n.textContent = value;
                                    } else {
                                        //set this undefined property
                                        value = txt;
                                        scope.s.set(lookup, txt)
                                    }

                                    var btn = $("<i class='glyphicon glyphicon-edit i18n-btn'></i>");
                                    if (a !== '0' && scope._i18n != '') {
                                        btn[0].setAttribute('i18n-idx', lookup + '-' + a);
                                    } else {
                                        btn[0].setAttribute('i18n-idx', lookup);
                                    }
                                    btn[0].addEventListener('click', function(event) {
                                        scope.testClick(event)
                                    });
                                    element.append(n);
                                    element.append(btn);

                                } else {
                                    element.append(n);
                                }
                            }
                        }


                        element[0].addEventListener('mouseover', function(event) {
                            $(event.target).find(".i18n-btn").fadeTo(0, 1);
                            $(event.target).addClass("i18n-hover");
                        });
                        element[0].addEventListener('mouseout', function(event) {
                            $(event.target).find(".i18n-btn").fadeTo(2000, 0);
                            $(event.target).removeClass("i18n-hover");
                        });
                    });
                }
            };
        }])
}(angular));