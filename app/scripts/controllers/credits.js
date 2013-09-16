define(['jquery'], function($) {
    'use strict';

    var CreditsCtrl = function() {};

    CreditsCtrl.prototype.render = function() {
        // Scroll to top
        $('html, body').animate({
            scrollTop: 0
        });
    };

    return CreditsCtrl;
});
