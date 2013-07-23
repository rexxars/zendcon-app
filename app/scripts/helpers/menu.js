define(['jquery', 'pubsub'], function($, pubsub) {

    // Handle active/inactive class based on routes
    var items = $('#nav a, #menu a'), route;
    pubsub.subscribe('router:match', function(e, params) {
        route = params.view || params;

        items.removeClass('active');
        items.filter('[data-route="' + route + '"]').addClass('active');
    });

    // Handle overflow menu
    var menuElements = $('#menu, #layout');
    items.last().on('click', function(e) {
        e.preventDefault();

        menuElements.toggleClass('active');
    });

    // Handle overflow menu item clicks
    $('#menu a').on('click', function() {
        menuElements.toggleClass('active');
    });

    return {};
});