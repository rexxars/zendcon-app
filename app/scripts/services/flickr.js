define(['underscore', 'jquery', 'instagram'], function(_, $, Instagram) {
    'use strict';

    if (!Object.create) {
        Object.create = (function() {
            function F() {}

            return function(o) {
                F.prototype = o;
                return new F();
            };
        })();
    }

    var Flickr = function(config) {
        this.config = config;
    };

    Flickr.prototype = Object.create(Instagram.prototype);

    _.extend(Flickr.prototype, {

        baseUrl: 'http://api.flickr.com/services/rest/',

        request: function(endpoint) {
            return this.httpClient(
                this.baseUrl +
                endpoint +
                '&api_key=' +
                this.config.apiKey +
                '&jsoncallback=?'
            );
        },

        filter: function(res) {
            if (!res || !res.photos || !res.photos.photo) {
                return [];
            }

            var cap, items = _.map(res.photos.photo, function(item) {
                cap = item.description._content ? item.description._content : (item.title || '');

                // Flickr is returning some really strange binary data. Only show text.
                cap = cap.match(/[^a-z]/ig).length > 25 ? '' : cap;
                return {
                    cap: cap,
                    d: parseInt(item.dateupload, 10),
                    u: item.ownername || item.owner,
                    a: '//flickr.com/' + item.owner,
                    l: parseInt(item.license, 10),
                    t: item.url_q,
                    f: item.url_c || item.url_l
                };
            });

            var existing = this.getCache().items || []
              , merged   = _.uniq(items.concat(existing), JSON.stringify)
              , filtered = _.filter(merged, function(item) { return item.f; })
              , sorted   = _.sortBy(filtered, 'd').reverse();

            this.setCacheItem('items', sorted);
            return sorted;
        },

        getCacheKey: function() {
            return 'flickr-' + this.config.tag;
        },

        getLatestPhotos: function(onSuccess, onError, onResponse) {
            return this.retrieve(
                [
                    '?method=flickr.photos.search',
                    '&text=' + this.config.tag,
                    '&license=1,2,3,4,5,6,7',
                    '&extras=date_upload,url_q,url_c,url_l,description,owner_name,license',
                    '&format=json'
                ].join(''),
                onSuccess,
                onError,
                onResponse
            );
        }

    });

    return Flickr;

});
