import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { LoginComponent } from './components/login/login.component';
import { AppComponent } from './components/main/app.component';
import { PrivateComponent } from './components/private/private.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/private/(aux:list)',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'private',
    component: PrivateComponent,
    children: [
        { path: 'list', component: ListComponent, outlet: 'aux' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AllergyClientRoutingModule { }
