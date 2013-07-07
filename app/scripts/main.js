/* global require */
require.config({
    paths: {
        'jquery'          : '../components/jquery/jquery',
        'underscore'      : '../components/lodash/lodash',
        // 'angular'         : '../components/angular/angular',
        'angular'         : '../scripts/libs/angular.min',
        'speakingurl'     : '../components/speakingurl/speakingurl.min',
        'templates'       : '../templates'
    },
    shim: {
        'angular': {
            exports: 'angular'
        }
    },
    priority: [
        'angular'
    ]
});

require(['angular', 'app', 'routes'], function(angular, app, routes) {
    'use strict';

    angular.bootstrap(document, [app.name]);
});
