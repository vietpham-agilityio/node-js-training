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
