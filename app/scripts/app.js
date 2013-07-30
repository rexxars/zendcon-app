define([
    'jquery',
    'helpers/debug',
    'router',
    'controllers/index',
    'helpers/appcache',
    'helpers/menu',
    'helpers/handlebars-helpers',
], function($, ZC, router) {
    'use strict';

    // When document is loaded and ready to go, init the router
    $(function() {
        router.start();
    });

    return ZC;
});
