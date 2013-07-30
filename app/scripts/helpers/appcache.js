define([], function() {
    'use strict';

    if (!window.applicationCache) {
        return;
    }

    var appCache = {
        onLoad: function() {
            window.applicationCache.addEventListener('updateready', this.onUpdateReady, false);
        },

        onUpdateReady: function() {
            if (window.applicationCache.status !== window.applicationCache.UPDATEREADY) {
                return;
            }

            // Browser downloaded a new app cache
            // Swap it in and reload the page to get the new hotness
            window.applicationCache.swapCache();
            if (window.confirm('A new version of the app is available. Load it?')) {
                window.location.reload();
            }
        }
    };

    window.addEventListener('load', appCache.onLoad, false);
    return appCache;
});
