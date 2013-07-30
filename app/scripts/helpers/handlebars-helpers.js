define(['underscore', 'handlebars'], function(_, Handlebars) {
    'use strict';

    Handlebars.registerHelper('nl2br', function(text) {
        if (_.contains(text, '<p') || _.contains(text, '<br')) {
            return new Handlebars.SafeString(text);
        }

        text = Handlebars.Utils.escapeExpression(text);
        var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        return new Handlebars.SafeString(nl2br);
    });

    return Handlebars;
});
