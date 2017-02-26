import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Task } from '../../models/task';

@Injectable()
export class TaskService {

  constructor(
    private http: Http
  ) { }

  createTask(Task) {
    delete Task["id"]
    return this.http
      .post("https://calm-inlet-47809.herokuapp.com/tasks", Task)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getTasks() {
    return this.http
      .get("https://calm-inlet-47809.herokuapp.com/tasks")
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getTasksForUser(user_id) {
    return this.http
      .get("https://calm-inlet-47809.herokuapp.com/find_user_tasks?user_id=" + user_id)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  deleteTask(task_id) {
    return this.http
      .delete("https://calm-inlet-47809.herokuapp.com/tasks/" + task_id)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  updateTask(task_id, params) {
    return this.http
      .patch("https://calm-inlet-47809.herokuapp.com/tasks/" + task_id, params)
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
