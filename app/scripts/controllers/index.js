define([
    'pubsub',
    'router',
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
    pubsub.subscribe('router:match', function(e, params) {
        var view       = params.view || params
          , controller = controllers[view]
          , handler    = controllers.undef;
        
        if (controller && controller.setParams) {
            controller.setParams(params);
        }

        if (controller && controller.render) {
            handler = controller.render;
        }

        contentLoader.load(view, handler);
    });

    return controllers;
});
