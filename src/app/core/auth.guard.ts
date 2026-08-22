import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from './session';

/**
 * authGuard keeps unauthenticated visitors on the login screen.
 *
 * It is a convenience, not a control: the token is what the server checks, and
 * a guard that can be bypassed by editing localStorage protects nothing. Its
 * job is to avoid showing an operator a dashboard full of failed requests.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(Session);
  const router = inject(Router);

  if (session.authenticated()) {
    return true;
  }

  // Remember where they were going, so login lands them there.
  return router.createUrlTree(['/login'], { queryParams: { next: state.url } });
};
