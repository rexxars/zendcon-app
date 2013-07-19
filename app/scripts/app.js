define(['jquery', 'helpers/debug', 'routes', 'controllers/index'], function($, ZC, routes) {
    'use strict';

    // When document is loaded and ready to go, init the router
    $(function() {
        routes.router.init();
    });

    return ZC;
});