require.config({
    paths: {
        hbs: '../bower_components/requirejs-hbs/hbs',
        text: '../bower_components/requirejs-text/text',
        jquery: 'libs/jquery.min',
        moment: '../bower_components/moment/moment',
        momentlang: '../bower_components/moment/min/langs.min',
        underscore: '../bower_components/lodash/lodash',
        page: '../bower_components/page/index',
        speakingUrl: '../bower_components/speakingurl/speakingurl.min',
        pubsub: '../bower_components/pubsub-js/src/pubsub',
        handlebars: '../bower_components/require-handlebars-plugin/Handlebars'
    },
    shim: {
        page: {
            exports: 'page'
        }
    },
    hbs: {
        disableI18n: true
    }
});

require(['app'], function() {
    'use strict';
});
