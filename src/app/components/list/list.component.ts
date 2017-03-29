import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task';
import { Category } from '../../models/category';
import { CalendarService } from '../../services/calendar-service/calendar.service';
import { TaskService } from '../../services/task-service/task.service';
import { CategoryService } from '../../services/category-service/category.service';
import { Colors } from '../../shared/app-colors';

declare let $: any;
declare let flatpickr: any;
declare let bootbox: any;

@Component({
    selector: 'app-list',
    providers: [CalendarService, TaskService, CategoryService],
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

    private tasks = [];
    private categories = [];
    private selectedCategoryId = null;
    private colors = [Colors.lightPink, Colors.lightBlue, Colors.lightGreen, Colors.lightYellow]

    constructor(
        private calendarService: CalendarService,
        private taskService: TaskService,
        private categoryService: CategoryService
    ) { }

    ngOnInit() {
        this.initializeUI();
        this.initializeCategories();
        this.fetchTasks(true);
    }

    initializeUI() {
        flatpickr('.flatpickrStart', { utc: true, enableTime: true });
        flatpickr('.flatpickrEnd', { utc: true, enableTime: true });
        $('.js-category-description').toggleClass('active');
    }

    fetchTasks(firstLoad) {
        if (!this.selectedCategoryId) {
            this.fetchHomeTasks(firstLoad);
        } else {
            let that = this;
            this.taskService.getCategoryTasks(this.selectedCategoryId).subscribe(
                tasks => {
                    that.tasks = []; // javascript garbage collects
                    for (let i = 0; i < tasks.length; i++) {
                        that.insertIntoTasksObject(tasks[i]);
                    }
                }
            )
        }
    }

    fetchHomeTasks(firstLoad) {
        let that = this;
        this.taskService.getTasksForUser(localStorage.getItem("user_id")).subscribe(
            tasks => {
                that.tasks = [];
                for (let i = 0; i < tasks.length; i++) {
                    that.insertIntoTasksObject(tasks[i]);
                    if (firstLoad) {
                        that.calendarService.appendTaskToCalendar(tasks[i]);
                    }
                }
            }
      )
    }

    addTask(taskInput, startDateInput, endDateInput, event) {
        let that = this;
        if(!(event.keyCode == 13 || event.type === "click")) {
            return;
        }
        if(!(taskInput.value && startDateInput.value && endDateInput.value)) {
            bootbox.alert('Please fill out all form fields.');
            return;
        }
        if (Date.parse(startDateInput.value) > Date.parse(endDateInput.value)) {
            bootbox.alert("Task start date can't be after the end date!");
            return;
        }
        let task = new Task(null, taskInput.value, taskInput.value, startDateInput.value,
                            endDateInput.value, null, parseInt(this.selectedCategoryId),
                            parseInt(localStorage.getItem("user_id")),
                            this.colors[Math.floor(Math.random() * 4)], false);
        this.taskService.createTask(task).subscribe(
            task => {
                that.insertIntoTasksObject(task);
                that.calendarService.appendTaskToCalendar(task); // this passes the task ID as the fullcalendarID
                taskInput.value = startDateInput.value = endDateInput.value = null; // clear values
            }
        )
    }

    insertIntoTasksObject(task) {
        let afterPrevious, beforeNext, numTasks = this.tasks.length;
        task = this.addTagIfOverdue(task);
        for (let i = 0; i <= numTasks; i++) {
            if (this.tasks[i]) {
                afterPrevious = Date.parse(this.tasks[i].end) > Date.parse(task.end);
            }
            if (this.tasks[i+1]) {
                beforeNext = Date.parse(this.tasks[i+1].end) > Date.parse(task.end);
            }
            if ((afterPrevious || i === this.tasks.length) && (beforeNext || i === this.tasks.length)) {
                this.tasks.splice(i, 0, task); break;
            }
        }
    }

    addTagIfOverdue(task) {
        let date = new Date();
        let offsetInMillis = date.getTimezoneOffset()*60000;
        if (Date.parse(task.end) < (date.getTime() - offsetInMillis)) {
            task.overdue = true;
        }
        return task;
    }

    removeTask(task) {
        this.taskService.deleteTask(task.id).subscribe(
            callback => {
                for (let i = 0; i < this.tasks.length; i++) {
                    if (this.tasks[i] === task) {
                        this.tasks.splice(i, 1);
                    }
                }
                this.calendarService.removeTaskFromCalendar(task);
            }
        )
    }

    initializeCategories() {
        let that = this;
        this.categoryService.getCategoriesForUser(localStorage.getItem("user_id")).subscribe(
            categories => {
                for (let i = 0; i < categories.length; i++) {
                    that.categories.push(categories[i]);
                }
            }
        )
    }

    addCategory(categoryInput, event) {
        let that = this;
        if (!(event.keyCode == 13 || event.type === "click")) {
            return;
        }
        if(categoryInput.value) {
            bootbox.alert('Please enter a category.');
        }
        let category = new Category(null, categoryInput.value,
                                    parseInt(localStorage.getItem("user_id")));
        this.categoryService.createCategory(category).subscribe(
            category => {
                that.categories.push(category);
                that.hideCategoryInput(category); // TODO: replace this with in-place edit library
                categoryInput.value = null;
            }
        )
    }

    selectCategory(element, boundCategoryTitle, category) {
        if (!category) {
            this.selectedCategoryId = null;
            this.fetchHomeTasks(false);
            boundCategoryTitle.textContent = "Home";
        } else {
            this.selectedCategoryId = category.id;
            this.fetchTasks(false);
            boundCategoryTitle.textContent = category.name;
        }
        this.setActiveCategory(element);
    }

    setActiveCategory(element) {
        // use jquery to process multiple elements of same class
        let categoryElements = $('.js-category-description');
        for (let i = 0; i < categoryElements.length; i++) {
            if ($(categoryElements[i]).hasClass('active')) {
                $(categoryElements[i]).removeClass('active');
            }
        }
        $(element).addClass('active');
    }

    // continue refactoring below
    toggleEdit(id, type) {
        let name, container, input;

        if (type === "category") {
            name = $(".category-" + id);
            container = $(".category-" + id + "-container");
            input = $(".category-" + id + "-input");
            name.toggleClass('display-none');
            container.toggleClass('display-none');
            container.toggleClass('display-inline');
            if (container.hasClass('display-inline')) {
                input.val(name.text()).focus();
            }
        } else if (type === "task") {
            bootbox.alert('This feature is in development.');
        }
    }

    updateCategory(event, categoryId, boundCategoryTitle) { // refactor this with update task
        if(event.keyCode != 13) {
            return;
        }
        if($(event.currentTarget).val()) {
            let updatedName = $(event.currentTarget).val();
            let params = {
                'name':updatedName
            };
            this.categoryService.updateCategory(categoryId, params); // doesn't need to wait for server response
            this.updateCategorySuperficially(categoryId, updatedName, boundCategoryTitle);
            this.toggleEdit(categoryId, 'category');
        } else {
            bootbox.alert('Category name must not be empty');
        }
    }

    updateTask(event, taskId) {
        if(event.keyCode != 13) {
            return;
        }
        if($(event.currentTarget).val()) {
            let params = {
                'title':$(event.currentTarget).val()
            };
            this.taskService.updateTask(taskId, params); // doesn't need to wait for server response
            this.updateTaskSuperficially(taskId, $(event.currentTarget).val());
            this.toggleEdit(taskId, 'task');
        } else {
            bootbox.alert('Task title must not be empty');
        }
    }

    updateTaskSuperficially(taskId, title) {
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === taskId) {
                this.tasks[i].title = title;
                return;
            }
        }
    }

    updateCategorySuperficially(categoryId, name, boundCategoryTitle) {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].id === categoryId) {
                this.categories[i].name = name;
                if (this.selectedCategoryId === categoryId) {
                    boundCategoryTitle.textContent = name;
                }
                return;
            }
        }
    }

    deleteCategory(category) {
        let that = this;
        bootbox.confirm("Delete category: " + category.name + "?", function(response) {
            if (response) {
                if (category.id === that.selectedCategoryId) {
                    that.selectedCategoryId = null;
                }
                that.categoryService.deleteCategory(category.id).subscribe(
                    callback => {
                        for (let i = 0; i < that.categories.length; i++) {
                            if (that.categories[i] === category) {
                                that.categories.splice(i, 1);
                            }
                        }
                        that.fetchTasks(false);
                    }
                )
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

    stopPropagation(event) {
        event.stopPropagation();
    }
}
