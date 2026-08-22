import { Component, input } from '@angular/core';
import { TaskState } from '../core/models';

/**
 * StateBadge renders a task state.
 *
 * Colour carries the same meaning everywhere in the console: amber means
 * waiting, blue means working, red means it needs a human. Green is deliberately
 * quiet — a succeeded task is the common case and does not need to compete for
 * attention with the two that do.
 */
@Component({
  selector: 'nit-state-badge',
  template: `<span class="badge" [class]="state()">{{ state() }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      border: 1px solid transparent;
    }

    .queued {
      color: var(--warn);
      background: color-mix(in srgb, var(--warn) 14%, transparent);
      border-color: color-mix(in srgb, var(--warn) 35%, transparent);
    }

    .running {
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      border-color: color-mix(in srgb, var(--accent) 35%, transparent);
    }

    .succeeded {
      color: var(--muted);
      background: color-mix(in srgb, var(--muted) 12%, transparent);
      border-color: var(--border);
    }

    .failed {
      color: var(--danger);
      background: color-mix(in srgb, var(--danger) 14%, transparent);
      border-color: color-mix(in srgb, var(--danger) 35%, transparent);
    }

    .cancelled {
      color: var(--muted);
      background: transparent;
      border-color: var(--border);
    }
  `,
})
export class StateBadge {
  readonly state = input.required<TaskState>();
}
