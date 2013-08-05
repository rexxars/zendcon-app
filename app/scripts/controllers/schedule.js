define([
    'underscore',
    'jquery',
    'zc-api',
    'moment',
    'page',
    'hbs!templates/schedule',
    'hbs!templates/datepicker'
], function(_, $, ZcApi, moment, page, scheduleTemplate, datepickerTemplate, undefined) {
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
            // First date in our schedule
            var firstDate;

            // Divide schedule into dates
            schedule = _.groupBy(schedule, 'Date');

            // Iterate over dates, organizing the sessions further
            schedule = _.each(schedule, function(day, date, list) {
                // Assign first date in schedule
                if (!firstDate) {
                    firstDate = date;
                }

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

            if (!schedule[this.params.date]) {
                var today = new Date().toISOString().substr(0, 10);
                var redir = schedule[today] ? today : firstDate;
                return _.defer(function() {
                    page.replace('/schedule/' + redir);
                });
            }

            this.fullSchedule = schedule;
            this.schedule = schedule[this.params.date] || {};
            this.render();
        },

        onScheduleDataFail: function() {
            var error = '<p class="error">Terribly sorry, but it seems we failed to ' +
                        'retrieve the schedule data... Are you connected to the internet? ' +
                        'Try <a href="javascript:window.location.reload();">reloading</a>?';

            $('#content').html(error);
        },

        onScheduleData: function() {
            this.fetching = false;
        },

        onUnload: function() {
            if (this.xhr) {
                this.xhr.abort();
            }
        },

        setParams: function(params) {
            this.params = params;
        },

        fetchData: function() {
            if (this.fetching) {
                return;
            }

            this.fetching = true;
            this.xhr = ZcApi.getSchedule(
                this.onScheduleDataSuccess,
                this.onScheduleDataFail,
                this.onScheduleData
            );
        },

        getViewParams: function() {
            var date = this.params.date;
            var viewParams = {
                'selectedDate': date,
                'formattedDate': moment(date).format('dddd, LL'),
                'attending': ZcApi.getCheckedSessions()
            };

            return viewParams;
        },

        getDatePickerParams: function() {
            var params = {
                dates: [],
                numDates: 0,
                route: this.params.view
            }, date, key;

            for (key in this.fullSchedule) {
                date = moment(key, 'YYYY-MM-DD');
                params.dates.push({
                    isoDate: key,
                    weekDay: date.format('ddd'),
                    day    : date.format('D')
                });

                params.numDates++;
            }

            return params;
        },

        render: function() {
            if (!this.schedule || this.currentDate !== this.params.date) {
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
            $('#content > .date-picker').remove();
            this.datePicker = $(datepickerTemplate(this.getDatePickerParams())).insertBefore('.schedule');
            this.datePicker.find('a[data-date="' + viewParams.selectedDate + '"]').addClass('active');

            this.loading = $('.schedule .bubble-load').remove();
            this.content = $('.session-slot').html(html);

            this.setCheckedSessionStatus(this.content, viewParams.attending);
            this.gotoSession(this.params.sessionId);
            this.attachHandlers(this.content);
        },

        setCheckedSessionStatus: function(el, attending, btn) {
            _.each(attending, function(sessionId) {
                // Mark session as attending
                btn = el.find('button[data-session-id="' + sessionId + '"]').addClass('checked').text('✔');

                // Mark siblings within slot as unattendable
                btn.closest('tr').siblings().addClass('not-attendable');
            });
        },

        gotoSession: function(sessionId) {
            if (!sessionId) {
                return;
            }

            var el = $('td[data-session-id="' + sessionId + '"]');
            this.onSessionInfoClick.apply(el.get(0));
        },

        attachHandlers: function(el) {
            el.on('click', '.attending button', this.onAttendingClick);
            el.on('click', '.article', this.onSessionInfoClick);
        },

        onAttendingClick: function() {
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
            el.toggleClass('checked').text(wasChecked ? '' : '✔');
        },

        onSessionInfoClick: function() {
            var el       = $(this)
              , abstract = el.find('.abstract')
              , open     = abstract.hasClass('open')
              , btn      = el.siblings().find('button')
              , pos      = open ? { top: '', left: '' } : btn.position()
              , goTo     = window.location.pathname
              , viewport;

            if (!abstract.length) {
                return;
            }

            btn.css(pos).toggleClass('positioned', !open);
            abstract.toggleClass('open', !open);

            // Scroll to abstract if not presently in view
            if (!open) {
                pos = abstract.offset();
                viewport = {
                    from: window.scrollY,
                    to  : window.scrollY + window.innerHeight
                };

                if (pos.top < viewport.from || (pos.top + abstract.height()) > viewport.to) {
                    $('html, body').animate({
                        scrollTop: pos.top - 150
                    });
                }

                goTo = goTo.replace(/(\/|\/\d+)?$/, '/' + el.data('session-id'));
            } else {
                goTo = goTo.replace(/\/\d+$/, '');
            }

            // Update location
            page.replace(
                goTo,
                undefined,
                undefined,
                false
            );
        }
    });

    return ScheduleCtrl;

});
