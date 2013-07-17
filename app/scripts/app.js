define(['zepto', 'helpers/debug', 'routes', 'controllers/index', 'helpers/moment-init'], function($, ZC, routes) {
    'use strict';


    // When document is loaded and ready to go, init the router
    $(function() {
        routes.router.init();
    });

    return ZC;
});
