import { Component, OnInit } from '@angular/core';
import { GmailService } from '../../services/gmail-service/gmail.service';

declare var $: any;

@Component({
  selector: 'app-calendar',
  providers: [GmailService],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  constructor(
    private gmailService: GmailService
  ) { }

  ngOnInit() {
    // this.gmailService.checkAuth();
    $('.fullcalendar').fullCalendar({
      header: { center: 'listDay, listWeek, month' },
      editable: false,
      buttonText: {
                      today: 'today',
                      month: 'month',
                      week: 'week',
                      day: 'day',
                      listWeek: 'week (list)',
                      listDay: 'day (list)'
                  }
    });
  }

}
