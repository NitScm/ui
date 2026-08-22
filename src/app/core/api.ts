import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Session } from './session';
import {
  ApiError,
  AuditRecord,
  PolicyBundle,
  Stats,
  Task,
  TaskDetail,
  WhoAmI,
} from './models';

/** Filters for the task list. */
export interface TaskFilters {
  state?: string;
  kind?: string;
  repository?: string;
  branch?: string;
  limit?: number;
}

/** Filters for the audit log. */
export interface AuditFilters {
  user?: string;
  repository?: string;
  requestId?: string;
  since?: string;
  limit?: number;
}

/**
 * Api is the typed client for the nit operations API.
 *
 * Every method goes through the same error translation, so a component never
 * has to deal with an HttpErrorResponse: it gets the server's `ApiError`, whose
 * `code` is the stable thing to branch on.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);

  whoami(server?: string, token?: string): Observable<WhoAmI> {
    // Login has to verify a credential before storing it, so it passes the
    // server and token explicitly rather than reading the session.
    const url = `${(server ?? this.session.server()).replace(/\/+$/, '')}/v1/whoami`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return this.http.get<WhoAmI>(url, { headers }).pipe(catchError(translate));
  }

  stats(): Observable<Stats> {
    return this.http.get<Stats>(this.session.url('/v1/admin/stats')).pipe(catchError(translate));
  }

  tasks(filters: TaskFilters = {}): Observable<Task[]> {
    let params = new HttpParams();

    if (filters.state) params = params.set('state', filters.state);
    if (filters.kind) params = params.set('kind', filters.kind);
    if (filters.repository) params = params.set('repository', filters.repository);
    if (filters.branch) params = params.set('branch', filters.branch);
    params = params.set('limit', String(filters.limit ?? 100));

    return this.http
      .get<Task[]>(this.session.url('/v1/admin/tasks'), { params })
      .pipe(catchError(translate));
  }

  task(id: string): Observable<TaskDetail> {
    return this.http
      .get<TaskDetail>(this.session.url(`/v1/admin/tasks/${encodeURIComponent(id)}`))
      .pipe(catchError(translate));
  }

  audit(filters: AuditFilters = {}): Observable<AuditRecord[]> {
    let params = new HttpParams();

    if (filters.user) params = params.set('user', filters.user);
    if (filters.repository) params = params.set('repository', filters.repository);
    if (filters.requestId) params = params.set('request_id', filters.requestId);
    if (filters.since) params = params.set('since', filters.since);
    params = params.set('limit', String(filters.limit ?? 200));

    return this.http
      .get<AuditRecord[]>(this.session.url('/v1/admin/audit'), { params })
      .pipe(catchError(translate));
  }

  policy(): Observable<PolicyBundle> {
    return this.http
      .get<PolicyBundle>(this.session.url('/v1/admin/policy'))
      .pipe(catchError(translate));
  }
}

/**
 * translate turns a transport failure into the server's own error shape.
 *
 * A server that answered with something other than the documented envelope — a
 * proxy error page, a load balancer's HTML, or nothing at all because the host
 * is unreachable — must still produce a message an operator can act on rather
 * than "Http failure response for ...".
 */
function translate(error: HttpErrorResponse): Observable<never> {
  if (error.error && typeof error.error === 'object' && 'code' in error.error) {
    return throwError(() => error.error as ApiError);
  }

  if (error.status === 0) {
    return throwError(
      () =>
        ({
          code: 'unreachable',
          message: 'Could not reach the server. Is nitd running, and is this origin in NIT_CORS_ORIGINS?',
        }) satisfies ApiError,
    );
  }

  if (error.status === 404) {
    return throwError(
      () =>
        ({
          code: 'not_found',
          message: 'Not found. Is this account in one of the server\'s NIT_ADMIN_GROUPS?',
        }) satisfies ApiError,
    );
  }

  return throwError(
    () => ({ code: `http_${error.status}`, message: error.message }) satisfies ApiError,
  );
}
