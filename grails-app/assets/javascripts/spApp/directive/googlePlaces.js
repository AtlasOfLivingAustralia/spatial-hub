(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name googlePlaces
     * @description
     *   Location search using Google places
     */
    angular.module('google-places-directive', []).directive('googlePlaces', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                _location: '=location',
                _area: '=area'
            },
            template: '<input style="width:300px" id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
            link: function ($scope, elm, attrs) {
                var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    $scope._location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
                    $scope._area = place.formatted_address;
                    $scope.$apply();
                });
            }
        }
    })
}(angular));