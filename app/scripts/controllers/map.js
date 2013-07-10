/* global angular */
(function($) {
    'use strict';

    var app    = angular.module('zc')
      , win    = $(window)
      , active = localStorage['map-layer'] || 'ground-floor'
      , loaded = 0
      , map, nav, floors;

    var resizeMap = function() {
        map.css({
            'height': win.height() - nav.height()
        });
    };

    var onMapLoaded = function() {
        if (++loaded !== 2) {
            return;
        }

        var image = $(this)
          , img   = image.width() ? image : image.siblings();

        var centerPrct = {
            'ground-floor': {
                left: 0.512,
                top: 0.581
            },
            'top-floor': {
                left: 0.3744,
                top: 0.5759
            }
        }, centerPixel = {
            left: Math.floor((img.width()  * centerPrct[active].left) - (map.width() / 2)),
            top:  Math.floor((img.height() * centerPrct[active].top)  - (map.height() / 2))
        };

        map
            .prop('scrollLeft', centerPixel.left)
            .prop('scrollTop',  centerPixel.top)
            .kinetic({
                maxvelocity: 20,
                triggerHardware: true
            });
    };

    var initMap   = function() {
        map    = $('#map .wrapper');
        floors = $('#map .floors');
        nav    = $('#nav');

        setActiveFloor(active);
        win.on('resize', resizeMap).trigger('resize');
        map.on('dblclick', toggleZoom);

        map.children('img').on('load', onMapLoaded);
    };

    var setActiveFloor = function(floor) {
        map
            .find('img[data-floor="' + floor + '"]')
            .removeClass('hidden')
            .siblings()
            .addClass('hidden');

        floors
            .find('.' + floor)
            .addClass('active')
            .siblings()
            .removeClass('active');
    };

    var toggleFloor = function(floor, e) {
        if (!map || angular.element(e.target).hasClass('active')) {
            return;
        }

        localStorage['map-layer'] = floor;
        map.children('img').toggleClass('hidden');
        $(e.target).toggleClass('active').siblings().toggleClass('active');
    };

    var toggleZoom = function(e) {
        if (!map) {
            return;
        } else if (e.type === 'dblclick') {
            e = { target: $('#map .zoom button').get(0) };
        }

        var el    = $((e.target.nodeName !== 'BUTTON') ? e.target.parentNode : e.target)
          , width = el.hasClass('plus') ? 'auto' : map.find('img').not('.hidden').width() / 2;

        el.toggleClass('plus minus').find('i').toggleClass('icon-plus icon-minus');

        map.find('img').css('width', width);
    };

    app.controller('MapCtrl', ['$scope', function($scope) {

        $scope.initMap = initMap;
        $scope.toggleFloor = toggleFloor;
        $scope.zoom = toggleZoom;

    }]);

})(window.Zepto || window.jQuery);
