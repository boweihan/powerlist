import { Injectable } from '@angular/core';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { UserService } from '../../services/user-service/user.service';
import { Config } from '../../shared/app-config';
import { AppRoutes } from '../../shared/routes';
import { Router } from '@angular/router';

let Auth0Lock = require('auth0-lock').default; // Avoid name not found warnings
declare var $: any;

@Injectable()
export class AuthService {

    private lock = new Auth0Lock(Config.authOKey, Config.authOUser, {});
    jwtHelper: JwtHelper = new JwtHelper(); // TODO: what is this syntax

    constructor(
        private router: Router,
        private userService: UserService
    ) {
        this.createLockEventListeners();
    }

    createLockEventListeners() {
        this.lock.on("authenticated", (authResult) => {
            this.lock.getUserInfo(authResult.accessToken, (error, profile) => {
                if (!error) {
                    localStorage.setItem('id_token', authResult.idToken);
                    this.initialize(profile);
                } // TODO: implement error handling
            });
        });
    }

    initialize(profile) {
        var that = this;
        var username = profile.user_id;
        this.userService.getUser(username).subscribe(
            user => {
                if (user) {
                    that.handleUserLogin(user);
                } else {
                    that.userService.createUser(username).subscribe(
                        user => {
                            that.handleUserLogin(user);
                        }
                    )
                }
            }
        )
    }

    handleUserLogin(user) {
        localStorage.setItem("user_id", user.id);
        this.router.navigateByUrl(AppRoutes.main); // TODO: implement router object
    }

    isAuthenticated() {
        return tokenNotExpired();
    }

    login() {
        this.lock.show();
    }

    logout() {
        localStorage.clear();
        this.router.navigate([AppRoutes.login]);
    }
}
