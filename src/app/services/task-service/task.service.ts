import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Task } from '../../models/task';
import { Observable } from 'rxjs/Rx';
import { Config } from '../../shared/app-config';

@Injectable()
export class TaskService {

  constructor(
    private http: Http
  ) { }

  createTask(Task) {
      delete Task["id"] // server doesn't like id property
      return this.http.post(Config.baseUrl + "/tasks", Task)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'createTask error'));
  }

  getTasks() {
      return this.http.get(Config.baseUrl + "/tasks")
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getTasks error'));
  }

  getTasksForUser(userId) {
      return this.http.get(Config.baseUrl + "/find_user_tasks?user_id=" + userId)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getTasksForUser error'));
  }

  deleteTask(taskId) {
      return this.http.delete(Config.baseUrl + "/tasks/" + taskId)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'deleteTask error'));
  }

  updateTask(taskId, params) {
      return this.http.patch(Config.baseUrl + "/tasks/" + taskId, params)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'updateTask error'));
  }

  getCategoryTasks(categoryId) : Observable<Task[]> {
      return this.http.get(Config.baseUrl + "/get_category_tasks?category_id=" + categoryId)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getCategoryTasks error'));
  }
}
