define(['underscore', 'page', 'pubsub'], function(_, page, pubsub) {
    'use strict';

    // Route match handler
    var onMatch = function(ctx) {
        var route = ctx.path.replace(/^\/(.*?)($|\/.*)/, '$1');
        pubsub.publish('router:match', route);
    };

    // Set up routes
    page('/stream', onMatch);
    page('/schedule', onMatch);
    page('/schedule/:date', onMatch);
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
