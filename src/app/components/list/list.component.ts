import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task';
import { CalendarService } from '../../services/calendar-service/calendar.service';
import { TaskService } from '../../services/task-service/task.service';

declare var $: any;
declare var flatpickr: any;

@Component({
  selector: 'app-list',
  providers: [CalendarService, TaskService],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  tasks = [];

  constructor(
    private calendarService: CalendarService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    flatpickr('.flatpickrStart', { utc: true, enableTime: true });
    flatpickr('.flatpickrEnd', { utc: true, enableTime: true });
    this.initializeTasks();
  }

  initializeTasks() {
    var that = this;
    $.when(this.taskService.getTasksForUser(localStorage.getItem("user_id"))).done(function (response) {
      let tasks = JSON.parse(response._body);
      for (var i = 0; i < tasks.length; i++) {
        that.tasks.push(tasks[i]);
        that.calendarService.appendTaskToCalendar(tasks[i]);
      }
    });
  }

  addTask(taskInput, startDateInput, endDateInput, event) {
    if(event.keyCode == 13 || event.type === "click") {
      if(taskInput.value && startDateInput.value && endDateInput.value) {
        let task = new Task(null, taskInput.value, startDateInput.value, endDateInput.value, null, parseInt(localStorage.getItem("selectedCategoryId")), parseInt(localStorage.getItem("user_id"))); // gotta change this to category id
        this.taskService.createTask(task);
        this.tasks.push(task);
        this.calendarService.appendTaskToCalendar(task);
        taskInput.value = startDateInput.value = endDateInput.value = null;
      } else {
        alert('please fill out all form fields');
      }
    }
  }

  removeTask(task) {
    this.taskService.deleteTask(task.id); // race condition here between ui and db, maybe change?
    for (var i = 0; i < this.tasks.length; i ++) {
      if (this.tasks[i] === task) {
        this.tasks.splice(i, 1);
      }
    }
  }
}
