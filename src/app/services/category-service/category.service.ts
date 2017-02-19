import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category';

@Injectable()
export class CategoryService {

  constructor(
    private http: Http
  ) { }

  getCategoryTasks(categoryId) { // move this to task service eventually
    return this.http
      .get("https://calm-inlet-47809.herokuapp.com/get_category_tasks?category_id=" + categoryId)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  createCategory(Category) {
    delete Category["id"]
    return this.http
      .post("https://calm-inlet-47809.herokuapp.com/categories", Category)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getCategoryByName(name) {
    return this.http
      .get("https://calm-inlet-47809.herokuapp.com/find_category?name=" + name)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getCategories() {
    return this.http
      .get("https://calm-inlet-47809.herokuapp.com/categories")
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getCategoriesForUser(user_id) {
    return this.http
      .get("https://calm-inlet-47809.herokuapp.com/find_user_categories?user_id=" + user_id)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  deleteCategory(category_id) {
    return this.http
      .delete("https://calm-inlet-47809.herokuapp.com/categories/" + category_id)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    return res;
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }

}
