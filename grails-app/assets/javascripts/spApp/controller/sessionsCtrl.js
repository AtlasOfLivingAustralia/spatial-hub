(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name SessionsCtrl
     * @description
     *   Display saved sessions
     */
    angular.module('sessions-ctrl', ['sessions-service'])
        .controller('SessionsCtrl', ['$scope', '$timeout', 'SessionsService', 'MapService', '$uibModalInstance',
            function ($scope, $timeout, SessionsService, MapService, $uibModalInstance) {

                $scope.sortType = 'time';
                $scope.sortReverse = 'true';

                $scope.sessions = [];

                $scope.import = function (sessionId) {
                    SessionsService.load(sessionId);

                    $scope.$close()
                };

                $scope.remove = function (sessionId) {
                    bootbox.confirm({
                        message: $i18n(336, "Delete this session?"),
                        size: 'small',
                        callback: function (result) {
                            if (result) {
                                $scope.sessions = SessionsService.remove(sessionId)
                            }
                        },
                        buttons: {
                            confirm: {
                                label: 'Yes'
                            },
                            cancel: {
                                label: 'No'
                            }
                        }
                    });
                };

                $scope.getList = function () {
                    SessionsService.list().then(function (data) {
                        $scope.sessions = data;
                    })
                };

                $scope.$watch('sessions', function () {
                }, true);

                $scope.getList()
            }])
}(angular));
