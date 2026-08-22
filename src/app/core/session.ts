import { Injectable, computed, signal } from '@angular/core';
import { WhoAmI } from './models';

const SERVER_KEY = 'nit.server';
const TOKEN_KEY = 'nit.token';

/**
 * Session holds the operator's server URL, token and identity.
 *
 * The token lives in localStorage. That is a deliberate, bounded choice: the
 * console is an internal operations tool, the API is read-only, and the
 * alternative — a cookie — would need CSRF protection on an API that is
 * otherwise stateless. It is worth stating plainly rather than leaving implied,
 * because it means any script running on this origin can read the token, so the
 * console must never load third-party code.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly serverSignal = signal(localStorage.getItem(SERVER_KEY) ?? defaultServer());
  private readonly tokenSignal = signal(localStorage.getItem(TOKEN_KEY) ?? '');
  private readonly identitySignal = signal<WhoAmI | null>(null);

  readonly server = this.serverSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly identity = this.identitySignal.asReadonly();

  readonly authenticated = computed(() => this.tokenSignal().length > 0);

  /** Whether the account may read the operations API. */
  readonly isOperator = signal(false);

  signIn(server: string, token: string, identity: WhoAmI): void {
    const normalized = server.replace(/\/+$/, '');

    localStorage.setItem(SERVER_KEY, normalized);
    localStorage.setItem(TOKEN_KEY, token);

    this.serverSignal.set(normalized);
    this.tokenSignal.set(token);
    this.identitySignal.set(identity);
  }

  setIdentity(identity: WhoAmI | null): void {
    this.identitySignal.set(identity);
  }

  signOut(): void {
    localStorage.removeItem(TOKEN_KEY);

    this.tokenSignal.set('');
    this.identitySignal.set(null);
    this.isOperator.set(false);
  }

  /** Builds an absolute URL for an API path. */
  url(path: string): string {
    return `${this.serverSignal()}${path}`;
  }
}

/**
 * The server defaults to the origin serving the console, which is correct in
 * production where the two are deployed together. During development the front
 * end runs on its own port and proxies /v1 to the API, so the same empty base
 * URL still works.
 */
function defaultServer(): string {
  return '';
}
