import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { LoginComponent } from './components/login/login.component';
import { AppComponent } from './components/main/app.component';
import { PrivateComponent } from './components/private/private.component';
import { AppRoutes } from './shared/routes';

const routes: Routes = [
  {
    path: '',
    redirectTo: AppRoutes.main,
    pathMatch: 'full'
  },
  {
    path: AppRoutes.login,
    component: LoginComponent,
  },
  {
    path: AppRoutes.private,
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
