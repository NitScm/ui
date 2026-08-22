import { Relative } from './relative.pipe';

describe('Relative', () => {
  const pipe = new Relative();

  const ago = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString();

  it('handles missing and malformed timestamps', () => {
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('not a date')).toBe('—');
  });

  it('collapses the last few seconds', () => {
    expect(pipe.transform(ago(0))).toBe('just now');
    expect(pipe.transform(ago(5))).toBe('just now');
  });

  it('scales through seconds, minutes, hours and days', () => {
    expect(pipe.transform(ago(30))).toBe('30s ago');
    expect(pipe.transform(ago(300))).toBe('5m ago');
    expect(pipe.transform(ago(7200))).toBe('2h ago');
    expect(pipe.transform(ago(3 * 86_400))).toBe('3d ago');
  });

  it('never reports a negative age', () => {
    // Clock skew between the server and the browser is normal; "in 4s ago"
    // would read as a bug in nit rather than a few seconds of drift.
    const future = new Date(Date.now() + 4000).toISOString();

    expect(pipe.transform(future)).toBe('just now');
  });
});
