define([
    'underscore',
    'jquery',
    'instagram',
    'flickr',
    'hbs!templates/photo-list'
], function(_, $, Instagram, Flickr, photoListTemplate) {
    'use strict';

    var licenses = [
        'All Rights Reserved',
        'Attribution-NonCommercial-ShareAlike License',
        'Attribution-NonCommercial License',
        'Attribution-NonCommercial-NoDerivs License',
        'Attribution License',
        'Attribution-ShareAlike License',
        'Attribution-NoDerivs License',
        'No known copyright restrictions'
    ];

    var removeLoading = function() {
        $('.photo-loader').remove();
    }, ttl = 10;

    var PhotoCtrl = function() {
        this.instagram = new Instagram({
            tag: 'zendcon',
            clientId: 'a9d882434fd14061bced3b3f6ab9d4fc',
            ttl: ttl
        });

        this.flickr = new Flickr({
            tag: 'zendcon',
            apiKey: '58178ddb070f4d63bff71d9b74fe57b9',
            ttl: ttl
        });

        this.onDataComplete = _.after(
            2, // Flickr + instagram
            this.onDataComplete
        );

        _.bindAll(this, [
            'onDataFetchSuccess',
            'onDataFail',
            'onDataComplete',
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

            if (this.data && this.lastFetched < (new Date() - 15000)) {
                this.fetchData();
            }

            removeLoading();

            var data = this.data.length > 1 ? this.mergeData() : this.data[0];
            $('.photos .placeholder, .photos .photo-list')
                .replaceWith(photoListTemplate({ photos: data }));
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
                    preload: [2, 2]
                },
                zoom: {
                    enabled: true
                },
                image: {
                    tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
                    titleSrc: function(item) {
                        var markup = 'by <a href="' + item.el.data('user-link') + '" target="_blank">';
                        markup += item.el.data('user') + '</a> ';
                        markup += '(' + licenses[item.el.data('license')] + ')';
                        markup += '<div class="description">' + item.el.data('caption') + '</div>';
                        return markup;
                    }
                }
            });
        },

        onDataFetchSuccess: function(res) {
            this.data.push(res);
            this.render();
        },

        onDataFail: function() {
            var error = '<p class="error">Terribly sorry, but it seems we failed to ' +
                        'retrieve the photo data... Are you connected to the internet? ' +
                        'Try <a href="javascript:window.location.reload();">reloading</a>?';

            $('#content').html(error);
        },

        onDataComplete: function() {
            this.fetching = false;
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            this.data = [];
            this.lastFetched = new Date();
            this.instagram.getLatestPhotos(
                this.onDataFetchSuccess,
                this.onDataFail,
                this.onDataComplete
            );

            this.flickr.getLatestPhotos(
                this.onDataFetchSuccess,
                this.onDataFail,
                this.onDataComplete
            );
        },

        mergeData: function() {
            var merged   = this.data[0].concat(this.data[1])
              , sorted   = _.sortBy(merged, 'd').reverse();

            return sorted;
        }
    });

    return PhotoCtrl;
});
