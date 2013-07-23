define(['jquery', 'helpers/debug', 'router', 'controllers/index', 'helpers/menu'], function($, ZC, router) {
    'use strict';

    // When document is loaded and ready to go, init the router
    $(function() {
        router.start();
    });

    return ZC;
});
