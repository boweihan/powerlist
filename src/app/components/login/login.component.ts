import { Component, OnInit, OnChanges } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-login',
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnChanges {

  constructor(
    private authService: AuthService,
  ) { }

  ngOnChanges() { }

  ngOnInit() {}
}
