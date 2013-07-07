/*global define, ZC, navigator, localStorage */
define([
    'underscore',
    'speakingurl'
], function(_, slugGenerator) {
    'use strict';

    var getSlug = function(input) {
        if (input === 'undefined-undefined') {
            return 'blank';
        }

        return slugGenerator(input);
    };

    var ZcApi = function($http) {
        this.httpClient = $http;
    };

    var mapTags = function(session) {
        var tags = [], level = (session.TechnologyLevel || '').toLowerCase();
        if (level.length && level.indexOf('intermediate') === -1) {
            tags.push(session.TechnologyLevel.toLowerCase());
        }

        var title = (session.SessionTitle || '').toLowerCase();
        if (title.indexOf('ibm') >= 0) {
            tags.push('ibmi');
        }

        if (title.indexOf('zend framework') + title.indexOf('zf2') >= 0) {
            tags.push('zf2');
        }

        var track = (session.Track || '').toLowerCase();
        if (track.indexOf('professional php') >= 0) {
            tags.push('pro-php');
        }

        if (track.indexOf('mobile') >= 0) {
            tags.push('mobile');
        }

        if (track.indexOf('cloud') >= 0) {
            tags.push('cloud');
        }

        return tags;
    };

    _.extend(ZcApi.prototype, {

        baseUrl: ZC.apiUrl,

        getSpeakers: function(onSuccess, onError) {
            return this.retrieve('/speakers', onSuccess, onError);
        },

        getSchedule: function(onSuccess, onError) {
            return this.retrieve('/schedule', onSuccess, onError);
        },

        filters: {
            '/speakers': function(entry) {
                entry.slug = getSlug(entry.FirstName + '-' + entry.LastName);
                return entry;
            },

            '/schedule': function(entry) {
                // Sorry about this, but I believe these have been tagged incorrectly
                entry.FirstName   = entry.FirstName === 'David' && entry.LastName === 'Ramsey' ? 'Ben'   : entry.FirstName;
                entry.FirstName   = entry.FirstName === 'David' && entry.LastName === 'Shafik' ? 'Davey' : entry.FirstName;

                entry.Room        = entry.Room || 'Grand Ballroom?';
                entry.Room        = isNaN(entry.Room) ? entry.Room : 'Room ' + entry.Room;
                entry.EndTime     = entry.EndTime.substr(0, 5);
                entry.StartTime   = entry.StartTime.substr(0, 5);

                entry.slug        = getSlug(entry.SessionTitle + '-' + entry.id);
                entry.speakerSlug = getSlug(entry.FirstName + '-' + entry.LastName);
                entry.tags        = mapTags(entry);
                entry.isKeynote   = entry.SessionTitle.toLowerCase().indexOf('keynote') >= 0;
                return entry;
            }
        },

        filter: function(endpoint, entries) {
            return _.map(entries, this.filters[endpoint]);
        },

        mustSync: function(endpoint) {
            var key    = this.getCacheKey(endpoint)
              , sync   = JSON.parse(localStorage['zc-sync'] || '{}')
              , synced = sync[key] || 0
              , diff   = Math.abs(new Date() - new Date(synced));

            // Sync if diff > 15 minutes
            return diff > (15 * 60 * 1000);
        },

        // Checks if we're online and can sync
        canSync: function() {
            return navigator.onLine;
        },

        request: function(endpoint) {
            return this.httpClient.jsonp(
                this.baseUrl + endpoint + '?callback=JSON_CALLBACK'
            );
        },

        getCacheKey: function(endpoint) {
            return endpoint.replace(/\//g, '');
        },

        getCached: function(endpoint) {
            try {
                return JSON.parse(localStorage[this.getCacheKey(endpoint)]);
            } catch (e) {
                return false;
            }
        },

        setCached: function(endpoint, data) {
            var key     = this.getCacheKey(endpoint)
              , syncKey = 'zc-sync'
              , sync    = JSON.parse(localStorage[syncKey] || '{}');

            sync[key] = new Date().getTime();
            localStorage[syncKey] = JSON.stringify(sync);
            localStorage[key]     = JSON.stringify(data);
        },

        retrieve: function(endpoint, onSuccess, onError) {
            console.log('Fetching ' + endpoint);
            console.log('Can sync? ', this.canSync());
            console.log('Must sync? ', this.mustSync(endpoint));
            console.log('Fetch from cache? ', !(this.canSync() && this.mustSync(endpoint)));

            if (this.canSync() && this.mustSync(endpoint)) {
                // Fetch from remote API
                this.request(endpoint)
                    .error(onError)
                    .success(_.bind(function(data) {
                        this.setCached(endpoint, data);
                        onSuccess(this.filter(endpoint, data));
                    }, this));
            } else {
                // Fetch from local cache
                var data = this.getCached(endpoint);
                if (data) {
                    onSuccess(this.filter(endpoint, data));
                } else {
                    onError(data);
                }
            }
        }

    });


    return ZcApi;
});
