define(['zepto'], function($) {
    'use strict';

    var content
      , cache = {};

    return {
        load: function(view, onLoad) {
            content = content || $('#content');

            var cached = cache[view];
            if (cached) {
                content.html(cached);
                onLoad(cached, 'success', null);
                return;
            }

            content.load('/views/' + view + '.html', function(data, status, xhr) {
                cache[view] = data;
                onLoad(data, status, xhr);
            });
        }
    };

});
