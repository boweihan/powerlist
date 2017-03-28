import { Component, OnInit, OnChanges } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import { AppRoutes } from '../../shared/routes';

@Component({
    selector: 'app-private',
    providers: [AuthService],
    templateUrl: './private.component.html',
    styleUrls: ['./private.component.css']
})
export class PrivateComponent implements OnInit, OnChanges {

  constructor(
      private authService: AuthService,
      private router: Router
  ) { }

  ngOnChanges() {
  }

  ngOnInit() {
      if (!this.authService.isAuthenticated()) { // TODO: use subscriber to logout whenever offline
          this.router.navigate([AppRoutes.login]);
      }
  }

}
