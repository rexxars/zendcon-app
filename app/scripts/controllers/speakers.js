/* global angular, ZC */
(function() {
    'use strict';

    var app = angular.module('zc');
    app.controller('SpeakerCtrl', ['$scope', '$http', function($scope, $http) {

        var Api = new ZC.Api($http);
        Api.getSpeakers(function(res) {
            delete res.blank;
            $scope.speakers = res;
        }, function(res) {
            console.log('FAILURE', res);
        });

    }]);

})();
