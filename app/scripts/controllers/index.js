define([
    'pubsub',
    'router',
    'zc-api',
    'helpers/content-loader',
    'controllers/stream',
    'controllers/speakers',
    'controllers/schedule',
    'controllers/map',
    'controllers/photo',
    'controllers/uncon'
], function(pubsub, routes, ZcApi, contentLoader, StreamCtrl, SpeakersCtrl, ScheduleCtrl, MapCtrl, PhotoCtrl, UnconCtrl) {
    'use strict';

    // Preload schedule and uncon if no data in localStorage
    (function() {
        if (localStorage['zc-sync']) {
            return;
        }

        var lambda = function() {};
        ZcApi.getSchedule(lambda, lambda, lambda);
        ZcApi.getUnconSchedule(lambda, lambda, lambda);
    })();

    // Init controllers
    var currentController;
    var controllers = {
        'stream'  : new StreamCtrl(),
        'schedule': new ScheduleCtrl(),
        'speakers': new SpeakersCtrl(),
        'map'     : new MapCtrl(),
        'photos'  : new PhotoCtrl(),
        'uncon'   : new UnconCtrl(),

        'undef': function() {}
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
