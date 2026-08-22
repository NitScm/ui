import { Pipe, PipeTransform } from '@angular/core';

/**
 * Relative renders a timestamp as an age.
 *
 * "3m ago" is what an operator is actually reading for — whether something is
 * recent — and it needs no mental arithmetic against the current time. The exact
 * timestamp stays available as a tooltip wherever this is used.
 */
@Pipe({ name: 'relative' })
export class Relative implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return '—';
    }

    const then = new Date(value).getTime();
    if (Number.isNaN(then)) {
      return '—';
    }

    const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;

    return new Date(value).toLocaleDateString();
  }
}
