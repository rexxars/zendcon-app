/**
 * Figures out the right language to use based on browser language
 */
define(['moment', 'momentlang'], function(moment) {
    'use strict';

    var lang = (navigator.language || 'en').toLowerCase(), i;
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
});
