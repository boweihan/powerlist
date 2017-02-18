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
      buttonText: { month: 'Month', listWeek: 'Week', listDay: 'Day' },
      eventColor: '#DB4C3F',
      height: "auto"
    });
  }

}
