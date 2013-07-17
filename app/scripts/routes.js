define(['director', 'pubsub'], function(Router, pubsub) {
    'use strict';

    Router = Router || window.Router;

    // Director has this weird work-around for chrome that is not actually
    // a problem in our app. Instead, it introduces a new bug. So, temp fix:
    if (!window.onpopstate) {
        window.onpopstate = function onchange(onChangeEvent) {
            for (var i = 0, l = Router.listeners.length; i < l; i++) {
                Router.listeners[i](onChangeEvent);
            }
        };
    }

    // Define some constants we can use to look up route matches
    var routes = {
        SPEAKERS: 'router-route-speakers',
        STREAM: 'router-route-stream',
        MATCH: 'router-route-match'
    };

    // Init router
    var router = new Router();

    router.configure({
        // Redirect to default location if no matches
        notfound: function() {
            router.setRoute('/stream');
        },

        // Generic route matcher
        on: function() {
            var route = window.location.pathname.replace(/^\/(.*?)($|\/)/, '$1');
            pubsub.publish(routes.MATCH, route);
        },

        // Let's use pushState instead of these ugly hashes
        html5history: true
    });

    // Define routes
    router.on('/speakers', function() {
        pubsub.publish(routes.SPEAKERS);
    });

    router.on('/stream', function() {
        pubsub.publish(routes.STREAM);
    });

    routes.router = router;
    return routes;
});
