(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name ModalIframeInstanceCtrl
     * @description
     *   Display a modal dialog with contents from one of
     *   - URL
     *   - text
     */
    angular.module('modal-iframe-instance-ctrl', [])
        .controller('ModalIframeInstanceCtrl', ['$scope', '$uibModalInstance', 'src', 'title', 'notes',
            function ($scope, $uibModalInstance, src, title, notes) {

                $scope.src = src;
                $scope.title = title;
                $scope.notes = notes;
                $scope.height = $('#map').height() - 50;

            }])
}(angular));