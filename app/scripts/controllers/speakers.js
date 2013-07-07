/* global define */
define(['zc-api'], function(ZcApi) {
    'use strict';

    var SpeakersController = function($scope, $http) {

        var Api = new ZcApi($http);
        Api.getSpeakers(function(res) {
            $scope.speakers = res;
            console.log(res);
        }, function(res) {
            console.log('FAILURE', res);
        });
    };

    return ['$scope', '$http', SpeakersController];
});
