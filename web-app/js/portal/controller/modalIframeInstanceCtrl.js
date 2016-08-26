(function (angular) {
    'use strict';
    angular.module('modal-iframe-instance-ctrl', [])
        .controller('ModalIframeInstanceCtrl', ['$scope', '$uibModalInstance', 'src', 'title', 'notes',
            function ($scope, $uibModalInstance, src, title, notes) {

                $scope.src = src;
                $scope.title = title;
                $scope.notes = notes;

                $scope.cancel = function () {
                    $uibModalInstance.close({close: true, data: null});
                };
            }])
}(angular));