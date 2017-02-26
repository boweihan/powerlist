import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task';
import { Category } from '../../models/category';
import { CalendarService } from '../../services/calendar-service/calendar.service';
import { TaskService } from '../../services/task-service/task.service';
import { CategoryService } from '../../services/category-service/category.service';

declare var $: any;
declare var flatpickr: any;
declare var bootbox: any;

@Component({
  selector: 'app-list',
  providers: [CalendarService, TaskService, CategoryService],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  tasks = [];
  categories = [];
  selectedCategoryId = null;
  colors = ['#f5cbbc', '#ccccff', '#b3ffb3', '#ffffb3']

  constructor(
    private calendarService: CalendarService,
    private taskService: TaskService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    flatpickr('.flatpickrStart', { utc: true, enableTime: true });
    flatpickr('.flatpickrEnd', { utc: true, enableTime: true });

    $('.js-category-description').toggleClass('active'); // activate home category

    this.initializeCategories();
    this.initializeCategoryTasks(true);
  }

  initializeCategoryTasks(isFirstLoad) {
    if (!this.selectedCategoryId) {
      this.initializeAllTasks(isFirstLoad);
    } else {
      var that = this;
      $.when(this.categoryService.getCategoryTasks(this.selectedCategoryId)).done(function (response) {
        that.tasks.length = 0;
        let tasks = JSON.parse(response._body);
        for (var i = 0; i < tasks.length; i++) {
          tasks[i] = that.appendIfOverdue(tasks[i]);
          that.insertIntoTasksObject(tasks[i]);
        }
      });
    }
  }

  initializeAllTasks(isFirstLoad) {
    var that = this;
    $.when(this.taskService.getTasksForUser(localStorage.getItem("user_id"))).done(function (response) {
      let tasks = JSON.parse(response._body);
      that.tasks.length = 0;
      for (var i = 0; i < tasks.length; i++) {
        tasks[i] = that.appendIfOverdue(tasks[i]);
        that.insertIntoTasksObject(tasks[i]);
        if (isFirstLoad) { that.calendarService.appendTaskToCalendar(tasks[i]); }
      }
    });
  }

  appendIfOverdue(task) {
    var date = new Date();
    var offsetInMillis = date.getTimezoneOffset()*60*1000;
    if (Date.parse(task.end) < (date.getTime() - offsetInMillis)) { task.overdue = true; }
    return task;
  }

  addTask(taskInput, startDateInput, endDateInput, event) {
    let that = this;
    if(event.keyCode == 13 || event.type === "click") {
      if(taskInput.value && startDateInput.value && endDateInput.value) {
        if (Date.parse(startDateInput.value) < Date.parse(endDateInput.value)) {
          let task = new Task(null,
                              taskInput.value,
                              taskInput.value,
                              startDateInput.value,
                              endDateInput.value,
                              null,
                              parseInt(this.selectedCategoryId),
                              parseInt(localStorage.getItem("user_id")),
                              this.colors[Math.floor(Math.random() * 4)],
                              false);
          $.when(this.taskService.createTask(task)).done(function (response) {
            let realTask = that.appendIfOverdue(JSON.parse(response._body));
            that.insertIntoTasksObject(realTask);
            that.calendarService.appendTaskToCalendar(realTask); // this passes the task ID as the fullcalendarID
            taskInput.value = startDateInput.value = endDateInput.value = null;
          });
        } else { bootbox.alert("Task start date can't be after the end date!"); }
      } else { bootbox.alert('Please fill out all form fields.'); }
    }
  }

  insertIntoTasksObject(task) { // refactor this later
    let afterPrevious, beforeNext;
    let currentNumTasks = this.tasks.length;
    for (var i = 0; i <= currentNumTasks; i++) {
      if (this.tasks[i]) { afterPrevious = Date.parse(this.tasks[i].end) > Date.parse(task.end); }
      if (this.tasks[i+1]) { beforeNext = Date.parse(this.tasks[i+1].end) > Date.parse(task.end); }
      if ((afterPrevious || i === this.tasks.length) && (beforeNext || i === this.tasks.length)) {
        this.tasks.splice(i, 0, task); break;
      }
    }
  }

  removeTask(task) {
    this.taskService.deleteTask(task.id); // race condition here between ui and db, maybe change?
    this.calendarService.removeTaskFromCalendar(task);
    for (var i = 0; i < this.tasks.length; i ++) {
      if (this.tasks[i] === task) { this.tasks.splice(i, 1); }
    }
  }

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
    let that = this;
    if(event.keyCode == 13 || event.type === "click") {
      if(categoryInput.value) {
        let category = new Category(null,
                                    categoryInput.value,
                                    parseInt(localStorage.getItem("user_id")));
        $.when(this.categoryService.createCategory(category)).done(function (response) {
          let realCategory = JSON.parse(response._body);
          that.categories.push(realCategory);
          that.hideCategoryInput(realCategory);
          categoryInput.value = null;
        });
      } else { bootbox.alert('Please enter a category.'); }
    }
  }

  selectCategory(event, category) {
    if (!category) {
      this.initializeAllTasks(false);
      this.selectedCategoryId = null;
      $('.js-category-title').text('Home'); // don't hardcode strings
    } else {
      this.initializeCategoryTasks(false);
      this.selectedCategoryId = category.id;
      $('.js-category-title').text(category.name);
    }
    this.clearActiveCategories();
    $(event.currentTarget).addClass('active');
  }

  toggleEdit(id, type) {
    var prev, inputBox;

    if (type === "category") {
      prev = $(".category-" + id);
      inputBox = $(".category-" + id + "-input");
    } else {
      prev = $(".task-" + id);
      inputBox = $(".task-" + id + "-input");
    }

    prev.toggleClass('display-none');

    if (type === "category") {
      inputBox.toggleClass('display-inline');
      if (inputBox.hasClass('display-inline')) {
        inputBox.val(prev.text()).focus();
      }
    } else if (type === "task") {
      inputBox.toggleClass('display-block');
      if (inputBox.hasClass('display-block')) {
        inputBox.val(prev.clone().children().remove().end().text()).focus();
      }
    }
  }

  updateCategory(event, category_id) { // refactor this with update task
    if(event.keyCode == 13) {
      if($(event.currentTarget).val()) {
        let params = { 'name':$(event.currentTarget).val() }
        this.categoryService.updateCategory(category_id, params); // doesn't need to wait for server response
        this.updateCategorySuperficially(category_id, $(event.currentTarget).val());
        this.toggleEdit(category_id, 'category');
      } else {
        bootbox.alert('Category name must not be empty');
      }
    }
  }

  updateTask(event, task_id) {
    if(event.keyCode == 13) {
      if($(event.currentTarget).val()) {
        let params = { 'title':$(event.currentTarget).val() }
        this.taskService.updateTask(task_id, params); // doesn't need to wait for server response
        this.updateTaskSuperficially(task_id, $(event.currentTarget).val());
        this.toggleEdit(task_id, 'task');
      } else {
        bootbox.alert('Task title must not be empty');
      }
    }
  }

  updateTaskSuperficially(task_id, title) {
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === task_id) {
        this.tasks[i].title = title; return;
      }
    }
  }

  updateCategorySuperficially(category_id, name) {
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].id === category_id) {
        this.categories[i].name = name; return;
      }
    }
  }

  deleteCategory(category, event) {
    let that = this;
    event.stopPropagation();
    bootbox.confirm("Are you sure you want to delete category: " + category.name + "?", function(response) {
      if (response) {
        if (category.id === that.selectedCategoryId) { that.selectedCategoryId = null; } // if you delete current category
        $.when(that.categoryService.deleteCategory(category.id)).done(function (response) {
          for (let i = 0; i < that.categories.length; i++) {
            if (that.categories[i] === category) { that.categories.splice(i, 1); }
          }
          that.initializeCategoryTasks(false);
        })
      }
    });
  }

  showCategoryInput() {
    $('.js-category-label').hide();
    $('.js-category-input').show();
    $('input.js-category-input').focus();
  }

  hideCategoryInput(categoryInput) {
    categoryInput.value = null;
    $('.js-category-input').hide();
    $('.js-category-label').show();
  }

  clearActiveCategories() {
    var categoryElements = $('.js-category-description');
    for (var i = 0; i < categoryElements.length; i++) {
      if ($(categoryElements[i]).hasClass('active')) {
        $(categoryElements[i]).removeClass('active');
      }
    }
  }
}
