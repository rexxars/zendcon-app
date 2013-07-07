/*global define, ZC */
define([
    'underscore',
    'angular',
    'controllers'
], function(_, angular, controllers) {
    'use strict';


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

    return angular.module('zc', [
        'zc.controllers',
        'zc.services'
    ]);
});
