require.config({
    paths: {
        zepto: 'shims/zepto',
        moment: '../components/moment/moment',
        momentlang: '../components/moment/min/langs.min',
        underscore: '../components/lodash/lodash',
        director: '../components/director/build/director',
        speakingUrl: '../components/speakingurl/speakingurl.min',
        pubsub: '../components/PubSubJS/src/pubsub',
        handlebars: '../components/handlebars.js/dist/handlebars.runtime'
    },
    shim: {
        director: {
            exports: 'Router'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    }
});

require(['app'], function() {
    'use strict';
});
