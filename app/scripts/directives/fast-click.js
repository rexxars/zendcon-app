/* global angular, Modernizr */
(function() {
    'use strict';

    var app = angular.module('zc');

    app.directive('fastClick', ['$location', '$rootScope', function($location, $rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                element.bind(Modernizr.touch ? 'touchend' : 'click', function(e) {
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    }

                    $location.path(this.href.replace(/.*?#/, ''));
                    $rootScope.$apply();
                    return false;
                });
            }
        };
    }]);

})();
