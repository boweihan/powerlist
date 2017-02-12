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
    flatpickr('.flatpickrStart', {
      utc: true,
      enableTime: true
    });
    flatpickr('.flatpickrEnd', {
      utc: true,
      enableTime: true
    });
  }

  addTask(taskInput, startDateInput, endDateInput, event) {
    if(event.keyCode == 13 || event.type === "click") {
      if(taskInput.value && startDateInput.value && endDateInput.value) {
        var task = new Task(1, taskInput.value, "date", false, startDateInput.value, endDateInput.value, null);
        this.tasks.push(task);
        this.calendarService.appendTaskToCalendar(task);
        taskInput.value = startDateInput.value = endDateInput.value = null;
      } else {
        alert('please fill out all form fields');
      }
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
