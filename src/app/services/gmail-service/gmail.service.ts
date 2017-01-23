import { Injectable } from '@angular/core';
import { } from '..'

declare var gapi: any;
declare var $: any;

@Injectable()
export class GmailService {

  private _readyPromise;
  CLIENT_ID = '817440850730-2huvkm08okd84sqi22kvcnri5kt0f2it.apps.googleusercontent.com';
  SCOPES = ["https://www.googleapis.com/auth/calendar"];
  that = this;

  constructor() {
  }

  checkAuth() {
      gapi.auth.authorize(
        {
          'client_id': this.CLIENT_ID,
          'scope': this.SCOPES.join(' '),
          'immediate': true
        }, this.handleAuthResult);
  }

  handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');

    if (authResult && !authResult.error) {
      authorizeDiv.style.display = 'none';
      loadCalendarApi();
    } else {
      authorizeDiv.style.display = 'inline';
    }

    function loadCalendarApi() {
      gapi.client.load('calendar', 'v3', loadAndInsertCalendar);
    }

    var resource = {
      "summary": "Sample Event " + Math.floor((Math.random() * 10) + 1),
      "start": {
        "dateTime": new Date()
      },
      "end": {
        "dateTime": new Date(new Date().getTime() + (2*1000*60*60))
      }
    };

    function loadAndInsertCalendar() {
      var calendarId = null;
      var timeZone = null;
      var request = gapi.client.calendar.calendarList.list();

      request.execute(function(resp) {
        calendarId = resp.items[0].id;
        timeZone = resp.items[0].timeZone;
        $('.fullcalendar').fullCalendar({
            googleCalendarApiKey: 'AIzaSyD_xVYDDVajctT7RpKR85VQAEERuPJAANc',
            events: {
                googleCalendarId: calendarId,
                className: 'gcal-event',
                allDay: true,
                endParam: new Date(new Date().getTime() + (365*24*1000*3600))
            }
        });
      });
    }

    function createCalendarEvent() {
      var request = gapi.client.calendar.events.insert({
        'calendarId':		'primary',
        "resource":			resource
      });

      request.execute(function(resp) {
        if(resp.status=='confirmed') {
          document.getElementById('output').innerHTML = "Event created successfully. View it <a href='" + resp.htmlLink + "'>online here</a>.";
        } else {
          document.getElementById('output').innerHTML = "There was a problem. Reload page and try again.";
        }
        console.log(resp);
      });
    }

    function listUpcomingEvents() {
      var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
      });

      request.execute(function(resp) {
        var events = resp.items;
        appendPre('Upcoming events:');

        if (events.length > 0) {
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var when = event.start.dateTime;
            if (!when) {
              when = event.start.date;
            }
            appendPre(event.summary + ' (' + when + ')')
          }
        } else {
          appendPre('No upcoming events found.');
        }

      });
    }

    function appendPre(message) {
      var pre = document.getElementById('output');
      var textContent = document.createTextNode(message + '\n');
      pre.appendChild(textContent);
    }
  }

  handleAuthClick() {
    gapi.auth.authorize(
      {client_id: this.CLIENT_ID, scope: this.SCOPES, immediate: false},
      this.handleAuthResult);
    return false;
  }
}
