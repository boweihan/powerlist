import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task';
import { Category } from '../../models/category';
import { CalendarService } from '../../services/calendar-service/calendar.service';
import { TaskService } from '../../services/task-service/task.service';
import { CategoryService } from '../../services/category-service/category.service';

declare var $: any;
declare var flatpickr: any;

@Component({
  selector: 'app-list',
  providers: [CalendarService, TaskService, CategoryService],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  tasks = [];
  categories = [];

  constructor(
    private calendarService: CalendarService,
    private taskService: TaskService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    flatpickr('.flatpickrStart', { utc: true, enableTime: true });
    flatpickr('.flatpickrEnd', { utc: true, enableTime: true });

    this.initializeCategories();

    // sucks because we're using localstorage so we need this
    localStorage.removeItem("selectedCategoryId");
    // worthless logic at the moment
    let currentCategoryId = localStorage.getItem("selectedCategoryId");
    if (!currentCategoryId) {
      this.initializeAllTasks(true);
    } else {
      this.initializeCategoryTasks(currentCategoryId);
    }
  }

  initializeCategoryTasks(categoryId) {
    var that = this;
    $.when(this.categoryService.getCategoryTasks(categoryId)).done(function (response) {
      that.tasks.length = 0;
      let tasks = JSON.parse(response._body);
      for (var i = 0; i < tasks.length; i++) {
        that.tasks.push(tasks[i]);
      }
    });
  }

  initializeAllTasks(firstTime) {
    var that = this;
    $.when(this.taskService.getTasksForUser(localStorage.getItem("user_id"))).done(function (response) {
      let tasks = JSON.parse(response._body);
      that.tasks.length = 0;
      for (var i = 0; i < tasks.length; i++) {
        that.tasks.push(tasks[i]);
        if (firstTime) { that.calendarService.appendTaskToCalendar(tasks[i]); }
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

  // category logic
  initializeCategories() {
    var that = this;
    $.when(this.categoryService.getCategoriesForUser(localStorage.getItem("user_id"))).done(function (response) {
      let categories = JSON.parse(response._body);
      for (var i = 0; i < categories.length; i++) {
        that.categories.push(categories[i]);
      }
    });
  }

  addCategory(categoryInput, event) {
    if(event.keyCode == 13 || event.type === "click") {
      if(categoryInput.value) {
        let category = new Category(null, categoryInput.value, parseInt(localStorage.getItem("user_id")));
        this.categoryService.createCategory(category);
        this.categories.push(category);
        categoryInput.value = null;
      } else {
        alert('Please enter a category');
      }
    }
  }

  selectCategory(event) {
    var that = this;
    if (event.currentTarget.innerText === "Home") {
      this.initializeAllTasks(false);
    } else {
      $.when(this.categoryService.getCategoryByName(event.currentTarget.innerText)).done(function (response) {
        localStorage.setItem("selectedCategoryId", JSON.parse(response._body).id);
        that.initializeCategoryTasks(JSON.parse(response._body).id);
      });
    }
  }
}
