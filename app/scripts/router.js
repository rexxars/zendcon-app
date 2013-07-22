define(['underscore', 'page', 'pubsub'], function(_, page, pubsub) {
    'use strict';

    // Schedule dates
    var dates = [
        '2013-10-07',
        '2013-10-08',
        '2013-10-09',
        '2013-10-10'
    ];

    // Route match handler
    var onMatch = function(ctx) {
        var route = ctx.path.replace(/^\/(.*?)($|\/.*)/, '$1');
        pubsub.publish('router:match', route);
    };

    // Root schedule handler
    var onScheduleMatch = function(ctx) {
        var today, redir, date = ctx.params.date;
        if (!date || _.contains(dates, date) === false) {
            today = new Date().toISOString().substr(0, 10);
            redir = _.contains(dates, today) ? today : dates[0];
            return _.defer(function() {
                page.replace('/schedule/' + redir);
            });
        }

        pubsub.publish('router:match', {
            'view': 'schedule',
            'date': date
        });
    };

    // Set up routes
    page('/schedule', onScheduleMatch);
    page('/schedule/:date', onScheduleMatch);
    page('/stream', onMatch);
    page('/speakers', onMatch);
    page('/map', onMatch);

    // Default to the following location
    page('*', function(ctx, next) {
        _.defer(function() {
            page.replace('/stream');
        });

        next();
    });

    return page;
});
