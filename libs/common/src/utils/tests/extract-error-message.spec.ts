import { extractErrorMessage } from '../extract-error-message';

describe('extractErrorMessage', () => {
  it('returns the message when it is a non-empty string', () => {
    expect(extractErrorMessage({ message: 'not found' }, 'fallback')).toBe(
      'not found',
    );
  });

  it('returns the message when it is a non-empty array', () => {
    expect(
      extractErrorMessage({ message: ['a', 'b'] }, 'fallback'),
    ).toEqual(['a', 'b']);
  });

  it('falls back with the error code appended when message is an empty string', () => {
    expect(
      extractErrorMessage({ message: '', code: 'ECONNREFUSED' }, 'fallback'),
    ).toBe('fallback (ECONNREFUSED)');
  });

  it('falls back with the error code appended when message is an empty array', () => {
    expect(
      extractErrorMessage({ message: [], code: 'ECONNREFUSED' }, 'fallback'),
    ).toBe('fallback (ECONNREFUSED)');
  });

  it('falls back to the plain fallback when there is no message and no code', () => {
    expect(extractErrorMessage({}, 'fallback')).toBe('fallback');
  });

  it('falls back to the plain fallback for non-object errors', () => {
    expect(extractErrorMessage('boom', 'fallback')).toBe('fallback');
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback');
    expect(extractErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});
