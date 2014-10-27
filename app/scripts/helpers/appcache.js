define([], function() {
    'use strict';

    if (!window.applicationCache) {
        return;
    }

    var appCache = {
        onLoad: function() {
            window.applicationCache.addEventListener('updateready', appCache.onUpdateReady, false);
        },

        onUpdateReady: function() {
            if (window.applicationCache.status !== window.applicationCache.UPDATEREADY) {
                return;
            }

            // Browser downloaded a new app cache
            // Swap it in and reload the page to get the new hotness
            try {
                // Delete Flickr cache, as there was a bug where small images would be included
                window.applicationCache.swapCache();

                if (window.confirm('A new version of the app is available. Load it?')) {
                    window.location.reload();
                }
            } catch (e) {
                // If we fail to swap cache, try anyway.
                window.location.reload();
            }
        }
    };

    appCache.onLoad();

    return appCache;
});
