define([
    'jquery',
    'magnificentpopup',
    'helpers/debug',
    'router',
    'controllers/index',
    'helpers/appcache',
    'helpers/menu',
    'helpers/handlebars-helpers'
], function($, mp, ZC, router) {
    'use strict';

    // Make sure we don't have any ZC-US data causing trouble
    if (window.localStorage && window.localStorage['zc-sync']) {
        ZC.nuke();
    }

    // When document is loaded and ready to go, init the router
    $(function() {
        router.start();
    });

    return ZC;
});
