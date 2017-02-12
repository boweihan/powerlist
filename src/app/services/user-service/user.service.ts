import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {

  constructor(
    private http: Http
  ) { }

  getUser(username) {
    return this.http
      .get("http://localhost:3000/find_user?username=" + username)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  createUser(username) {
    return this.http
      .post("http://localhost:3000/users", { username: username })
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getTasks() {
    return this.http
      .get("http://localhost:3000/users")
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
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
