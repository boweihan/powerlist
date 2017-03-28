/* main is only used as an entry point, for bootstrapping the application.
some service classes get injected here if needed in other service classes */

import { UserService } from '../../services/user-service/user.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  providers: [UserService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}
