import { Injectable } from '@angular/core';

declare var $: any;

@Injectable()
export class CalendarService {

  constructor() { }

  appendTaskToCalendar(task) {
    $('.fullcalendar').fullCalendar('renderEvent', task, true);
  }
}
