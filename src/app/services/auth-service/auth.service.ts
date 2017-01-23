import { Injectable } from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { Router } from '@angular/router';

// Avoid name not found warnings
let Auth0Lock = require('auth0-lock').default;

@Injectable()
export class AuthService {

    // Configure Auth0
    lock = new Auth0Lock('9AX3hBcDf8Hh3tobK2G6t3CYj7T8p7pZ', 'bhan.auth0.com', {});

    constructor(
      private router: Router
    ) {
      // Add callback for lock `authenticated` event
      this.lock.on("authenticated", (authResult) => {
        localStorage.setItem('id_token', authResult.idToken);
        // redirect to private page, after authenticated event;
        this.router.navigateByUrl('/private/(aux:list)');
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
      // Remove token from localStorage
      localStorage.removeItem('id_token');
      // redirect to login page
      this.router.navigate(['login']);
    }
}
