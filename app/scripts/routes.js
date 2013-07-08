/* global angular */
(function() {
    'use strict';

    var app = angular.module('zc');

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/speakers', {
            templateUrl: 'views/speakers.html',
            controller: 'SpeakerCtrl'
        });

        $routeProvider.when('/sessions', {
            templateUrl: 'views/sessions.html',
            controller: 'SessionCtrl'
        });

        $routeProvider.when('/schedule', {
            templateUrl: 'views/schedule.html',
            controller: 'ScheduleCtrl'
        });

        $routeProvider.when('/schedule/:date', {
            templateUrl: 'views/schedule.html',
            controller: 'ScheduleCtrl'
        });

        $routeProvider.when('/schedule/:date/:session', {
            templateUrl: 'views/schedule.html',
            controller: 'ScheduleCtrl'
        });

        $routeProvider.when('/stream', {
            templateUrl: 'views/stream.html',
            controller: 'StreamCtrl'
        });

        $routeProvider.otherwise({redirectTo: '/schedule'});
    }]);

})();
