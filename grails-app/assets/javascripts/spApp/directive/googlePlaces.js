(function (angular) {
    'use strict';
    angular.module('google-places', []).directive('googlePlaces', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                _location: '=location',
                _name: '=name'
            },
            template: '<input style="width:300px" id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
            link: function ($scope, elm, attrs) {
                var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    $scope._location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
                    $scope._name = place.formatted_address;
                    $scope.$apply();
                });
            }
        }
    })
}(angular));