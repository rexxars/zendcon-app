/* global Modernizr */
define(['jquery', 'underscore'], function($, _) {
    'use strict';

    var win    = $(window)
      , loaded = 0
      , map, nav, floors, dragX, dragY, scrolling, active;

    var MapCtrl = function() {
        this.init();

        _.bindAll(this, [
            'render',
            'toggleZoom',
            'onMapLoaded'
        ]);
    };

    _.extend(MapCtrl.prototype, {
        init: function() {
            win.on('resize', this.resizeMap).trigger('resize');
        },

        render: function() {
            loaded = 0;

            active = localStorage['map-layer'] || 'ground-floor';
            map    = $('#map .wrapper');
            floors = $('#map .floors');
            nav    = $('#nav');

            this.setActiveFloor(active);
            win.trigger('resize');
            this.attachEvents();
        },

        attachEvents: function() {
            map.on('dblclick', this.toggleZoom);
            map.find('img').on('load', this.onMapLoaded);

            $('#map .zoom button').on('click', this.toggleZoom);
            floors.find('button').on('click', this.toggleFloor);

            map.on(Modernizr.touch ? 'touchmove'  : 'mousemove', this.dragMove);
            map.on(Modernizr.touch ? 'touchstart' : 'mousedown', this.dragStart);
            map.on(Modernizr.touch ? 'touchend'   : 'mouseup',   this.dragEnd);
            win.on(Modernizr.touch ? 'touchend'   : 'mouseup',   this.dragWinEnd);
        },

        dragStart: function(e) {
            if (e.type === 'mousedown' && e.which !== 1) {
                return;
            }

            e.preventDefault();
            e = e.originalEvent || e;

            scrolling = true;
            dragX = this.scrollLeft + (e.touches ? e.touches[0].pageX : e.pageX);
            dragY = this.scrollTop  + (e.touches ? e.touches[0].pageY : e.pageY);
        },

        dragMove: function(e) {
            e.preventDefault();
            e = e.originalEvent || e;

            if (scrolling) {
                this.scrollLeft = dragX - (e.touches ? e.touches[0].pageX : e.pageX);
                this.scrollTop  = dragY - (e.touches ? e.touches[0].pageY : e.pageY);
            }
        },

        dragEnd: function(e) {
            e.preventDefault();
            scrolling = false;
        },

        dragWinEnd: function() {
            scrolling = false;
        },

        resizeMap: function() {
            if (!map) {
                return;
            }

            map.css({
                'height': win.height() - nav.height()
            });
        },

        onMapLoaded: function(e) {
            if (++loaded !== 2) {
                return;
            }

            map.find('img').css('width', $('#layout').width());
            this.centerMap(e.target || e);
        },

        setActiveFloor: function(floor) {
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
        },

        toggleFloor: function() {
            var el = $(this), floor = el.data('floor');
            if (!map || el.hasClass('active')) {
                return;
            }

            localStorage['map-layer'] = floor;
            map.children('img')
                .addClass('hidden')
                .filter(function() { return $(this).data('floor') === floor; })
                .removeClass('hidden');

            $(this).addClass('active').siblings().removeClass('active');
        },

        toggleZoom: function(e) {
            if (!map) {
                return;
            } else if (e.type === 'dblclick') {
                e = { target: $('#map .zoom button').get(0) };
            }

            var el    = $((e.target.nodeName !== 'BUTTON') ? e.target.parentNode : e.target)
              , width = el.hasClass('plus') ? 'auto' : $('#layout').width();

            el.toggleClass('plus minus').find('i').toggleClass('icon-plus icon-minus');

            var img = map.find('img').css('width', width).get(0);

            this.centerMap(img);
        },

        centerMap: function(el) {
            var image = $(el)
              , img   = image.width() ? image : image.siblings();

            var centerPixel = {
                left: Math.floor((img.width()  * 50) - (map.width() / 2)),
                top:  Math.floor((img.height() * 50)  - (map.height() / 2))
            };

            map
                .prop('scrollLeft', centerPixel.left)
                .prop('scrollTop',  centerPixel.top);
        }
    });

    return MapCtrl;

});
