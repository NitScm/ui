import { TestBed } from '@angular/core/testing';
import { Session } from './session';
import { WhoAmI } from './models';

const identity: WhoAmI = {
  user: 'alice',
  email: 'alice@example.com',
  groups: ['platform'],
  policy_version: 'sha256:abcd',
};

describe('Session', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts unauthenticated', () => {
    const session = TestBed.inject(Session);

    expect(session.authenticated()).toBe(false);
    expect(session.identity()).toBeNull();
  });

  it('persists the credential across a reload', () => {
    TestBed.inject(Session).signIn('https://nit.example.com', 'nit_secret', identity);

    // A fresh injector stands in for a page reload.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const reloaded = TestBed.inject(Session);

    expect(reloaded.authenticated()).toBe(true);
    expect(reloaded.token()).toBe('nit_secret');
    expect(reloaded.server()).toBe('https://nit.example.com');
  });

  it('normalizes a trailing slash on the server URL', () => {
    // Otherwise every request would go to "https://host//v1/...", which some
    // proxies answer and others do not.
    const session = TestBed.inject(Session);
    session.signIn('https://nit.example.com/', 'nit_secret', identity);

    expect(session.server()).toBe('https://nit.example.com');
    expect(session.url('/v1/whoami')).toBe('https://nit.example.com/v1/whoami');
  });

  it('forgets the token on sign out', () => {
    const session = TestBed.inject(Session);
    session.signIn('https://nit.example.com', 'nit_secret', identity);

    session.signOut();

    expect(session.authenticated()).toBe(false);
    expect(session.identity()).toBeNull();
    expect(localStorage.getItem('nit.token')).toBeNull();
  });

  it('keeps the server after sign out', () => {
    // Signing out is not "I am moving to another deployment": remembering the
    // server means the next sign-in only asks for the token.
    const session = TestBed.inject(Session);
    session.signIn('https://nit.example.com', 'nit_secret', identity);

    session.signOut();

    expect(session.server()).toBe('https://nit.example.com');
  });
});
