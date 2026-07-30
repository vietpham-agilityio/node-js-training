import { extractRpcErrorMessage } from './rpc-error-message.util';

describe('extractRpcErrorMessage', () => {
  it('returns the message when it is a non-empty string', () => {
    expect(extractRpcErrorMessage({ message: 'not found' }, 'fallback')).toBe(
      'not found',
    );
  });

  it('returns the message when it is a non-empty array', () => {
    expect(
      extractRpcErrorMessage({ message: ['a', 'b'] }, 'fallback'),
    ).toEqual(['a', 'b']);
  });

  it('falls back with the error code appended when message is an empty string', () => {
    expect(
      extractRpcErrorMessage({ message: '', code: 'ECONNREFUSED' }, 'fallback'),
    ).toBe('fallback (ECONNREFUSED)');
  });

  it('falls back with the error code appended when message is an empty array', () => {
    expect(
      extractRpcErrorMessage({ message: [], code: 'ECONNREFUSED' }, 'fallback'),
    ).toBe('fallback (ECONNREFUSED)');
  });

  it('falls back to the plain fallback when there is no message and no code', () => {
    expect(extractRpcErrorMessage({}, 'fallback')).toBe('fallback');
  });

  it('falls back to the plain fallback for non-object errors', () => {
    expect(extractRpcErrorMessage('boom', 'fallback')).toBe('fallback');
    expect(extractRpcErrorMessage(null, 'fallback')).toBe('fallback');
    expect(extractRpcErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});
