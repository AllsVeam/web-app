/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Not Found Component
import { NotFoundComponent } from './not-found/not-found.component';


import { WebAppComponent } from './web-app.component';  // asegúrate de importar correctamente
import { LoginComponent } from './login/login.component';  // si tienes uno
import { HomeComponent } from './home/home.component';

/**
 * Fallback to this route when no prior route is matched.
 */
const routes: Routes = [
  {
    path: 'login2',
    component: WebAppComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

/**
 * App Routing Module.
 *
 * Configures the fallback route.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
