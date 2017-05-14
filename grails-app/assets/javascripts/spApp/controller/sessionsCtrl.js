(function (angular) {
    'use strict';
    angular.module('sessions-ctrl', ['sessions-service'])
        .controller('SessionsCtrl', ['$scope', '$timeout', 'SessionsService', 'MapService', '$uibModalInstance',
            function ($scope, $timeout, SessionsService, MapService, $uibModalInstance) {

                $scope['sessions'] = [];

                $scope['import'] = function (sessionId) {
                    SessionsService.load(sessionId);

                    $scope.$close()
                };

                $scope['delete'] = function (sessionId) {
                    bootbox.confirm({
                        message: "Delete this session?",
                        size: 'small',
                        callback: function (result) {
                            if (result) {
                                $scope.sessions = SessionsService['delete'](sessionId)
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
                        $timeout(function () {
                            $resizeTables()
                        }, 200)
                    })
                };

                $scope.$watch('sessions', function () {
                    $timeout(function () {
                        $resizeTables()
                    }, 200)
                }, true);

                $scope.getList()
            }])
}(angular));
