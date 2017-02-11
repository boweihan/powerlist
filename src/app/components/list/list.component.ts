import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task';
import { CalendarService } from '../../services/calendar-service/calendar.service';

declare var $: any;
declare var flatpickr: any;

@Component({
  selector: 'app-list',
  providers: [CalendarService],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  tasks = [];

  constructor(
    private calendarService: CalendarService
  ) { }

  ngOnInit() {
    flatpickr('.flatpickr', {
      enableTime: true
    });
  }

  addTask(taskInput, event) {
    if(event.keyCode == 13) {
      var task = new Task(1, taskInput.value, "date", false, (new Date).toISOString(), null, null);
      this.tasks.push(task);
      this.calendarService.appendTaskToCalendar(task);
      taskInput.value = null;
    }
  }

  removeTask(task) {
    for (var i = 0; i < this.tasks.length; i ++) {
      if (this.tasks[i] === task) {
        this.tasks.splice(i, 1);
      }
    }
  }
}
