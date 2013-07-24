require.config({
    paths: {
        hbs: '../components/requirejs-hbs/hbs',
        text: '../components/requirejs-text/text',
        jquery: 'libs/jquery.min',
        moment: '../components/moment/moment',
        momentlang: '../components/moment/min/langs.min',
        underscore: '../components/lodash/lodash',
        page: '../components/page/index',
        speakingUrl: '../components/speakingurl/speakingurl.min',
        pubsub: '../components/pubsub-js/src/pubsub',
        handlebars: '../components/require-handlebars-plugin/Handlebars'
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

define(['app'], function() {
    'use strict';
});
