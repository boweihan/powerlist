import { Component, OnInit, OnChanges } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';

declare let System: any;
declare let Electricity: any;

@Component({
  selector: 'app-login',
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnChanges {

  constructor(
      private authService: AuthService,
  ) {}

  ngOnChanges() { }

  ngOnInit() {
      this.initElectricity();
  }

  initElectricity() {
      let electricity = new Electricity();
      electricity.init();
  }
}
