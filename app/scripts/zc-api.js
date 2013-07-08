/*global ZC, navigator, localStorage, getSlug, _, moment */
(function(slugGenerator) {
    'use strict';

    var ttl = 120; // Minutes

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
        var tags     = []
          , level    = (session.TechnologyLevel || '').toLowerCase()
          , title    = (session.SessionTitle || '').toLowerCase()
          , abstract = (session.SessionAbstract || '').toLowerCase()
          , track    = (session.Track || '').toLowerCase();


        if (level.length && !_.contains(level, 'intermediate')) {
            tags.push(level);
        }

        if (_.contains(title, 'ibm')) {
            tags.push('ibmi');
        }

        if (_.contains(title + abstract, 'zend framework') || _.contains(title + abstract, 'zf2')) {
            tags.push('zf2');
        }

        if (_.contains(track, 'professional php')) {
            tags.push('pro-php');
        }

        if (_.contains(track, 'mobile')) {
            tags.push('mobile');
        }

        if (_.contains(track, 'cloud')) {
            tags.push('cloud');
        }

        return tags;
    };

    _.extend(ZcApi.prototype, {

        baseUrl: ZC.apiUrl,

        getSpeakers: function(onSuccess, onError) {
            this.getSchedule(function(res) {
                onSuccess(_.groupBy(res, 'speakerSlug'));
            }, onError);
        },

        getSchedule: function(onSuccess, onError) {
            return this.retrieve('/schedule', onSuccess, onError);
        },

        getCheckedSessions: function() {
            return JSON.parse(localStorage['zc-checked'] || '[]');
        },

        addCheckedSession: function(id) {
            var checked = this.getCheckedSessions() || [];
            checked.push(parseInt(id, 10));
            localStorage['zc-checked'] = JSON.stringify(checked);
            return checked;
        },

        removeCheckedSession: function(id) {
            var checked = this.getCheckedSessions() || [];
            checked = _.without(checked, parseInt(id, 10));
            localStorage['zc-checked'] = JSON.stringify(checked);
            return checked;
        },

        filters: {
            '/schedule': function(entry) {
                // Sorry about this, but I believe these have been tagged incorrectly
                entry.FirstName   = entry.FirstName === 'David' && entry.LastName === 'Ramsey' ? 'Ben'   : entry.FirstName;
                entry.FirstName   = entry.FirstName === 'David' && entry.LastName === 'Shafik' ? 'Davey' : entry.FirstName;

                // What do we do without a room? What's the big one called?
                entry.Room        = entry.Room || '';

                // Prefix numeric rooms with 'Room'
                entry.Room        = isNaN(entry.Room) ? entry.Room : 'Room ' + entry.Room;

                var start = moment(new Date(entry.Date + ' ' + entry.StartTime))
                  , end   = moment(new Date(entry.Date + ' ' + entry.EndTime));

                // Set slot time in localized time format
                entry.slot        = start.format('LT') + ' - ' + end.format('LT');

                // Generate slug for this session
                entry.slug        = getSlug(entry.SessionTitle + '-' + entry.id);

                // Generate slug for this speaker
                entry.speakerSlug = getSlug(entry.FirstName + '-' + entry.LastName);

                // Figure out which tags to use for this session
                entry.tags        = mapTags(entry);

                // Is this a keynote?
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

            // Sync if diff > TTL minutes
            return diff > (ttl * 60 * 1000);
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

    ZC.Api = ZcApi;

})(getSlug);
