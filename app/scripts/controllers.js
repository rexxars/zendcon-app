/* global define */
define([
    'angular',
    'services',
    'controllers/speakers',
    'controllers/schedule'
], function(angular, services, SpeakerCtrl, ScheduleCtrl) {
    'use strict';

    return angular.module('zc.controllers', ['zc.services'])
        .controller('MenuCtrl', ['$scope', '$location', function($scope, $location) {
            $scope.getClass = function(path) {
                var curPath = $location.path().substr(0, path.length);
                if (curPath !== path || ($location.path().substr(0).length > 1 && path.length === 1)) {
                    return '';
                }

                return 'active';
            };
        }])
        .controller('SpeakerCtrl', SpeakerCtrl)
        .controller('ScheduleCtrl', ScheduleCtrl);
});
