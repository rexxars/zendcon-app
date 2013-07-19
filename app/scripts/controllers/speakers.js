define([
    'underscore',
    'jquery',
    'zc-api',
    'hbs!templates/speaker'
], function(_, $, ZcApi, speakerTemplate) {
    'use strict';

    var SpeakerCtrl = function() {
        if (!ZcApi) {
            console.log('ZcApi is ', ZcApi);
        }

        this.api = new ZcApi();
        this.rendered = 0;

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
            console.log('Failed to fetch speaker data');
        },

        onSpeakerData: function() {
            this.fetching = false;
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            this.api.getSpeakers(
                this.onSpeakerDataSuccess,
                this.onSpeakerDataFail,
                this.onSpeakerData
            );
        },

        render: function() {
            console.log(++this.rendered, this.speakers);

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

            if (this.rendered === 3) {
                console.log(html);
            }

            // Replace content
            this.content = $('.speaker-list').html(html);
        }
    });

    return SpeakerCtrl;
});
