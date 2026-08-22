import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { ApiError, AuditRecord } from '../../core/models';
import { Relative } from '../../shared/relative.pipe';

/** Time windows an investigation actually uses. */
const WINDOWS = [
  { label: 'Last hour', hours: 1 },
  { label: 'Last 24 hours', hours: 24 },
  { label: 'Last 7 days', hours: 24 * 7 },
  { label: 'Last 30 days', hours: 24 * 30 },
  { label: 'All time', hours: 0 },
];

@Component({
  selector: 'nit-audit',
  imports: [FormsModule, RouterLink, Relative],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class Audit implements OnInit {
  private readonly api = inject(Api);

  readonly windows = WINDOWS;

  readonly records = signal<AuditRecord[]>([]);
  readonly error = signal<ApiError | null>(null);
  readonly loading = signal(true);

  readonly user = signal('');
  readonly repository = signal('');
  readonly requestId = signal('');
  readonly hours = signal(24);
  readonly deniedOnly = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const hours = Number(this.hours());
    const since = hours > 0 ? new Date(Date.now() - hours * 3600_000).toISOString() : undefined;

    this.api
      .audit({
        user: this.user().trim() || undefined,
        repository: this.repository().trim() || undefined,
        requestId: this.requestId().trim() || undefined,
        since,
        limit: 500,
      })
      .subscribe({
        next: (records) => {
          // The denied-only filter is applied here rather than server-side: the
          // API returns a bounded page, and narrowing it further in the browser
          // costs nothing while keeping the query surface small.
          this.records.set(
            this.deniedOnly() ? records.filter((record) => record.effect === 'deny') : records,
          );
          this.error.set(null);
          this.loading.set(false);
        },
        error: (error: ApiError) => {
          this.error.set(error);
          this.loading.set(false);
        },
      });
  }

  reset(): void {
    this.user.set('');
    this.repository.set('');
    this.requestId.set('');
    this.hours.set(24);
    this.deniedOnly.set(false);
    this.load();
  }
}
