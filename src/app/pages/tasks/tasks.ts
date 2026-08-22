import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { ApiError, Task } from '../../core/models';
import { Duration } from '../../shared/duration.pipe';
import { Relative } from '../../shared/relative.pipe';
import { StateBadge } from '../../shared/state-badge';

@Component({
  selector: 'nit-tasks',
  imports: [FormsModule, RouterLink, StateBadge, Duration, Relative],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly api = inject(Api);

  readonly tasks = signal<Task[]>([]);
  readonly error = signal<ApiError | null>(null);
  readonly loading = signal(true);

  readonly state = signal('');
  readonly kind = signal('');
  readonly repository = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.api
      .tasks({
        state: this.state() || undefined,
        kind: this.kind() || undefined,
        repository: this.repository().trim() || undefined,
        limit: 200,
      })
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
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
    this.state.set('');
    this.kind.set('');
    this.repository.set('');
    this.load();
  }
}
