import { Component, OnInit } from '@angular/core';
import { Task } from '../../models/task';
import { Category } from '../../models/category';
import { CalendarService } from '../../services/calendar-service/calendar.service';
import { TaskService } from '../../services/task-service/task.service';
import { CategoryService } from '../../services/category-service/category.service';
import { Colors } from '../../shared/app-colors';
import { AuthService } from '../../services/auth-service/auth.service';

declare let $: any;
declare let flatpickr: any;
declare let bootbox: any;

@Component({
    selector: 'app-list',
    providers: [CalendarService, TaskService, CategoryService, AuthService],
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
        private categoryService: CategoryService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        if (this.authService.isAuthenticated()) { // redirect is done in /private, this just prevents extra loading
            this.initLoadingModal();
            this.initializeUI();
            this.initializeCategories();
            this.fetchTasks(true, null, null);
        }
    }

    initializeUI() {
        flatpickr('.flatpickrStart', { utc: true, enableTime: true });
        flatpickr('.flatpickrEnd', { utc: true, enableTime: true });
        $('.js-category-description').toggleClass('active');
        $('#listModal').on('show.bs.modal', function (event) {
            var button = $(event.relatedTarget) // Button that triggered the modal
            var taskId = button.data('taskid') // Extract info from data-* attributes
            var title = button.data('title') // Extract info from data-* attributes
            var modal = $(this)
            modal.find('.modal-body #task-title').val(title);
            modal.find('.hidden-id').val(taskId);
        })
    }

    fetchTasks(firstLoad, boundCategoryTitle, category) {
        if (!this.selectedCategoryId) {
            this.fetchHomeTasks(firstLoad, boundCategoryTitle);
        } else {
            let that = this;
            this.showLoadingModalAfterTimeout();
            this.taskService.getCategoryTasks(this.selectedCategoryId).subscribe(
                tasks => {
                    that.tasks = []; // javascript garbage collects
                    for (let i = 0; i < tasks.length; i++) {
                        that.insertIntoTasksObject(tasks[i]);
                    }
                    if (boundCategoryTitle) {
                        boundCategoryTitle.textContent = category;
                    }
                    $('.boop').hide();
                },
                err => {
                    bootbox.alert("Server error, you may be disconnected from the internet");
                }
            )
        }
    }

    fetchHomeTasks(firstLoad, boundCategoryTitle) {
        let that = this;
        this.showLoadingModalAfterTimeout();
        this.taskService.getTasksForUser(localStorage.getItem("user_id")).subscribe(
            tasks => {
                that.tasks = [];
                for (let i = 0; i < tasks.length; i++) {
                    that.insertIntoTasksObject(tasks[i]);
                    if (firstLoad) {
                        that.calendarService.appendTaskToCalendar(tasks[i]);
                    }
                    if (boundCategoryTitle) {
                        boundCategoryTitle.textContent = "Home";
                    }
                    $('.boop').hide();
                }
            },
            err => {
                bootbox.alert("Server error, you may be disconnected from the internet");
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
        if(!categoryInput.value) {
            bootbox.alert('Please enter a category.');
            return;
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

    selectCategory(boundCategory, boundCategoryTitle, category) {
        if (!category) {
            this.selectedCategoryId = null;
            this.fetchHomeTasks(false, boundCategoryTitle);
        } else {
            this.selectedCategoryId = category.id;
            this.fetchTasks(false, boundCategoryTitle, category.name);
        }
        this.setActiveCategory(boundCategory);
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

    editCategory(id) {
        let name, container, input;

        name = $(".category-" + id);
        container = $(".category-" + id + "-container");
        input = $(".category-" + id + "-input");
        name.toggleClass('display-none');
        container.toggleClass('display-none');
        container.toggleClass('display-inline');
        if (container.hasClass('display-inline')) {
            input.val(name.text()).focus();
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
            this.categoryService.updateCategory(categoryId, params).subscribe(
                category => {
                    this.editCategory(category.id); // toggle inline edit back
                    this.updateCategorySuperficially(category, boundCategoryTitle);
                }
            )
        } else {
            bootbox.alert('Category name must not be empty.');
        }
    }

    updateCategorySuperficially(category, boundCategoryTitle) {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].id === category.id) {
                this.categories[i].name = category.name; // this has to be a shallow object copy to avoid async re-rendering so category can stay selected
                if (this.selectedCategoryId === category.id) {
                    boundCategoryTitle.textContent = category.name;
                    let newCategory = document.getElementsByClassName('js-category-reselect-' + category.id);
                    this.setActiveCategory(newCategory);
                }
                return;
            }
        }
    }

    updateTask(boundTitle, boundStart, boundEnd, boundHiddenId) {
        let title = $(boundTitle).val();
        let start = $(boundStart).val();
        let end = $(boundEnd).val();
        let id = parseInt($(boundHiddenId).val());
        if (title || start || end || id) {
            let params = {};
            if (title) { params['title'] = title; }
            if (start) { params['start'] = start; }
            if (end) { params['end'] = end; }
            this.taskService.updateTask(id, params).subscribe(
                task => {
                    this.updateTaskSuperficially(task);
                    $('#listModal').modal('hide');
                },
                err => {
                    bootbox.alert('Something went wrong :(')
                }
            )
        } else {
            bootbox.alert('Please fill in at least 1 edit field.');
        }
    }

    updateTaskSuperficially(task) {
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === task.id) {
                this.tasks[i] = task;
                this.calendarService.removeTaskFromCalendar(task);
                this.calendarService.appendTaskToCalendar(task); // update calendar after changing task
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
                        that.fetchTasks(false, null, null); // this will cause category tasks to load twice
                    },
                    err => {
                        bootbox.alert('Unable to delete category that has tasks associated with it.');
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

    removeModalValues(dom1, dom2, dom3, dom4) {
        dom1.value = dom2.value = dom3.value = dom4.value = null; // NOTE: lol
    }

    initLoadingModal() { // this should be in a parent component
        $('.boop').loadingModal({
          position: 'fixed',
          text: '',
          color: '#fff',
          opacity: '0.7',
          backgroundColor: 'rgb(0,0,0)',
          animation: 'cubeGrid'
        });
    }

    showLoadingModal() {
        $('.boop').show();
    }

    showLoadingModalAfterTimeout() {
        setTimeout(this.showLoadingModal(), 1000);
    }
}
