import { HEADER_TITLE_MAP } from '@/constants';

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
 * Returns the title for a given pathname from the HEADER_TITLE_MAP.
 * If the pathname is not found in the map, it will search for the first key that the pathname starts with and return the corresponding title.
 * @param {string} pathname - The pathname to get the title for.
 * @returns {string | undefined} The title for the given pathname, or undefined if not found.
 */
export const getHeaderTitle = (pathname: string) => {
  if (pathname in HEADER_TITLE_MAP) {
    return HEADER_TITLE_MAP[pathname as keyof typeof HEADER_TITLE_MAP];
  }

  return Object.entries(HEADER_TITLE_MAP).find(([key]) =>
    pathname.startsWith(key),
  )?.[1];
};

const normalizePathname = (pathname: string) => {
  let p = pathname.replace(/^\/+|\/+$/g, '');

  // Normalize `/profile` → `profile/index`
  if (!p.includes('/') || !p.endsWith('/index')) {
    if (!p.includes('/')) {
      p = `${p}/index`;
    }
  }

  return p;
};

const screenToRegex = (screen: string) =>
  new RegExp(
    '^' + normalizePathname(screen).replace(/\[.*?\]/g, '[^/]+') + '$',
  );

export const isScreenPathname = (pathname: string, screen: string): boolean => {
  return screenToRegex(screen).test(normalizePathname(pathname));
};
