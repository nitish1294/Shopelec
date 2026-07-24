import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  // Flipkart-style: redirect to login, remembering where they were going
  router.navigate(['/login'], { queryParams: { redirect: state.url } });
  return false;
};
