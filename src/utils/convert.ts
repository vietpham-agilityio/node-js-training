import { HEADER_TITLE_MAP } from '@/constants';
import { Effect } from 'effect';

/**
 * Converts a string from snake_case to camelCase.
 * @example
 * toCamelCase('hello_world') // 'helloWorld'
 * @param {string} str - The string to convert.
 * @returns {string} The converted string.
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively converts an object from snake_case to camelCase.
 * If the object is an array, it will recursively convert all items in the array.
 * @example
 * keysToCamel({
 *   hello_world: 'hello world',
 *   snake_case_array: [
 *     { foo_bar: 'foo bar' },
 *     { baz_qux: 'baz qux' },
 *   ],
 * }) // { helloWorld: 'hello world', snakeCaseArray: [ { fooBar: 'foo bar' }, { bazQux: 'baz qux' } ] }
 * @param {any} obj - The object to convert.
 * @returns {any} The converted object.
 */
export const keysToCamel = <T = any>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamel(item)) as any;
  }

  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key);
      const value = obj[key];
      result[camelKey] = keysToCamel(value);
      return result;
    }, {} as any);
  }

  return obj;
};

/**
 * Effect that returns the title for a given pathname from the HEADER_TITLE_MAP.
 * If the pathname is not found in the map, it searches for the first key that the pathname starts with and returns the corresponding title.
 * @param pathname - The pathname to get the title for.
 * @returns Effect resolving to the title, or undefined if not found.
 */
export const getHeaderTitleEffect = (
  pathname: string,
): Effect.Effect<string | undefined> =>
  Effect.if(pathname in HEADER_TITLE_MAP, {
    onTrue: () =>
      Effect.succeed(
        HEADER_TITLE_MAP[pathname as keyof typeof HEADER_TITLE_MAP],
      ),
    onFalse: () =>
      Effect.succeed(
        Object.entries(HEADER_TITLE_MAP).find(([key]) =>
          pathname.startsWith(key),
        )?.[1],
      ),
  });

/**
 * Returns the title for a given pathname from the HEADER_TITLE_MAP.
 * If the pathname is not found in the map, it will search for the first key that the pathname starts with and return the corresponding title.
 * @param pathname - The pathname to get the title for.
 * @returns The title for the given pathname, or undefined if not found.
 */
export const getHeaderTitle = (pathname: string): string | undefined =>
  Effect.runSync(getHeaderTitleEffect(pathname));

/**
 * Effect that normalizes a pathname: trims slashes and appends `/index` for single-segment paths (e.g. `/profile` → `profile/index`).
 */
const normalizePathnameEffect = (pathname: string): Effect.Effect<string> => {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');

  return Effect.if(!trimmed.includes('/'), {
    onTrue: () => Effect.succeed(`${trimmed}/index`),
    onFalse: () => Effect.succeed(trimmed),
  });
};

const normalizePathname = (pathname: string): string =>
  Effect.runSync(normalizePathnameEffect(pathname));

const screenToRegex = (screen: string) =>
  new RegExp(
    '^' + normalizePathname(screen).replace(/\[.*?\]/g, '[^/]+') + '$',
  );

export const isScreenPathname = (pathname: string, screen: string): boolean => {
  return screenToRegex(screen).test(normalizePathname(pathname));
};

/**
 * Capitalizes the first letter of a string.
 * @example
 * capitalize('hello') // 'Hello'
 * capitalize('WORLD') // 'WORLD'
 * capitalize('active') // 'Active'
 * @param {string | undefined | null} str - The string to capitalize.
 * @returns {string} The capitalized string, or empty string if input is falsy.
 */
export const capitalizeEffect = (str: string): Effect.Effect<string> =>
  Effect.if(!str, {
    onTrue: () => Effect.succeed(''),
    onFalse: () => Effect.succeed(str.charAt(0).toUpperCase() + str.slice(1)),
  });

export const capitalize = (str: string): string =>
  Effect.runSync(capitalizeEffect(str));
