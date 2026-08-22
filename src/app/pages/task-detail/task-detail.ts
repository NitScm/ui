import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { ApiError, AuditRecord, TaskDetail } from '../../core/models';
import { Duration } from '../../shared/duration.pipe';
import { StateBadge } from '../../shared/state-badge';

@Component({
  selector: 'nit-task-detail',
  imports: [RouterLink, StateBadge, Duration],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss',
})
export class TaskDetailPage implements OnInit {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);

  readonly task = signal<TaskDetail | null>(null);
  readonly audit = signal<AuditRecord[]>([]);
  readonly error = signal<ApiError | null>(null);
  readonly loading = signal(true);

  readonly payload = computed(() => pretty(this.task()?.payload));
  readonly result = computed(() => pretty(this.task()?.result));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.api.task(id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);

        // The audit trail for this operation is the answer to "why did this
        // happen?", so it belongs next to the task rather than a search away.
        this.loadAudit(task);
      },
      error: (error: ApiError) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });
  }

  private loadAudit(task: TaskDetail): void {
    const payload = task.payload as { request_id?: string } | undefined;
    const requestId = payload?.request_id;

    if (!requestId) {
      return;
    }

    this.api.audit({ requestId, limit: 100 }).subscribe({
      next: (records) => this.audit.set(records),
      error: () => this.audit.set([]),
    });
  }
}

/** pretty renders a spec for reading, or nothing when there is none. */
function pretty(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
