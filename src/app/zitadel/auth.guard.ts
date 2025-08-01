import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  /*
  const token = authService.getAccessToken();
  if (!token) {
    return router.parseUrl('/login');
  }

  if (authService.isAccessTokenExpired()) {
    return authService.refreshToken().then(
      () => {
        return true;
      },
      () => {
        return router.parseUrl('/login');
      }
    );
  }
    */
  return true;
};
