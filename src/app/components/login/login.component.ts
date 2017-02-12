import { Component, OnInit, OnChanges } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnChanges {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnChanges() {
  }

  ngOnInit() {
    // if (this.authService.authenticated()) {
    //   this.router.navigateByUrl('/private/(aux:list)');
    // }
  }

}
