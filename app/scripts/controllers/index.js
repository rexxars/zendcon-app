define([
    'pubsub',
    'routes',
    'helpers/content-loader',
    'controllers/stream',
    'controllers/speakers',
    'controllers/schedule'
], function(pubsub, routes, contentLoader, StreamCtrl, SpeakersCtrl, ScheduleCtrl) {
    'use strict';

    var controllers = {
        'stream'  : new StreamCtrl(),
        'schedule': new ScheduleCtrl(),
        'speakers': new SpeakersCtrl(),

        'undef': function() {
            console.log('No controller for this view');
        }
    };

    // Use the content-loader to load view and fire off post-load events
    pubsub.subscribe(routes.MATCH, function(e, view) {
        var controller = controllers[view], handler = controllers.undef;
        if (controller && controller.render) {
            handler = controller.render;
        }

        contentLoader.load(view, function() {
            console.log('view loaded');
            handler();
        });
    });

    return controllers;
});
