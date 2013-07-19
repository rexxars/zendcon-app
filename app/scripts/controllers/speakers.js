define(['zc-api'], function(ZcApi) {
    'use strict';

    console.log('ZcApi is: ', ZcApi);

    var SpeakerCtrl = function() {

        var Api = new ZcApi();
        Api.getSpeakers(function(res) {
            delete res.blank;
            //$scope.speakers = res;
        }, function(res) {
            console.log('FAILURE', res);
        });

    };

    return SpeakerCtrl;
});
