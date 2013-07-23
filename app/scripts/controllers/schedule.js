define([
    'underscore',
    'jquery',
    'zc-api',
    'hbs!templates/schedule',
    'hbs!templates/datepicker'
], function(_, $, ZcApi, scheduleTemplate, datepickerTemplate) {
    'use strict';

    var ScheduleCtrl = function() {
        this.params = {};
        _.bindAll(this, [
            'onScheduleDataSuccess',
            'onScheduleDataFail',
            'onScheduleData',
            'fetchData',
            'render'
        ]);
    };

    _.extend(ScheduleCtrl.prototype, {
        onScheduleDataSuccess: function(schedule) {
            // Divide schedule into dates
            schedule = _.groupBy(schedule, 'Date');
            
            // Iterate over dates, organizing the sessions further
            schedule = _.each(schedule, function(day, date, list) {
                // Assign sessions to slots (start - end time)
                list[date] = _.groupBy(day, 'StartTime');
                
                // Iterate over slots
                _.each(list[date], function(slot, slotDate, slots) {
                    // Sort by the room number
                    slots[slotDate] = _.sortBy(slot, 'Room');
                    
                    // See if this is the only session within the slot
                    _.each(slots[slotDate], function(session) {
                        session.singleSession = slot.length === 1;
                    });
                });
            });

            this.schedule = schedule[this.params.date] || {};
            this.render();
        },

        onScheduleDataFail: function() {
            console.log('Failed to fetch schedule data');
        },

        onScheduleData: function() {
            this.fetching = false;
        },

        setParams: function(params) {
            this.params = params;
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            ZcApi.getSchedule(
                this.onScheduleDataSuccess,
                this.onScheduleDataFail,
                this.onScheduleData
            );
        },

        getViewParams: function() {
            var date      = this.params.date
              , localized = moment.langData()._weekdaysShort
              , weekDays  = {
                'monday'   : localized[1],
                'tuesday'  : localized[2],
                'wednesday': localized[3],
                'thursday' : localized[4],
                'friday'   : localized[5],
                'saturday' : localized[6],
                'sunday'   : localized[0]
              };

            var viewParams = {
                'weekDays': weekDays,
                'selectedDate': date,
                'formattedDate': moment(date).format('dddd, LL'),
                'attending': ZcApi.getCheckedSessions()
            };

            return viewParams;
        },

        render: function() {
            if (!this.schedule || this.currentDate != this.params.date) {
                this.currentDate = this.params.date;
                this.fetchData();
                return;
            }

            // Populate templates
            var viewParams = this.getViewParams();

            // Set formatted date to date view
            this.dateView = $('.date-view').text(viewParams.formattedDate);

            // Render each slot section
            this.slotView = $('.session-slot');

            var params = {}, sessions, key, html = '';
            for (key in this.schedule) {
                sessions = this.schedule[key];
                
                params.slot = sessions[0].slot;
                params.sessions = sessions;

                html += scheduleTemplate(params);
            }

            // Add datepicker
            this.datePicker = $(datepickerTemplate(viewParams)).insertBefore('.schedule');
            this.datePicker.find('a[data-date="' + viewParams.selectedDate + '"]').addClass('active');

            this.loading = $('.schedule .bubble-load').remove();
            this.content = $('.session-slot').html(html);

            this.setCheckedSessionStatus(this.content, viewParams.attending);
            this.attachHandlers(this.content);
        },

        setCheckedSessionStatus: function(el, attending, btn) {
            _.each(attending, function(sessionId) {
                // Mark session as attending
                btn = el.find('button[data-session-id="' + sessionId + '"]').addClass('checked');

                // Mark siblings within slot as unattendable
                btn.closest('tr').siblings().addClass('not-attendable');
            });
        },

        attachHandlers: function(el) {
            el.on('click', '.attending button', this.onAttendingClick);
            el.on('click', '.article', this.onSessionInfoClick);
        },

        onAttendingClick: function(e) {
            console.log('attend');

            var el         = $(this)
              , wasChecked = el.hasClass('checked')
              , row        = el.closest('tr')
              , rows       = row.parent().children('tr')
              , sessionId  = el.data('session-id')
              , current;

            // Mark rows as unattendable based on checked state
            rows.toggleClass('not-attendable', !wasChecked);
            row.removeClass('not-attendable');

            if (wasChecked) {
                // It used to be checked, so remove the session
                ZcApi.removeCheckedSession(sessionId);
            } else {
                // It used to be unchecked, add session and remove any existing
                ZcApi.addCheckedSession(sessionId);
                current = rows.find('.checked').removeClass('checked');
                if (current.length) {
                    ZcApi.removeCheckedSession(current.data('session-id'));
                }
            }

            // Mark this session as checked
            el.toggleClass('checked');
        },

        onSessionInfoClick: function(e) {
            var el       = $(this)
              , abstract = el.find('.abstract')
              , open     = abstract.hasClass('open')
              , btn      = el.siblings().find('button')
              , pos      = open ? { top: '', left: '' } : btn.position();

            btn.css(pos).toggleClass('positioned', !open);
            abstract.toggleClass('open', !open);
        }
    });

    return ScheduleCtrl;

});