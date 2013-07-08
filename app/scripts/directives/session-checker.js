/* global angular, $ */
(function() {
    'use strict';

    var app = angular.module('zc');

    app.directive('sessionChecker', function() {
        return function(scope, element) {
            // Skip if this is not the last element (not ready to traverse DOM)
            if (!scope.$last) {
                return;
            }

            // Find checked button, if we have no session checked within the slot, fall back
            var checked = $(element[0]).parent().find('.checked');
            if (!checked.length) {
                return;
            }

            // Find non-checked sessions within this slot
            checked.closest('tr').siblings().addClass('not-attendable');
        };
    });

})();
