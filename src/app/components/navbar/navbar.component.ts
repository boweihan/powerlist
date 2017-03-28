import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
    selector: 'app-navbar',
    providers: [AuthService],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    constructor(
      private authService: AuthService
    ) { }

    ngOnInit() {}

}
