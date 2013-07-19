define([
    'pubsub',
    'routes',
    'helpers/content-loader',
    'controllers/stream',
    'controllers/speakers'
], function(pubsub, routes, contentLoader, StreamCtrl, SpeakersCtrl) {
    'use strict';

    var controllers = {
        'stream': StreamCtrl,
        'speakers': SpeakersCtrl,

        'undef': function() {
            console.log('No controller for this view');
        }
    };

    // Use the content-loader to load view and fire off post-load events
    pubsub.subscribe(routes.MATCH, function(e, view) {
        contentLoader.load(view, controllers[view] || controllers.undef);
    });

    return controllers;
});
