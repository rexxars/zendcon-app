/* global angular */
(function() {
    'use strict';

    var app = angular.module('zc');

    app.directive('sessionSelector', function() {
        return {
            restrict: 'A',
            scope: {
                'session': '=session'
            },
            link: function(scope, element) {
                console.log(scope);

                var details = element.find('blockquote')
                  , toggle  = function() {
                    details.toggleClass('open');
                };

                element.bind('click', toggle);
            }
        };
    });

})();