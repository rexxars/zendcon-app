/* global angular */
(function() {
    'use strict';

    var app = angular.module('zc');

    app.controller('MenuCtrl', ['$scope', '$location', function($scope, $location) {
        $scope.getClass = function(path) {
            var curPath = $location.path().substr(0, path.length);
            if (curPath !== path || ($location.path().substr(0).length > 1 && path.length === 1)) {
                return '';
            }

            return 'active';
        };
    }]);

})();