import { Injectable } from '@angular/core';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';

declare var $: any;

// Avoid name not found warnings
let Auth0Lock = require('auth0-lock').default;

@Injectable()
export class AuthService {

    // Configure Auth0
    lock = new Auth0Lock('9AX3hBcDf8Hh3tobK2G6t3CYj7T8p7pZ', 'bhan.auth0.com', {});
    jwtHelper: JwtHelper = new JwtHelper();

    constructor(
      private router: Router,
      private http: Http
    ) {
      // set lock event listener in constructor
      this.lock.on("authenticated", (authResult) => {
        this.lock.getUserInfo(authResult.accessToken, (error, profile) => {
          if (error) { console.log("error on authentication"); }
          localStorage.setItem('id_token', authResult.idToken);
          this.getOrCreateUser(profile);
        });
      });
    }

    getOrCreateUser(profile) {
      var that = this;
      $.when(this.getUser(profile.user_id)).done(function (response) {
        if (response._body === "null") {
          $.when(that.createUser(profile.user_id)).done(function (response) {
            localStorage.setItem("user_id", JSON.parse(response._body).id);
            that.router.navigateByUrl('/private/(aux:list)');
          });
        } else {
          localStorage.setItem("user_id", JSON.parse(response._body).id);
          that.router.navigateByUrl('/private/(aux:list)');
        }
      });
    }

    login() {
      // Call the show method to display the widget.
      this.lock.show();
    }

    authenticated() {
      // Check if there's an unexpired JWT
      // This searches for an item in localStorage with key == 'id_token'
      return tokenNotExpired();
    }

    logout() {
      localStorage.removeItem('id_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('selectedCategoryId');
      this.router.navigate(['login']);
    }

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
