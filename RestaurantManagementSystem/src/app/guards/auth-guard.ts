import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const authService = inject(Auth);
  const router = inject(Router);
  if (!authService.isTokenValid()) {

    authService.logout();

    router.navigate(['/login']);

    return false;
  }

  const userRole = authService.getRole();

  const allowedRoles = route.data['roles'] as string[];

  if (!allowedRoles?.includes(userRole!)) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};