import { Component, OnInit, inject, signal } from '@angular/core';
import { Api } from '../../core/api';
import { ApiError, PolicyBundle } from '../../core/models';

@Component({
  selector: 'nit-policy',
  templateUrl: './policy.html',
  styleUrl: './policy.scss',
})
export class Policy implements OnInit {
  private readonly api = inject(Api);

  readonly bundle = signal<PolicyBundle | null>(null);
  readonly error = signal<ApiError | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.api.policy().subscribe({
      next: (bundle) => {
        this.bundle.set(bundle);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });
  }
}
