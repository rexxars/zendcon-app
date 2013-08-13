define([], function() {
    'use strict';

    var basePath;
    return function(path) {
        if (!basePath) {
            basePath = document.getElementsByTagName('base')[0].getAttribute('href');
        }

        return path ? (basePath.replace(/^\//, '') + path) : basePath;
    };
});
