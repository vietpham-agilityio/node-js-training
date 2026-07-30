export function decodeBase64Key(value?: string): string | undefined {
  return value ? Buffer.from(value, 'base64').toString('utf8') : undefined;
}
