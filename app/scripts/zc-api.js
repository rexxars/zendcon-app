define([
    'underscore',
    'jquery',
    'pubsub',
    'moment',
    'speakingUrl'
], function(_, $, pubsub, moment, speakingUrl) {
    'use strict';

    var ttl = 120 // Minutes
      , ZC  = window.ZC;

    var getSlug = function(input) {
        if (input === 'undefined-undefined') {
            return 'blank';
        }

        return speakingUrl(input);
    };

    var ZcApi = function() {};

    var mapTags = function(session) {
        var tags  = []
          , level = (session.TechnologyLevel || '').toLowerCase()
          , title = (session.SessionTitle || '').toLowerCase()
          , abstr = (session.SessionAbstract || '').toLowerCase()
          , track = (session.Track || '').toLowerCase();


        if (level.length && !_.contains(level, 'intermediate')) {
            tags.push(level);
        }

        if (_.contains(title, 'ibm')) {
            tags.push('ibmi');
        }

        if (_.contains(title + abstr, 'zend framework') || _.contains(title + abstr, 'zf2')) {
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

        // Note: We might want to generate static callback names if we want
        // to put a varnish-cache in front of the php-backend
        httpClient: function(url, options) {
            options = $.extend(options || {}, {
                dataType: 'jsonp',
                cache: true,
                url: url
            });

            return $.ajax(options);
        },

        getSpeakers: function(onSuccess, onError, onResponse) {
            this.getSchedule(function(res) {
                var speakers = _.groupBy(res, 'speakerSlug');
                delete speakers.blank;

                var sorted = _.sortBy(speakers, function(list, speakerSlug) {
                    return speakerSlug;
                });

                onSuccess(sorted);
            }, onError, onResponse);
        },

        getSchedule: function(onSuccess, onError, onResponse) {
            return this.retrieve('/schedule', onSuccess, onError, onResponse);
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

        scheduleFilter: function(entry) {
            // Sorry about this, but I believe these have been tagged incorrectly
            entry.FirstName   = entry.FirstName === 'David' && entry.LastName === 'Ramsey' ? 'Ben'   : entry.FirstName;
            entry.FirstName   = entry.FirstName === 'David' && entry.LastName === 'Shafik' ? 'Davey' : entry.FirstName;

            // What do we do without a room? What's the big one called?
            entry.Room        = entry.Room || '';

            // Prefix numeric rooms with 'Room'
            entry.Room        = isNaN(entry.Room) || !entry.Room ? entry.Room : 'Room ' + entry.Room;

            var start = moment(entry.Date + ' ' + entry.StartTime, 'YYYY-MM-DD HH:mm:ss')
              , end   = moment(entry.Date + ' ' + entry.EndTime,   'YYYY-MM-DD HH:mm:ss');

            // Set slot time in localized time format
            entry.slot        = start.format('LT') + ' - ' + end.format('LT');

            // Generate slug for this speaker
            entry.speakerSlug = getSlug(entry.FirstName + '-' + entry.LastName);

            // Figure out which tags to use for this session
            entry.tags        = mapTags(entry);

            // Is this a keynote?
            entry.isKeynote   = entry.SessionTitle.toLowerCase().indexOf('keynote') >= 0;

            return entry;
        },

        filter: function(entries) {
            return _.map(entries, this.scheduleFilter);
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
            // @todo
            return navigator.onLine || true;
        },

        request: function(endpoint) {
            return this.httpClient(
                this.baseUrl + endpoint + '?callback=?'
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

        retrieve: function(endpoint, onSuccess, onError, onResponse) {
            console.log('Fetching ' + endpoint);
            console.log('Fetch from cache? ', !(this.canSync() && this.mustSync(endpoint)));

            if (this.canSync() && this.mustSync(endpoint)) {
                // Fetch from remote API
                this.request(endpoint)
                    .fail(onError)
                    .always(onResponse || function() {})
                    .done(_.bind(function(data) {
                        data = this.filter(data);
                        this.setCached(endpoint, data);
                        onSuccess(data);
                    }, this));
            } else {
                // Fetch from local cache
                var data = this.getCached(endpoint);
                if (data) {
                    onSuccess(data);
                } else {
                    onError(data);
                }

                onResponse();
            }
        }

    });

    ZC.Api = new ZcApi();

    return ZC.Api;
});