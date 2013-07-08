/* global angular, $, ZC */
(function() {
    'use strict';

    var app = angular.module('zc')
      , ZcApi  = new ZC.Api();

    app.directive('sessionSelector', function() {
        return {
            restrict: 'A',
            scope: {
                'session': '=session'
            },
            link: function(scope, element) {
                var parent    = scope
                  , attending = false;

                var toggle    = function() {
                    var wasChecked = element.hasClass('checked')
                      , row        = $(element[0]).closest('tr')
                      , rows       = row.parent().children('tr')
                      , el;

                    // Mark rows as unattendable based on checked state
                    rows.toggleClass('not-attendable', !wasChecked);
                    row.removeClass('not-attendable');

                    if (wasChecked) {
                        // It used to be checked, so remove the session
                        ZcApi.removeCheckedSession(scope.session);
                    } else {
                        // It used to be unchecked, add session and remove any existing
                        ZcApi.addCheckedSession(scope.session);
                        el = angular.element(rows.find('.checked').removeClass('checked').get(0));
                        if (el.length) {
                            ZcApi.removeCheckedSession(el.scope().session);
                        }
                    }

                    // Mark this session as checked
                    element.toggleClass('checked');
                };

                while (!parent.attending) {
                    parent = parent.$parent;
                }

                attending = !!parent.attending[scope.session];

                element
                    .bind('click', toggle)
                    .toggleClass('checked', attending);
            }
        };
    });

})();
