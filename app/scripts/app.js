/*global angular, ZC, moment */
(function() {
    'use strict';

    // Figure out the right language to use based on browser language
    (function(lang, i) {
        lang = (lang || 'en').toLowerCase();
        if (moment.langData(lang)) {
            return moment.lang(lang);
        }

        lang = lang.split('-');
        i = lang.length;
        while(--i) {
            if (moment.langData(lang[i])) {
                return moment.lang(lang[i]);
            }
        }

        return moment.lang('en');
    })(navigator.language);

    ZC.defaultImg = function(img) {
        img.src = '/images/speakers/default.png';
    };

    ZC.nukeImg = function(img) {
        img.parentElement.removeChild(img);
    };

    ZC.nuke = function() {
        for (var key in localStorage) {
            localStorage.removeItem(key);
        }
    };

    return angular.module('zc', []);

})();
