/* global angular, $ */
(function() {
    'use strict';

    var app = angular.module('zc');

    var template = '<div>' +
        '<img onerror="ZC.nukeImg(this)" ng-src="/images/speakers/{{ session.speakerSlug }}.png" class="speaker">' +
        '<span class="title">{{ session.SessionTitle }}</span>' +
        '<span class="speaker">{{ session.FirstName }} {{ session.LastName }}</span>' +
        '<div class="meta">' +
            '<span class="location"><i class="icon-map-marker"></i> {{ session.Room }}</span>' +
            '<span class="markers">' +
                '<img ng-repeat="tag in session.tags" ng-src="/images/sessions/{{ tag }}.png" />' +
            '</span>' +
        '</div>' +
        '<blockquote class="abstract">{{ session.SessionAbstract }}</blockquote>' +
    '</div>';

    app.directive('sessionInfo', function() {
        return {
            restrict: 'A',
            replace: false,
            transclude: true,
            template: template,
            scope: {
                'session': '=sessionInfo'
            },
            link: function(scope, element) {
                var open    = false,
                    details = element.find('blockquote'),
                    toggle  = function() {
                        open = !open;

                        var btn = $(this).siblings().find('button')
                          , pos = open ? btn.position() : { top: '', left: '' };

                        btn.css(pos).toggleClass('positioned', open);
                        details.toggleClass('open', open);
                    };

                element.bind('click', toggle);
            }
        };
    });

})();
