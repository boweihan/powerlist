import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service/category.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  providers: [CategoryService],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  categories = [];

  constructor(
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.initializeCategories();
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
    $.when(this.categoryService.getCategoryByName(event.currentTarget.innerText)).done(function (response) {
      localStorage.setItem("selectedCategoryId", JSON.parse(response._body).id);
    });
  }
}
