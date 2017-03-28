import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User } from '../../models/user';
import { Observable } from 'rxjs/Rx';
import { Config } from '../../shared/app-config';

@Injectable()
export class UserService {

  constructor(
      private http: Http
  ) {}

  getUser(username) : Observable<User> {
      return this.http.get(Config.baseUrl + "/find_user?username=" + username)
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'getUser error'));
  }

  createUser(username) : Observable<User> {
      return this.http.post(Config.baseUrl + "/users", { username: username })
          .map((res:Response) => res.json())
          .catch((error:any) => Observable.throw(error.json().error || 'createUser error'));
  }
}
