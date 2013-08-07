define([
    'underscore',
    'jquery',
    'instagram',
    'hbs!templates/photo-list'
], function(_, $, Instagram, photoListTemplate) {
    'use strict';

    var removeLoading = function() {
        $('.photo-loader').remove();
    };

    var PhotoCtrl = function() {
        this.instagram = new Instagram({
            tag: 'zendcon',
            clientId: 'a9d882434fd14061bced3b3f6ab9d4fc',
            ttl: 10
        });

        _.bindAll(this, [
            'onInstaDataSuccess',
            'onInstaDataFail',
            'onInstaData',
            'fetchData',
            'render'
        ]);
    };

    _.extend(PhotoCtrl.prototype, {
        renderOfflineMode: function() {
            removeLoading();
            $('.photos .placeholder .error').html(
                'You are offline<br>Photos can\'t load :('
            );
        },

        render: function() {
            if (!navigator.onLine) {
                return this.renderOfflineMode();
            }

            if (!this.data) {
                this.bindPhotoModal();
                return this.fetchData();
            }

            removeLoading();

            $('.photos .placeholder')
                .replaceWith(photoListTemplate(this.data));
        },

        bindPhotoModal: function() {
            $('#content').magnificPopup({
                delegate: '.photo-list a',
                type: 'image',
                tLoading: 'Loading image #%curr%...',
                mainClass: 'mfp-img-mobile',
                fixedContentPos: false,
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    preload: [0, 1]
                },
                zoom: {
                    enabled: true
                },
                image: {
                    tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
                    titleSrc: function(item) {
                        return item.el.attr('title');
                    }
                }
            });
        },

        onInstaDataSuccess: function(res) {
            this.data = { photos: res };
            this.render();
        },

        onInstaDataFail: function() {
            var error = '<p class="error">Terribly sorry, but it seems we failed to ' +
                        'retrieve the photo data... Are you connected to the internet? ' +
                        'Try <a href="javascript:window.location.reload();">reloading</a>?';

            $('#content').html(error);
        },

        onInstaData: function() {
            this.fetching = false;
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            this.xhr = this.instagram.getLatestPhotos(
                this.onInstaDataSuccess,
                this.onInstaDataFail,
                this.onInstaData
            );
        }
    });

    return PhotoCtrl;
});
