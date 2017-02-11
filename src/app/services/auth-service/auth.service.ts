import { Injectable } from '@angular/core';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { Router } from '@angular/router';

// Avoid name not found warnings
let Auth0Lock = require('auth0-lock').default;

@Injectable()
export class AuthService {

    // Configure Auth0
    lock = new Auth0Lock('9AX3hBcDf8Hh3tobK2G6t3CYj7T8p7pZ', 'bhan.auth0.com', {});
    jwtHelper: JwtHelper = new JwtHelper();

    constructor(
      private router: Router
    ) {
      // set lock event listener in constructor
      this.lock.on("authenticated", (authResult) => {
        this.lock.getUserInfo(authResult.accessToken, (error, profile) => {
          if (error) {
            console.log("error on authentication");
          }
          localStorage.setItem("profile", JSON.stringify(profile)); // TODO: store this in user db
          localStorage.setItem('id_token', authResult.idToken);
          this.router.navigateByUrl('/private/(aux:list)');
        });
      });
    }

    public login() {
      // Call the show method to display the widget.
      this.lock.show();
    }

    public authenticated() {
      // Check if there's an unexpired JWT
      // This searches for an item in localStorage with key == 'id_token'
      return tokenNotExpired();
    }

    public logout() {
      localStorage.removeItem('id_token');
      this.router.navigate(['login']);
    }
}
