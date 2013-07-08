/* global angular */
(function() {
    'use strict';

    var app = angular.module('zc');
    app.controller('StreamCtrl', [function() {

        // Window dimensions?
        var height = window.innerHeight - 45
          , width  = window.innerWidth;

        (function(doc, tag, id) {
            var a = doc.getElementsByClassName('twitter-timeline')[0]
              , fjs  = doc.getElementsByTagName(tag)[0]
              , prot = /^http:/.test(doc.location) ? 'http' : 'https'
              , js;

            a.setAttribute('height', height);
            a.setAttribute('width',   width);

            if (!doc.getElementById(id)) {
                js = doc.createElement(tag);
                js.id = id;
                js.src = prot + '://platform.twitter.com/widgets.js';
                fjs.parentNode.insertBefore(js, fjs);
            }
        })(document, 'script', 'twitter-wjs');

    }]);

})();
