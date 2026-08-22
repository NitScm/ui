import { Pipe, PipeTransform } from '@angular/core';

/**
 * Duration renders milliseconds the way an operator scans them: enough
 * precision to compare two rows, never more digits than the eye can use.
 */
@Pipe({ name: 'duration' })
export class Duration implements PipeTransform {
  transform(ms: number | undefined | null): string {
    if (!ms) {
      return '—';
    }

    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }

    if (ms < 60_000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }

    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);

    return `${minutes}m${String(seconds).padStart(2, '0')}s`;
  }
}
