define([
    'underscore',
    'jquery',
    'zc-api',
    'moment',
    'page',
    'controllers/schedule'
], function(_, $, ZcApi, moment, page, ScheduleCtrl) {
    'use strict';

    if (!Object.create) {
        Object.create = (function() {
            function F() {}

            return function(o) {
                F.prototype = o;
                return new F();
            };
        })();
    }

    var UnconCtrl = function() {
        this.params = {};
        _.bindAll(this, [
            'onScheduleDataSuccess',
            'onScheduleDataFail',
            'onScheduleData',
            'fetchData',
            'render'
        ]);
    };

    UnconCtrl.prototype = Object.create(ScheduleCtrl.prototype);

    _.extend(UnconCtrl.prototype, {
        onScheduleDataSuccess: function(schedule) {
            // First date in our schedule
            var firstDate;

            // Divide schedule into dates
            schedule = _.groupBy(schedule, 'Date');

            // Iterate over dates, organizing the sessions further
            schedule = _.each(schedule, function(day, date, list) {
                // Assign first date in schedule
                if (!firstDate) {
                    firstDate = date;
                }

                // Assign sessions to slots (start - end time)
                list[date] = _.groupBy(day, 'StartTime');
            });

            if (!schedule[this.params.date]) {
                var today = new Date().toISOString().substr(0, 10);
                var redir = schedule[today] ? today : firstDate;
                return _.defer(function() {
                    page.replace('/uncon/' + redir);
                });
            }

            this.fullSchedule = schedule;
            this.schedule     = schedule[this.params.date] || {};
            this.render();
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            ZcApi.getUnconSchedule(
                this.onScheduleDataSuccess,
                this.onScheduleDataFail,
                this.onScheduleData
            );
        }
    });

    return UnconCtrl;

});
