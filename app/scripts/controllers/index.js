define([
    'pubsub',
    'router',
    'helpers/content-loader',
    'controllers/stream',
    'controllers/speakers',
    'controllers/schedule',
    'controllers/map',
    'controllers/uncon'
], function(pubsub, routes, contentLoader, StreamCtrl, SpeakersCtrl, ScheduleCtrl, MapCtrl, UnconCtrl) {
    'use strict';

    var currentController;
    var controllers = {
        'stream'  : new StreamCtrl(),
        'schedule': new ScheduleCtrl(),
        'speakers': new SpeakersCtrl(),
        'map'     : new MapCtrl(),
        'uncon'   : new UnconCtrl(),

        'undef': function() {
            console.log('No controller for this view');
        }
    };

    // Use the content-loader to load view and fire off post-load events
    pubsub.subscribe('router:match', function(e, params) {
        // Call unload method of previous controller if defined
        if (currentController && currentController.onUnload) {
            currentController.onUnload();
        }

        var view       = params.view || params
          , controller = controllers[view]
          , handler    = controllers.undef;

        if (controller && controller.setParams) {
            controller.setParams(params);
        }

        if (controller && controller.render) {
            handler = controller.render;
        }

        currentController = controller;
        contentLoader.load(view, handler);

        document.body.className = 'section-' + (view || '');
    });

    return controllers;
});
