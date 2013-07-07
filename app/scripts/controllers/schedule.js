/* global define */
define(['underscore', 'zc-api'], function(_, ZcApi) {
    'use strict';

    var dates = [
        '2013-10-07',
        '2013-10-08',
        '2013-10-09',
        '2013-10-10',
    ];

    var ScheduleController = function($scope, $http, $location, $routeParams) {

        var today, redir, date = $routeParams.date;
        if (!date || _.contains(dates, date) === false) {
            today = new Date().toISOString().substr(0, 10);
            redir = _.contains(dates, today) ? today : dates[0];
            $location.path('/schedule/' + redir).replace();
            return $scope.$apply();
        }

        $scope.selectedDate = date;

        var Api = new ZcApi($http), schedule;
        Api.getSchedule(function(res) {
            schedule = _.groupBy(res, 'Date');
            /*schedule = _.each(schedule, function(item, key, list) {
                list[key] = _.groupBy(item, 'StartTime');
            });*/
            console.log(schedule);

            $scope.schedule = schedule[date] || [];
        }, function(res) {
            console.log('FAILURE', res);
        });

    };

    return ['$scope', '$http', '$location', '$routeParams', ScheduleController];
});
