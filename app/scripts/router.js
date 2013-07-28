define(['underscore', 'page', 'pubsub'], function(_, page, pubsub) {
    'use strict';

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
        var route  = ctx.path.replace(/^\/(.*?)($|\/.*)/, '$1')
          , params = ctx.params;

        saveLastRoute(ctx.path);
        params.view = route;

        pubsub.publish('router:match', params);
    };

    // Set up routes
    page('/schedule', onMatch);
    page('/schedule/:date', onMatch);
    page('/schedule/:date/:sessionId', onMatch);

    page('/uncon', onMatch);
    page('/uncon/:date', onMatch);
    page('/uncon/:date/:sessionId', onMatch);

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
