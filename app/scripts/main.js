require.config({
    paths: {
        hbs: '../bower_components/requirejs-hbs/hbs',
        text: '../bower_components/requirejs-text/text',
        jquery: 'libs/jquery.min',
        moment: '../bower_components/moment/moment',
        momentlang: '../bower_components/moment/min/langs.min',
        underscore: '../bower_components/lodash/lodash',
        page: '../bower_components/page/index',
        magnificentpopup: '../bower_components/magnific-popup/dist/jquery.magnific-popup.min',
        speakingUrl: '../bower_components/speakingurl/speakingurl.min',
        pubsub: '../bower_components/pubsub-js/src/pubsub',
        handlebars: '../bower_components/require-handlebars-plugin/Handlebars',
        instagram: 'services/instagram',
        flickr: 'services/flickr'
    },
    shim: {
        page: {
            exports: 'page'
        },
        magnificentpopup: {
            exports: '$.fn.magnificPopup',
            deps: ['jquery']
        }
    },
    hbs: {
        disableI18n: true
    }
});

require(['app'], function() {
    'use strict';
});
