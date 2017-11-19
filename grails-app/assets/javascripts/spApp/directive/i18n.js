(function (angular) {
    'use strict';
    angular.module('i18n-directive', []).directive('i18n',
        ['$compile', 'i18nService', '$timeout', function ($compile, i18nService, $timeout) {
            return {
                transclude: true,
                scope: {
                    _i18n: '=i18n'
                },
                link: function(scope, element, attrs, ctrl, transclude) {
                    scope.trusted_html_variable = '';

                    scope.save = function (ref) {
                        i18nService.commit(ref, scope.value);
                    };

                    scope.map = i18nService.map;
                    scope.undo = '';

                    scope.editClick = function (event) {
                        $('.i18n-edit').detach();

                        var ref = event.target.getAttribute('i18n-idx');
                        scope.undo = scope.v();

                        var item = angular.element("<input>");
                        item.attr('ng-model', 'map["' + ref + '"]');
                        item.bind('keydown keypress', function (event) {
                            if (event.which === 27) {
                                // esc; reset
                                scope.map[scope._i18n] = scope.undo;
                                event.preventDefault();
                                $(event.target).detach();
                            }
                            if (event.which === 13) {
                                // enter; save
                                scope.undo = undefined;
                                i18nService.commit(scope._i18n, scope.v());
                                $(event.target).detach();
                                event.preventDefault();
                            }
                        });

                        $compile(item)(scope);

                        item.addClass("i18n-edit input-lg");
                        $('body').append(item);
                        item.focus()
                    };

                    scope.v = function () {
                        return i18nService.v(scope._i18n)
                    };

                    transclude(scope, function(clone) {

                        var copy = $(clone.context);

                        scope.children = [];
                        for (var a in copy[0].childNodes) {
                            if (copy[0].childNodes.hasOwnProperty(a)) {
                                var n = copy[0].childNodes[a];
                                if (n.nodeName == '#text') {
                                    var txt = n.textContent;

                                    var lookup = scope._i18n;
                                    if (lookup == '') {
                                        lookup = txt
                                    }
                                    var value = i18nService.v(lookup);
                                    if (value !== undefined) {
                                        if ($SH.editable) {
                                            n.textContent = "{{ v() }}";
                                            $compile(n, null, -1)(scope);
                                        } else {
                                            n.textContent = value;
                                        }
                                    } else {
                                        //set this undefined property
                                        value = txt;
                                        scope.s.set(lookup, txt)
                                    }

                                    if ($SH.editable) {
                                        var btn = $("<i class='glyphicon glyphicon-edit i18n-btn'></i>");
                                        btn[0].setAttribute('i18n-idx', lookup);

                                        btn[0].addEventListener('click', function (event) {
                                            scope.editClick(event)
                                        });
                                        if (n.nodeName == "input") {
                                            element.parent.append(btn);
                                        } else {
                                            element.append(btn);
                                        }
                                    }

                                    element.append(n);
                                } else {
                                    element.append(n);
                                }
                            }
                        }

                        if ($SH.editable) {
                            element[0].addEventListener('mouseover', function (event) {
                                var target = $(event.target);
                                var btn = target.find(".i18n-btn");
                                btn.fadeTo(0, 1);
                                btn.css('top', (target.position().top - 10) + "px");
                                btn.css('left', (target.position().left + target.width()) + "px");
                                target.addClass("i18n-hover");
                            });
                            element[0].addEventListener('mouseout', function (event) {
                                var target = $(event.target);
                                var btn = target.find(".i18n-btn");
                                btn.fadeTo(2000, 0);
                                target.removeClass("i18n-hover");
                            });
                        }
                    });
                }
            };
        }])
}(angular));