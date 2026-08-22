import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { ApiError, Stats, Task } from '../../core/models';
import { Relative } from '../../shared/relative.pipe';
import { StateBadge } from '../../shared/state-badge';

/** How often the dashboard refreshes itself. */
const REFRESH_MS = 5000;

@Component({
  selector: 'nit-dashboard',
  imports: [RouterLink, StateBadge, Relative],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly api = inject(Api);
  private timer?: ReturnType<typeof setInterval>;

  readonly stats = signal<Stats | null>(null);
  readonly active = signal<Task[]>([]);
  readonly error = signal<ApiError | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();

    // Polling, not a live stream. The dashboard answers "is anything stuck?",
    // and a five-second lag on that question costs nothing — while a websocket
    // would add a connection to keep alive, reconnect and authorize.
    this.timer = setInterval(() => this.load(), REFRESH_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  load(): void {
    this.api.stats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });

    // Queued and running tasks are what an operator looks at first: everything
    // else is history.
    this.api.tasks({ limit: 20 }).subscribe({
      next: (tasks) =>
        this.active.set(tasks.filter((task) => task.state === 'queued' || task.state === 'running')),
      error: () => this.active.set([]),
    });
  }

  count(state: string): number {
    return this.stats()?.tasks?.[state] ?? 0;
  }
}
