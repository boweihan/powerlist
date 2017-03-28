import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Category } from '../../models/category';
import { Observable } from 'rxjs/Rx';
import { Config } from '../../shared/app-config';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CategoryService {

  constructor(
    private http: Http
  ) {}

  createCategory(Category) {
      delete Category["id"] // server doesn't like seeing id property
      return this.http.post(Config.baseUrl + "/categories", Category)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'createCategory error'));
  }

  getCategoryByName(name) {
      return this.http.get(Config.baseUrl + "/find_category?name=" + name)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getCategoryByName error'));
  }

  getCategories() {
      return this.http.get(Config.baseUrl + "/categories")
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getCategories error'));
  }

  getCategoriesForUser(userId) {
      return this.http.get(Config.baseUrl + "/find_user_categories?user_id=" + userId)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getCategoriesForUser error'));
  }

  deleteCategory(categoryId) {
      return this.http.delete(Config.baseUrl + "/categories/" + categoryId)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'deleteCategory error'));
  }

  updateCategory(categoryId, params) {
      return this.http.patch(Config.baseUrl + "/categories/" + categoryId, params)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'updateCategory error'));
  }
}
