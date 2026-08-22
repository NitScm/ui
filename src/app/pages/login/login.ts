import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../core/api';
import { ApiError } from '../../core/models';
import { Session } from '../../core/session';

@Component({
  selector: 'nit-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly api = inject(Api);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly server = signal(this.session.server());
  readonly token = signal('');
  readonly error = signal<ApiError | null>(null);
  readonly busy = signal(false);

  submit(): void {
    const server = this.server().trim();
    const token = this.token().trim();

    if (!token) {
      this.error.set({ code: 'no_token', message: 'A token is required.' });
      return;
    }

    this.busy.set(true);
    this.error.set(null);

    // The credential is verified before it is stored. Storing an unverified
    // token means the failure surfaces later, on some unrelated screen, where
    // it is indistinguishable from half a dozen other problems.
    this.api.whoami(server, token).subscribe({
      next: (identity) => {
        this.session.signIn(server, token, identity);
        this.busy.set(false);

        const next = this.route.snapshot.queryParamMap.get('next') ?? '/';
        this.router.navigateByUrl(next);
      },
      error: (error: ApiError) => {
        this.busy.set(false);
        this.error.set(error);
      },
    });
  }
}
