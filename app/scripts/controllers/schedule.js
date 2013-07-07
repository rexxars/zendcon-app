/* global angular, _, ZC, moment */
(function() {
    'use strict';

    var app   = angular.module('zc')
      , dates = [
        '2013-10-07',
        '2013-10-08',
        '2013-10-09',
        '2013-10-10',
    ];

    app.controller('ScheduleCtrl', [
        '$scope',
        '$http',
        '$location',
        '$routeParams',
        function($scope, $http, $location, $routeParams) {

            var today, redir, date = $routeParams.date;
            if (!date || _.contains(dates, date) === false) {
                today = new Date().toISOString().substr(0, 10);
                redir = _.contains(dates, today) ? today : dates[0];
                $location.path('/schedule/' + redir).replace();
                return;
            }

            $scope.selectedDate  = date;
            $scope.formattedDate = moment(date).format('dddd, LL');
            $scope.weekDays = moment.langData()._weekdaysShort;

            var Api = new ZC.Api($http), schedule;
            Api.getSchedule(function(res) {
                schedule = _.groupBy(res, 'Date');
                schedule = _.each(schedule, function(day, date, list) {
                    list[date] = _.groupBy(day, 'StartTime');
                    _.each(list[date], function(slot, slotDate, slots) {
                        slots[slotDate] = _.sortBy(slot, 'Room');
                    });
                });

                $scope.schedule = schedule[date] || {};
            }, function(res) {
                console.log('FAILURE', res);
            });


            Api.getSpeakers(function() {}, function() {});
        }
    ]);

})();
