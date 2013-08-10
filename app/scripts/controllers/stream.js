define(['underscore', 'jquery', 'pubsub'], function(_, $, pubsub) {
    'use strict';

    var removeLoading = function() {
        $('.stream-loader').remove();
    };

    var StreamCtrl = function() {
        this.init();
    };

    _.extend(StreamCtrl.prototype, {
        init: function() {
            _.bindAll(this, [
                'onRouteMatch',
                'renderOfflineMode',
                'render'
            ]);

            pubsub.subscribe('router:match', this.onRouteMatch);
        },

        onRouteMatch: function(e, route) {
            $(document.body).toggleClass('no-scroll', route === 'stream');
        },

        renderOfflineMode: function() {
            removeLoading();
            $('.stream .twitter-timeline').replaceWith(
                '<div class="offline">' + 
                '   You are offline<br>Twitter stream can\'t load :(' + 
                '</div>'
            );
        },

        render: function() {
            if (!navigator.onLine) {
                return this.renderOfflineMode();
            }

            // Window dimensions?
            var height = window.innerHeight - 47
              , width  = window.innerWidth;

            (function(doc, tag, id) {
                var a = doc.getElementsByClassName('twitter-timeline')[0]
                  , fjs  = doc.getElementsByTagName(tag)[0]
                  , prot = /^http:/.test(doc.location) ? 'http' : 'https'
                  , js;

                a.setAttribute('height', height);
                a.setAttribute('width',   width);

                if (window.twttr) {
                    window.twttr.widgets.load(doc.getElementById('content'));
                    removeLoading();
                } else {
                    js = doc.createElement(tag);
                    js.id = id;
                    js.src = prot + '://platform.twitter.com/widgets.js';
                    js.onload = removeLoading;
                    fjs.parentNode.insertBefore(js, fjs);
                }
            })(document, 'script', 'twitter-wjs');
        }
    });

    return StreamCtrl;
});
