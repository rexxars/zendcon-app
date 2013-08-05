define([
    'underscore',
    'jquery',
    'zc-api',
    'hbs!templates/speaker'
], function(_, $, ZcApi, speakerTemplate) {
    'use strict';

    var SpeakerCtrl = function() {
        _.bindAll(this, [
            'onSpeakerDataSuccess',
            'onSpeakerDataFail',
            'onSpeakerData',
            'fetchData',
            'render'
        ]);
    };

    _.extend(SpeakerCtrl.prototype, {
        onSpeakerDataSuccess: function(speakers) {
            // Remove invalid speakers
            delete speakers.blank;

            this.speakers = speakers;
            this.render();
        },

        onSpeakerDataFail: function() {
            var error = '<p class="error">Terribly sorry, but it seems we failed to ' +
                        'retrieve the speaker data... Are you connected to the internet? ' +
                        'Try <a href="javascript:window.location.reload();">reloading</a>?';

            $('#content').html(error);
        },

        onSpeakerData: function() {
            this.fetching = false;
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            ZcApi.getSpeakers(
                this.onSpeakerDataSuccess,
                this.onSpeakerDataFail,
                this.onSpeakerData
            );
        },

        render: function() {
            if (!this.speakers) {
                this.fetchData();
                return;
            }

            // Populate templates
            var speaker, speakerSlug, html = '';
            for (speakerSlug in this.speakers) {
                speaker = this.speakers[speakerSlug][0];
                speaker.talks = this.speakers[speakerSlug];
                html += speakerTemplate(speaker);
            }

            // Replace content
            this.content = $('.speaker-list').html(html);

            // Scroll to top
            $('html, body').animate({
                scrollTop: 0
            });
        }
    });

    return SpeakerCtrl;
});
