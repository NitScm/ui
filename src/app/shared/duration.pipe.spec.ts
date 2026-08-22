import { Duration } from './duration.pipe';

describe('Duration', () => {
  const pipe = new Duration();

  it('renders nothing for a task that never ran', () => {
    // Zero is not "0ms": a queued task has no duration at all, and showing one
    // would suggest it ran instantly.
    expect(pipe.transform(0)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform(null)).toBe('—');
  });

  it('keeps milliseconds whole', () => {
    expect(pipe.transform(1)).toBe('1ms');
    expect(pipe.transform(999)).toBe('999ms');
  });

  it('switches to seconds with one decimal', () => {
    expect(pipe.transform(1000)).toBe('1.0s');
    expect(pipe.transform(59_400)).toBe('59.4s');
  });

  it('switches to minutes with zero-padded seconds', () => {
    // Padding is what keeps a column of durations aligned enough to compare.
    expect(pipe.transform(60_000)).toBe('1m00s');
    expect(pipe.transform(125_000)).toBe('2m05s');
    expect(pipe.transform(3_600_000)).toBe('60m00s');
  });
});
