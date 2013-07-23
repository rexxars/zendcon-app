define(['underscore', 'page', 'pubsub'], function(_, page, pubsub) {
    'use strict';

    // Schedule dates
    var dates = [
        '2013-10-07',
        '2013-10-08',
        '2013-10-09',
        '2013-10-10'
    ];

    // Save last route so we may default to the last viewed page
    var saveLastRoute = function(url) {
        localStorage.setItem('lastUrl', url);
    };

    // Get default location (last, or /schedule)
    var getDefaultLocation = function() {
        return localStorage.getItem('lastUrl') || '/schedule';
    };

    // Route match handler
    var onMatch = function(ctx) {
        var route = ctx.path.replace(/^\/(.*?)($|\/.*)/, '$1');
        saveLastRoute(ctx.path);
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

        saveLastRoute(ctx.path);
        pubsub.publish('router:match', {
            'view'   : 'schedule',
            'date'   : date,
            'session': ctx.params.sessionId || 0
        });
    };

    // Set up routes
    page('/schedule', onScheduleMatch);
    page('/schedule/:date', onScheduleMatch);
    page('/schedule/:date/:sessionId', onScheduleMatch);
    page('/stream', onMatch);
    page('/speakers', onMatch);
    page('/map', onMatch);
    page('/credits', onMatch);

    // Default to the following location
    page('*', function(ctx, next) {
        _.defer(function() {
            page.replace(getDefaultLocation());
        });

        next();
    });

    return page;
});
