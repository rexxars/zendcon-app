define(['jquery', 'pubsub'], function($, pubsub) {
    'use strict';

    // Handle active/inactive class based on routes
    var items = $('#nav a, #menu a'), route;
    pubsub.subscribe('router:match', function(e, params) {
        route = params.view || params;

        items.removeClass('active');
        items.filter('[data-route="' + route + '"]').addClass('active');
    });

    // Handle overflow menu
    var menuElements = $('#menu, #layout');
    $('.toggle-menu').on('click', function(e) {
        e.preventDefault();
        menuElements.toggleClass('active');
    });

    // Handle overflow menu item clicks
    items.on('click', function() {
        menuElements.removeClass('active');
    });

    return {};
});
