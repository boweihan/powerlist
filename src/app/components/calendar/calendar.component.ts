import { Component, OnInit } from '@angular/core';
import { GmailService } from '../../services/gmail-service/gmail.service';

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
    this.gmailService.checkAuth();
  }

}
