import {
  getHeaderTitle,
  getHeaderTitleEffect,
  isScreenPathname,
  keysToCamel,
  toCamelCase,
} from '../convert';
import { Effect } from 'effect';

// Mock constants
jest.mock('@/constants', () => ({
  HEADER_TITLE_MAP: {
    '/signup': 'Create New Your Account',
    '/confirm-account': 'Confirm New Account',
    '/checkout': 'Checkout Movie',
    '/tickets/': 'Ticket Details',
    '/profile/edit': 'Edit Your Profile',
  },
}));

describe('toCamelCase', () => {
  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });

  it('should handle multiple underscores', () => {
    expect(toCamelCase('hello_world_test')).toBe('helloWorldTest');
  });

  it('should handle single word', () => {
    expect(toCamelCase('hello')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(toCamelCase('')).toBe('');
  });

  it('should handle string with no underscores', () => {
    expect(toCamelCase('helloWorld')).toBe('helloWorld');
  });
});

describe('keysToCamel', () => {
  it('should convert object keys from snake_case to camelCase', () => {
    const input = {
      hello_world: 'test',
      foo_bar: 'baz',
    };
    const result = keysToCamel(input);
    expect(result).toEqual({
      helloWorld: 'test',
      fooBar: 'baz',
    });
  });

  it('should handle nested objects', () => {
    const input = {
      user_name: 'John',
      user_data: {
        first_name: 'John',
        last_name: 'Doe',
      },
    };
    const result = keysToCamel(input);
    expect(result).toEqual({
      userName: 'John',
      userData: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });
  });

  it('should handle arrays', () => {
    const input = [
      { first_name: 'John', last_name: 'Doe' },
      { first_name: 'Jane', last_name: 'Smith' },
    ];
    const result = keysToCamel(input);
    expect(result).toEqual([
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Smith' },
    ]);
  });

  it('should handle arrays with nested objects', () => {
    const input = {
      users: [
        { user_id: 1, user_name: 'John' },
        { user_id: 2, user_name: 'Jane' },
      ],
    };
    const result = keysToCamel(input);
    expect(result).toEqual({
      users: [
        { userId: 1, userName: 'John' },
        { userId: 2, userName: 'Jane' },
      ],
    });
  });

  it('should handle primitive values', () => {
    expect(keysToCamel('string')).toBe('string');
    expect(keysToCamel(123)).toBe(123);
    expect(keysToCamel(null)).toBe(null);
    expect(keysToCamel(undefined)).toBe(undefined);
  });

  it('should handle Date objects', () => {
    const date = new Date();
    expect(keysToCamel(date)).toBe(date);
  });

  it('should handle empty object', () => {
    expect(keysToCamel({})).toEqual({});
  });

  it('should handle empty array', () => {
    expect(keysToCamel([])).toEqual([]);
  });
});

describe('getHeaderTitle', () => {
  it('should return title for exact pathname match', () => {
    expect(getHeaderTitle('/signup')).toBe('Create New Your Account');
  });

  it('should return title for pathname that starts with key', () => {
    expect(getHeaderTitle('/tickets/123')).toBe('Ticket Details');
  });

  it('should return undefined for non-matching pathname', () => {
    expect(getHeaderTitle('/unknown')).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(getHeaderTitle('')).toBeUndefined();
  });

  it('should return first matching title when multiple keys match', () => {
    // This tests the find() behavior - returns first match
    expect(getHeaderTitle('/profile/edit')).toBe('Edit Your Profile');
  });
});

describe('getHeaderTitleEffect', () => {
  it('should return title for exact pathname match', () => {
    expect(Effect.runSync(getHeaderTitleEffect('/signup'))).toBe(
      'Create New Your Account',
    );
  });

  it('should return title for pathname that starts with key', () => {
    expect(Effect.runSync(getHeaderTitleEffect('/tickets/123'))).toBe(
      'Ticket Details',
    );
  });

  it('should return undefined for non-matching pathname', () => {
    expect(Effect.runSync(getHeaderTitleEffect('/unknown'))).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(Effect.runSync(getHeaderTitleEffect(''))).toBeUndefined();
  });
});

describe('isScreenPathname', () => {
  it('should return true for exact match', () => {
    expect(isScreenPathname('profile/index', 'profile/index')).toBe(true);
  });

  it('should return true for normalized pathname match', () => {
    expect(isScreenPathname('/profile', 'profile/index')).toBe(true);
  });

  it('should return false for non-matching pathname', () => {
    expect(isScreenPathname('profile/edit', 'profile/index')).toBe(false);
  });

  it('should handle pathname with dynamic segments', () => {
    expect(isScreenPathname('movies/123', 'movies/[id]')).toBe(true);
    expect(isScreenPathname('movies/abc', 'movies/[id]')).toBe(true);
  });

  it('should handle pathname with multiple dynamic segments', () => {
    expect(isScreenPathname('tickets/123/456', 'tickets/[id]/[subId]')).toBe(
      true,
    );
  });

  it('should return false for pathname that does not match pattern', () => {
    expect(isScreenPathname('movies/123/details', 'movies/[id]')).toBe(false);
  });

  it('should normalize pathname with trailing slash', () => {
    expect(isScreenPathname('/profile/', 'profile/index')).toBe(true);
  });

  it('should normalize pathname with leading slash', () => {
    expect(isScreenPathname('/profile', 'profile/index')).toBe(true);
  });

  it('should handle empty pathname', () => {
    expect(isScreenPathname('', 'profile/index')).toBe(false);
  });

  it('should handle empty screen', () => {
    expect(isScreenPathname('profile/index', '')).toBe(false);
  });
});
