define(['underscore', 'jquery'], function(_, $) {
    'use strict';

    var Instagram = function(config) {
        this.config = config;
    };

    _.extend(Instagram.prototype, {

        baseUrl: 'https://api.instagram.com/v1',

        httpClient: function(url, options) {
            options = $.extend(options || {}, {
                dataType: 'jsonp',
                cache: true,
                url: url
            });

            return $.ajax(options);
        },

        request: function(endpoint) {
            return this.httpClient(
                this.baseUrl +
                endpoint +
                '?client_id=' +
                this.config.clientId +
                '&callback=?'
            );
        },

        filter: function(res) {
            var items = _.map(res.data, function(item) {
                return {
                    cap: item.caption ? (item.caption.text || '') : '',
                    d: parseInt(item.created_time, 10),
                    u: item.user.username,
                    a: item.link,
                    l: 0,
                    t: item.images.thumbnail.url,
                    f: item.images.standard_resolution.url
                };
            });

            var existing = this.getCache().items || []
              , merged   = _.uniq(items.concat(existing), JSON.stringify)
              , sorted   = _.sortBy(merged, 'd').reverse()
              , reduced  = sorted.slice(0, 29);

            this.setCacheItem('items', reduced);
            return reduced;
        },

        setCacheItem: function(key, val) {
            var cache = this.getCache();
            cache[key] = val;

            localStorage.setItem(
                this.getCacheKey(),
                JSON.stringify(cache)
            );
        },

        getCacheKey: function() {
            return 'insta-' + this.config.tag;
        },

        getCache: function() {
            try {
                return JSON.parse(localStorage.getItem(this.getCacheKey())) || {};
            } catch (e) {
                return {};
            }
        },

        retrieve: function(endpoint, onSuccess, onError, onResponse) {
            // Fetch from local cache (always start here so we can deliver results right away)
            var cacheData = this.getCache().items;
            if (cacheData) {
                onSuccess(cacheData, true);
            }

            if (!cacheData || (this.canSync() && this.mustSync())) {
                this.request(endpoint)
                    .fail(cacheData ? function() {} : onError)
                    .always(onResponse)
                    .done(_.bind(function(data) {
                        data = this.filter(data);

                        // Don't re-update UI or repopulate the cache if no new data
                        if (JSON.stringify(cacheData) === JSON.stringify(data)) {
                            return;
                        }

                        onSuccess(data, false);
                    }, this));
            } else {
                onResponse();
            }
        },

        // Checks if we're online and can sync
        canSync: function() {
            return navigator.onLine;
        },

        getTTL: function() {
            return this.config.ttl || 1;
        },

        mustSync: function() {
            var key    = this.getCacheKey()
              , sync   = JSON.parse(localStorage['zc-sync'] || '{}')
              , synced = sync[key] || 0
              , diff   = Math.abs(new Date() - new Date(synced));

            // Sync if diff > TTL minutes
            return diff > (this.getTTL() * 60 * 1000);
        },

        getLatestPhotos: function(onSuccess, onError, onResponse) {
            return this.retrieve(
                '/tags/' + encodeURIComponent(this.config.tag) + '/media/recent',
                onSuccess,
                onError,
                onResponse
            );
        }

    });

    return Instagram;

});
