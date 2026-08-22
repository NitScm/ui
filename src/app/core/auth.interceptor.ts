import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Session } from './session';

/**
 * authInterceptor attaches the operator's token to every request, and signs out
 * when the server says the credential is no longer good.
 *
 * A request that already carries an Authorization header is left alone: the
 * login screen verifies a token before it is stored, and must not have the old
 * one substituted underneath it.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(Session);
  const router = inject(Router);

  const token = session.token();

  const authorized =
    token && !request.headers.has('Authorization')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorized).pipe(
    tap({
      error: (error: { status?: number }) => {
        // 401 means the credential itself is finished — expired, revoked,
        // unknown. Anything else, including a 403, is about this particular
        // request and must not throw the operator out of the console.
        if (error?.status === 401 && session.authenticated()) {
          session.signOut();
          router.navigate(['/login']);
        }
      },
    }),
  );
};
